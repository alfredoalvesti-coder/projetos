package com.barbearia.singer.agendamento.dto;

import java.time.LocalDate;

import com.barbearia.singer.agendamento.StatusAgendamento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AdminAgendamentoRequest {

    @NotNull
    private Long clienteId;

    @NotBlank
    @Size(max = 80)
    private String servico;

    @NotBlank
    @Size(max = 80)
    private String barbeiro;

    @NotNull
    private LocalDate data;

    @NotBlank
    @Size(max = 5)
    private String horario;

    @Size(max = 500)
    private String observacao;

    private StatusAgendamento status;

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getServico() {
        return servico;
    }

    public void setServico(String servico) {
        this.servico = servico;
    }

    public String getBarbeiro() {
        return barbeiro;
    }

    public void setBarbeiro(String barbeiro) {
        this.barbeiro = barbeiro;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public StatusAgendamento getStatus() {
        return status;
    }

    public void setStatus(StatusAgendamento status) {
        this.status = status;
    }
}
