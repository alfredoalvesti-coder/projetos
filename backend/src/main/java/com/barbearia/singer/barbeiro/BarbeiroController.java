package com.barbearia.singer.barbeiro;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.barbearia.singer.barbeiro.dto.BarbeiroRequest;
import com.barbearia.singer.barbeiro.dto.BarbeiroResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/barbeiros")
public class BarbeiroController {

    private final BarbeiroService barbeiroService;

    public BarbeiroController(BarbeiroService barbeiroService) {
        this.barbeiroService = barbeiroService;
    }

    @GetMapping
    public ResponseEntity<List<BarbeiroResponse>> listar() {
        return ResponseEntity.ok(barbeiroService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BarbeiroResponse> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(barbeiroService.buscar(id));
    }

    @PostMapping
    public ResponseEntity<BarbeiroResponse> criar(@Valid @RequestBody BarbeiroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(barbeiroService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BarbeiroResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody BarbeiroRequest request) {
        return ResponseEntity.ok(barbeiroService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        barbeiroService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
