package com.barbearia.singer.cliente.dto;

import java.time.LocalDate;

import com.barbearia.singer.user.StatusCliente;
import com.barbearia.singer.user.Usuario;

public class ClienteResponse {

    private final Long id;
    private final String nome;
    private final String telefone;
    private final String email;
    private final LocalDate dataNascimento;
    private final String observacoes;
    private final StatusCliente status;
    private final LocalDate ultimoAgendamento;
    private final String ultimoAgendamentoHorario;

    public ClienteResponse(Usuario usuario, LocalDate ultimoAgendamento, String ultimoAgendamentoHorario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.telefone = usuario.getTelefone();
        this.email = usuario.getEmail();
        this.dataNascimento = usuario.getDataNascimento();
        this.observacoes = usuario.getObservacoes();
        this.status = usuario.getStatus() != null ? usuario.getStatus() : StatusCliente.ATIVO;
        this.ultimoAgendamento = ultimoAgendamento;
        this.ultimoAgendamentoHorario = ultimoAgendamentoHorario;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getEmail() {
        return email;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public StatusCliente getStatus() {
        return status;
    }

    public LocalDate getUltimoAgendamento() {
        return ultimoAgendamento;
    }

    public String getUltimoAgendamentoHorario() {
        return ultimoAgendamentoHorario;
    }
}
