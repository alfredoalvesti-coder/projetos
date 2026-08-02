package com.barbearia.singer.barbeiro;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barbearia.singer.barbeiro.dto.BarbeiroRequest;
import com.barbearia.singer.barbeiro.dto.BarbeiroResponse;

@Service
public class BarbeiroService {

    private final BarbeiroRepository barbeiroRepository;

    public BarbeiroService(BarbeiroRepository barbeiroRepository) {
        this.barbeiroRepository = barbeiroRepository;
    }

    public List<BarbeiroResponse> listar() {
        return barbeiroRepository.findAllByOrderByNomeAsc().stream()
                .map(BarbeiroResponse::new)
                .toList();
    }

    public BarbeiroResponse buscar(Long id) {
        return new BarbeiroResponse(buscarEntidade(id));
    }

    public BarbeiroResponse criar(BarbeiroRequest request) {
        String nome = request.getNome().trim();
        if (barbeiroRepository.existsByNomeIgnoreCase(nome)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um barbeiro com este nome");
        }

        Barbeiro barbeiro = new Barbeiro();
        aplicarDados(barbeiro, request);
        return new BarbeiroResponse(barbeiroRepository.save(barbeiro));
    }

    public BarbeiroResponse atualizar(Long id, BarbeiroRequest request) {
        Barbeiro barbeiro = buscarEntidade(id);
        String nome = request.getNome().trim();

        if (barbeiroRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um barbeiro com este nome");
        }

        aplicarDados(barbeiro, request);
        return new BarbeiroResponse(barbeiroRepository.save(barbeiro));
    }

    public void excluir(Long id) {
        if (!barbeiroRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
        }
        barbeiroRepository.deleteById(id);
    }

    private Barbeiro buscarEntidade(Long id) {
        return barbeiroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado"));
    }

    private void aplicarDados(Barbeiro barbeiro, BarbeiroRequest request) {
        barbeiro.setNome(request.getNome().trim());
        barbeiro.setEspecialidade(request.getEspecialidade().trim());
        barbeiro.setTelefone(request.getTelefone().trim());
        barbeiro.setBio(request.getBio().trim());
    }
}
