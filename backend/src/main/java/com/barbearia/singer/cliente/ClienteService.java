package com.barbearia.singer.cliente;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barbearia.singer.agendamento.AgendamentoRepository;
import com.barbearia.singer.agendamento.StatusAgendamento;
import com.barbearia.singer.cliente.dto.ClienteRequest;
import com.barbearia.singer.cliente.dto.ClienteResponse;
import com.barbearia.singer.user.Role;
import com.barbearia.singer.user.StatusCliente;
import com.barbearia.singer.user.Usuario;
import com.barbearia.singer.user.UsuarioRepository;

@Service
public class ClienteService {

    private final UsuarioRepository usuarioRepository;
    private final AgendamentoRepository agendamentoRepository;

    public ClienteService(
            UsuarioRepository usuarioRepository,
            AgendamentoRepository agendamentoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.agendamentoRepository = agendamentoRepository;
    }

    public List<ClienteResponse> listar() {
        return usuarioRepository.findByRoleOrderByNomeAsc(Role.CLIENTE).stream()
                .map(this::toResponse)
                .toList();
    }

    public ClienteResponse buscar(Long id) {
        return toResponse(buscarCliente(id));
    }

    public ClienteResponse criar(ClienteRequest request) {
        String email = exigirEmail(request.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        Usuario cliente = new Usuario();
        aplicarDados(cliente, request, email);
        // Sem senha ainda: o cliente define/recupera depois pelo e-mail no site
        cliente.setSenha(null);
        cliente.setRole(Role.CLIENTE);
        if (cliente.getStatus() == null) {
            cliente.setStatus(StatusCliente.ATIVO);
        }

        return toResponse(usuarioRepository.save(cliente));
    }

    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Usuario cliente = buscarCliente(id);
        String email = exigirEmail(request.getEmail());

        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        aplicarDados(cliente, request, email);
        return toResponse(usuarioRepository.save(cliente));
    }

    public void excluir(Long id) {
        Usuario cliente = buscarCliente(id);

        if (agendamentoRepository.existsByUsuario(cliente)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível excluir cliente com agendamentos vinculados");
        }

        usuarioRepository.delete(cliente);
    }

    private void aplicarDados(Usuario cliente, ClienteRequest request, String email) {
        cliente.setNome(request.getNome().trim());
        cliente.setTelefone(request.getTelefone().trim());
        cliente.setEmail(email);
        cliente.setDataNascimento(request.getDataNascimento());
        cliente.setObservacoes(
                request.getObservacoes() == null || request.getObservacoes().isBlank()
                        ? null
                        : request.getObservacoes().trim());
        if (request.getStatus() != null) {
            cliente.setStatus(request.getStatus());
        } else if (cliente.getStatus() == null) {
            cliente.setStatus(StatusCliente.ATIVO);
        }
    }

    private String exigirEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail é obrigatório");
        }
        return email.trim().toLowerCase();
    }

    private ClienteResponse toResponse(Usuario cliente) {
        return agendamentoRepository
                .findFirstByUsuarioAndStatusNotOrderByDataDescHorarioDesc(cliente, StatusAgendamento.CANCELADO)
                .map(agendamento -> new ClienteResponse(
                        cliente,
                        agendamento.getData(),
                        agendamento.getHorario()))
                .orElseGet(() -> new ClienteResponse(cliente, null, null));
    }

    private Usuario buscarCliente(Long id) {
        return usuarioRepository.findByIdAndRole(id, Role.CLIENTE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }
}
