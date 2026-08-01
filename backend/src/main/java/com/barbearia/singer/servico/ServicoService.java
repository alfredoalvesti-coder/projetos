package com.barbearia.singer.servico;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barbearia.singer.servico.dto.ServicoRequest;
import com.barbearia.singer.servico.dto.ServicoResponse;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    public List<ServicoResponse> listar() {
        return servicoRepository.findAllByOrderByNomeAsc().stream()
                .map(ServicoResponse::new)
                .toList();
    }

    public ServicoResponse buscar(Long id) {
        return new ServicoResponse(buscarEntidade(id));
    }

    public ServicoResponse criar(ServicoRequest request) {
        String nome = request.getNome().trim();
        if (servicoRepository.existsByNomeIgnoreCase(nome)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um serviço com este nome");
        }

        Servico servico = new Servico();
        aplicarDados(servico, request);
        return new ServicoResponse(servicoRepository.save(servico));
    }

    public ServicoResponse atualizar(Long id, ServicoRequest request) {
        Servico servico = buscarEntidade(id);
        String nome = request.getNome().trim();

        if (servicoRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um serviço com este nome");
        }

        aplicarDados(servico, request);
        return new ServicoResponse(servicoRepository.save(servico));
    }

    public void excluir(Long id) {
        if (!servicoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado");
        }
        servicoRepository.deleteById(id);
    }

    private Servico buscarEntidade(Long id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado"));
    }

    private void aplicarDados(Servico servico, ServicoRequest request) {
        servico.setNome(request.getNome().trim());
        servico.setDescricao(request.getDescricao().trim());
        servico.setDuracaoMinutos(request.getDuracaoMinutos());
        servico.setPreco(request.getPreco());
    }
}
