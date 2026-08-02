package com.barbearia.singer.agendamento;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.barbearia.singer.user.Usuario;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    boolean existsByBarbeiroAndDataAndHorarioAndStatusNot(
            String barbeiro,
            LocalDate data,
            String horario,
            StatusAgendamento status);

    boolean existsByBarbeiroAndDataAndHorarioAndStatusNotAndIdNot(
            String barbeiro,
            LocalDate data,
            String horario,
            StatusAgendamento status,
            Long id);

    List<Agendamento> findByBarbeiroAndDataAndStatusNot(
            String barbeiro,
            LocalDate data,
            StatusAgendamento status);

    List<Agendamento> findByUsuarioOrderByDataDescHorarioDesc(Usuario usuario);

    Optional<Agendamento> findByIdAndUsuario(Long id, Usuario usuario);

    boolean existsByUsuario(Usuario usuario);

    Optional<Agendamento> findFirstByUsuarioAndStatusNotOrderByDataDescHorarioDesc(
            Usuario usuario,
            StatusAgendamento status);
}
