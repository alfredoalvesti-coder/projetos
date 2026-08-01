package com.barbearia.singer.config;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.barbearia.singer.servico.Servico;
import com.barbearia.singer.servico.ServicoRepository;

@Component
@Order(2)
public class ServicoSeed implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ServicoSeed.class);

    private final ServicoRepository servicoRepository;

    public ServicoSeed(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (servicoRepository.count() > 0) {
            return;
        }

        List<Servico> iniciais = List.of(
                criar("Corte clássico", "Acabamento limpo, com máquina e tesoura conforme o estilo.", 40, "45.00"),
                criar("Barba completa", "Modelagem, toalha quente e finalização com produtos premium.", 30, "35.00"),
                criar("Corte + barba", "Combo completo para quem quer sair renovado.", 60, "70.00"),
                criar("Sobrancelha", "Design discreto e alinhado ao rosto.", 15, "20.00"));

        servicoRepository.saveAll(iniciais);
        log.info("Serviços iniciais cadastrados: {}", iniciais.size());
    }

    private Servico criar(String nome, String descricao, int duracaoMinutos, String preco) {
        Servico servico = new Servico();
        servico.setNome(nome);
        servico.setDescricao(descricao);
        servico.setDuracaoMinutos(duracaoMinutos);
        servico.setPreco(new BigDecimal(preco));
        return servico;
    }
}
