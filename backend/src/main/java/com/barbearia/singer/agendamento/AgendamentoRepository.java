package com.barbearia.singer.agendamento;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            SELECT a FROM Agendamento a
            JOIN FETCH a.usuario
            WHERE a.usuario = :usuario
            ORDER BY a.data DESC, a.horario DESC
            """)
    List<Agendamento> findByUsuarioOrderByDataDescHorarioDesc(@Param("usuario") Usuario usuario);

    Optional<Agendamento> findByIdAndUsuario(Long id, Usuario usuario);

    @Query("""
            SELECT a FROM Agendamento a
            JOIN FETCH a.usuario
            ORDER BY a.data DESC, a.horario DESC
            """)
    List<Agendamento> findAllWithUsuarioOrderByDataDescHorarioDesc();

    @Query("""
            SELECT a FROM Agendamento a
            JOIN FETCH a.usuario
            WHERE a.id = :id
            """)
    Optional<Agendamento> findByIdWithUsuario(@Param("id") Long id);

    boolean existsByUsuario(Usuario usuario);

    Optional<Agendamento> findFirstByUsuarioAndStatusNotOrderByDataDescHorarioDesc(
            Usuario usuario,
            StatusAgendamento status);
}
