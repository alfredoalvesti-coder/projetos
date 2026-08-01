package com.barbearia.singer.agendamento;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.barbearia.singer.agendamento.dto.AgendamentoResponse;
import com.barbearia.singer.agendamento.dto.CreateAgendamentoRequest;
import com.barbearia.singer.user.Usuario;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    public AgendamentoResponse criar(Usuario usuario, CreateAgendamentoRequest request) {
        validarDataFutura(request.getData(), request.getHorario());
        garantirHorarioLivre(request.getBarbeiro(), request.getData(), request.getHorario(), null);

        Agendamento agendamento = new Agendamento();
        agendamento.setUsuario(usuario);
        aplicarDados(agendamento, request);
        agendamento.setStatus(StatusAgendamento.PENDENTE);

        return new AgendamentoResponse(agendamentoRepository.save(agendamento));
    }

    public List<AgendamentoResponse> listarDoUsuario(Usuario usuario) {
        return agendamentoRepository.findByUsuarioOrderByDataDescHorarioDesc(usuario).stream()
                .map(AgendamentoResponse::new)
                .toList();
    }

    public List<String> listarHorariosOcupados(String barbeiro, LocalDate data, Long ignoreId) {
        return agendamentoRepository
                .findByBarbeiroAndDataAndStatusNot(barbeiro.trim(), data, StatusAgendamento.CANCELADO)
                .stream()
                .filter(item -> ignoreId == null || !item.getId().equals(ignoreId))
                .map(Agendamento::getHorario)
                .distinct()
                .sorted()
                .toList();
    }

    public AgendamentoResponse atualizar(Usuario usuario, Long id, CreateAgendamentoRequest request) {
        Agendamento agendamento = buscarDoUsuario(id, usuario);
        garantirEditavel(agendamento);

        validarDataFutura(request.getData(), request.getHorario());
        garantirHorarioLivre(request.getBarbeiro(), request.getData(), request.getHorario(), id);
        aplicarDados(agendamento, request);

        return new AgendamentoResponse(agendamentoRepository.save(agendamento));
    }

    public AgendamentoResponse cancelar(Usuario usuario, Long id) {
        Agendamento agendamento = buscarDoUsuario(id, usuario);
        garantirEditavel(agendamento);

        agendamento.setStatus(StatusAgendamento.CANCELADO);
        return new AgendamentoResponse(agendamentoRepository.save(agendamento));
    }

    private Agendamento buscarDoUsuario(Long id, Usuario usuario) {
        return agendamentoRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));
    }

    private void garantirEditavel(Agendamento agendamento) {
        if (agendamento.getStatus() == StatusAgendamento.CANCELADO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este agendamento já foi cancelado");
        }

        LocalDate hoje = LocalDate.now();
        if (agendamento.getData().isBefore(hoje)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível alterar agendamentos passados");
        }
        if (agendamento.getData().isEqual(hoje)) {
            LocalTime agora = LocalTime.now();
            LocalTime horario = LocalTime.parse(agendamento.getHorario());
            if (!horario.isAfter(agora)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não é possível alterar agendamentos já iniciados");
            }
        }
    }

    private void validarDataFutura(LocalDate data, String horario) {
        if (data.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A data não pode ser no passado");
        }
        if (data.isEqual(LocalDate.now())) {
            LocalTime hora = LocalTime.parse(horario.trim());
            if (!hora.isAfter(LocalTime.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escolha um horário futuro");
            }
        }
    }

    private void garantirHorarioLivre(String barbeiro, LocalDate data, String horario, Long ignoreId) {
        String barbeiroLimpo = barbeiro.trim();
        String horarioLimpo = horario.trim();
        boolean ocupado = ignoreId == null
                ? agendamentoRepository.existsByBarbeiroAndDataAndHorarioAndStatusNot(
                        barbeiroLimpo, data, horarioLimpo, StatusAgendamento.CANCELADO)
                : agendamentoRepository.existsByBarbeiroAndDataAndHorarioAndStatusNotAndIdNot(
                        barbeiroLimpo, data, horarioLimpo, StatusAgendamento.CANCELADO, ignoreId);

        if (ocupado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Horário já reservado para este barbeiro");
        }
    }

    private void aplicarDados(Agendamento agendamento, CreateAgendamentoRequest request) {
        agendamento.setServico(request.getServico().trim());
        agendamento.setBarbeiro(request.getBarbeiro().trim());
        agendamento.setData(request.getData());
        agendamento.setHorario(request.getHorario().trim());
        agendamento.setObservacao(
                request.getObservacao() == null || request.getObservacao().isBlank()
                        ? null
                        : request.getObservacao().trim());
    }
}
