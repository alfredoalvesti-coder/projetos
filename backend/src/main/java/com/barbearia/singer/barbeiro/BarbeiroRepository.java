package com.barbearia.singer.barbeiro;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BarbeiroRepository extends JpaRepository<Barbeiro, Long> {

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    Optional<Barbeiro> findByNomeIgnoreCase(String nome);

    List<Barbeiro> findAllByOrderByNomeAsc();
}
