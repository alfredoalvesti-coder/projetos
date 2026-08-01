package com.barbearia.singer.agendamento.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.barbearia.singer.agendamento.Agendamento;
import com.barbearia.singer.agendamento.StatusAgendamento;

public class AgendamentoResponse {

    private Long id;
    private String servico;
    private String barbeiro;
    private LocalDate data;
    private String horario;
    private String observacao;
    private StatusAgendamento status;
    private Instant criadoEm;

    public AgendamentoResponse() {
    }

    public AgendamentoResponse(Agendamento agendamento) {
        this.id = agendamento.getId();
        this.servico = agendamento.getServico();
        this.barbeiro = agendamento.getBarbeiro();
        this.data = agendamento.getData();
        this.horario = agendamento.getHorario();
        this.observacao = agendamento.getObservacao();
        this.status = agendamento.getStatus();
        this.criadoEm = agendamento.getCriadoEm();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(Instant criadoEm) {
        this.criadoEm = criadoEm;
    }
}
