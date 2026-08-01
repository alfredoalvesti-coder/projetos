package com.barbearia.singer.servico.dto;

import java.math.BigDecimal;

import com.barbearia.singer.servico.Servico;

public class ServicoResponse {

    private final Long id;
    private final String nome;
    private final String descricao;
    private final Integer duracaoMinutos;
    private final BigDecimal preco;

    public ServicoResponse(Servico servico) {
        this.id = servico.getId();
        this.nome = servico.getNome();
        this.descricao = servico.getDescricao();
        this.duracaoMinutos = servico.getDuracaoMinutos();
        this.preco = servico.getPreco();
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public Integer getDuracaoMinutos() {
        return duracaoMinutos;
    }

    public BigDecimal getPreco() {
        return preco;
    }
}
