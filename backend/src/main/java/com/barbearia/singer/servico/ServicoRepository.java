package com.barbearia.singer.servico;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    Optional<Servico> findByNomeIgnoreCase(String nome);

    List<Servico> findAllByOrderByNomeAsc();
}
