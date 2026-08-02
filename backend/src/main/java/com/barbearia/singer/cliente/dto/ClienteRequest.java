package com.barbearia.singer.cliente.dto;

import java.time.LocalDate;

import com.barbearia.singer.user.StatusCliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public class ClienteRequest {

    @NotBlank
    @Size(min = 2, max = 120)
    private String nome;

    @NotBlank
    @Size(max = 30)
    private String telefone;

    @NotBlank
    @Email
    @Size(max = 180)
    private String email;

    @Past
    private LocalDate dataNascimento;

    @Size(max = 1000)
    private String observacoes;

    private StatusCliente status;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public StatusCliente getStatus() {
        return status;
    }

    public void setStatus(StatusCliente status) {
        this.status = status;
    }
}
