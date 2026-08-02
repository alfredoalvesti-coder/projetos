package com.barbearia.singer.agendamento;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barbearia.singer.agendamento.dto.AdminAgendamentoRequest;
import com.barbearia.singer.agendamento.dto.AgendamentoResponse;
import com.barbearia.singer.agendamento.dto.CreateAgendamentoRequest;
import com.barbearia.singer.security.UsuarioPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {

    private final AgendamentoService agendamentoService;

    public AgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    @GetMapping
    public ResponseEntity<List<AgendamentoResponse>> listarTodos() {
        return ResponseEntity.ok(agendamentoService.listarTodos());
    }

    @PostMapping("/admin")
    public ResponseEntity<AgendamentoResponse> criarAdmin(@Valid @RequestBody AdminAgendamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.criarAdmin(request));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<AgendamentoResponse> atualizarAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminAgendamentoRequest request) {
        return ResponseEntity.ok(agendamentoService.atualizarAdmin(id, request));
    }

    @PostMapping("/admin/{id}/cancelar")
    public ResponseEntity<AgendamentoResponse> cancelarAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.cancelarAdmin(id));
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponse> criar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @Valid @RequestBody CreateAgendamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendamentoService.criar(principal.getUsuario(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AgendamentoResponse>> meus(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(agendamentoService.listarDoUsuario(principal.getUsuario()));
    }

    @GetMapping("/horarios-ocupados")
    public ResponseEntity<List<String>> horariosOcupados(
            @RequestParam String barbeiro,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) Long ignoreId) {
        return ResponseEntity.ok(agendamentoService.listarHorariosOcupados(barbeiro, data, ignoreId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendamentoResponse> atualizar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreateAgendamentoRequest request) {
        return ResponseEntity.ok(agendamentoService.atualizar(principal.getUsuario(), id, request));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponse> cancelar(
            @AuthenticationPrincipal UsuarioPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(agendamentoService.cancelar(principal.getUsuario(), id));
    }
}
