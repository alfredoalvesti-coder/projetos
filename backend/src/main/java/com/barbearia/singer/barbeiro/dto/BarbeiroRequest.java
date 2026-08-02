package com.barbearia.singer.barbeiro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BarbeiroRequest {

    @NotBlank
    @Size(max = 80)
    private String nome;

    @NotBlank
    @Size(max = 120)
    private String especialidade;

    @NotBlank
    @Size(max = 30)
    private String telefone;

    @NotBlank
    @Size(max = 500)
    private String bio;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
