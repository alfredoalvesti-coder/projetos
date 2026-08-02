package com.barbearia.singer.barbeiro.dto;

import com.barbearia.singer.barbeiro.Barbeiro;

public class BarbeiroResponse {

    private final Long id;
    private final String nome;
    private final String especialidade;
    private final String telefone;
    private final String bio;

    public BarbeiroResponse(Barbeiro barbeiro) {
        this.id = barbeiro.getId();
        this.nome = barbeiro.getNome();
        this.especialidade = barbeiro.getEspecialidade();
        this.telefone = barbeiro.getTelefone();
        this.bio = barbeiro.getBio();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getBio() {
        return bio;
    }
}
