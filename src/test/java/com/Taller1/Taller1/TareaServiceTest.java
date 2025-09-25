package com.Taller1.Taller1;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.Taller1.Taller1.Entity.Tarea;
import com.Taller1.Taller1.Repository.TareaRepository;
import com.Taller1.Taller1.Service.TareaService;

class TareaServiceTest {

    @Mock
    private TareaRepository tareaRepository;

    @InjectMocks
    private TareaService tareaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void obtenerTodas_debeRetornarListaDeTareas() {
        Tarea tarea1 = new Tarea(1L, "Tarea 1", "Desc 1", LocalDate.now(), "PENDIENTE");
        Tarea tarea2 = new Tarea(2L, "Tarea 2", "Desc 2", LocalDate.now().plusDays(1), "COMPLETADA");
        when(tareaRepository.findAll()).thenReturn(Arrays.asList(tarea1, tarea2));

        List<Tarea> resultado = tareaService.obtenerTodas();

        assertEquals(2, resultado.size());
        verify(tareaRepository, times(1)).findAll();
    }

    @Test
    void obtenerPorId_debeRetornarTareaSiExiste() {
        Tarea tarea = new Tarea(1L, "Tarea 1", "Desc 1", LocalDate.now(), "PENDIENTE");
        when(tareaRepository.findById(1L)).thenReturn(Optional.of(tarea));

        Optional<Tarea> resultado = tareaService.obtenerPorId(1L);

        assertTrue(resultado.isPresent());
        assertEquals("Tarea 1", resultado.get().getTitulo());
    }

    @Test
    void filtrarPorEstado_debeRetornarSoloLasTareasConEseEstado() {
        Tarea tarea = new Tarea(1L, "Tarea 1", "Desc 1", LocalDate.now(), "PENDIENTE");
        when(tareaRepository.findByEstado("PENDIENTE")).thenReturn(List.of(tarea));

        List<Tarea> resultado = tareaService.filtrarPorEstado("PENDIENTE");

        assertEquals(1, resultado.size());
        assertEquals("PENDIENTE", resultado.get(0).getEstado());
    }

    @Test
    void filtrarPorRangoFechas_debeRetornarTareasEnEseRango() {
        LocalDate inicio = LocalDate.of(2025, 9, 1);
        LocalDate fin = LocalDate.of(2025, 9, 30);

        Tarea tarea = new Tarea(1L, "Tarea Rango", "Desc", LocalDate.of(2025, 9, 15), "PENDIENTE");

        when(tareaRepository.findByFechaVencimientoBetween(inicio, fin)).thenReturn(List.of(tarea));

        List<Tarea> resultado = tareaService.filtrarPorRangoFechas(inicio, fin);

        assertEquals(1, resultado.size());
        assertTrue(resultado.get(0).getFechaVencimiento().isAfter(inicio.minusDays(1)));
    }

    @Test
    void filtrarPorSemana_debeRetornarTareasDeLaSemanaIndicada() {
        LocalDate fechaSemana38 = LocalDate.of(2025, 9, 18); // Semana 38

        Tarea tarea = new Tarea(1L, "Tarea Semana 38", "Desc", fechaSemana38, "PENDIENTE");
        when(tareaRepository.findAll()).thenReturn(List.of(tarea));

        List<Tarea> resultado = tareaService.filtrarPorSemana(38);

        assertEquals(1, resultado.size());
        assertEquals("Tarea Semana 38", resultado.get(0).getTitulo());
    }

    @Test
    void actualizarEstado_aCompletadaDebeRegistrarFecha() {
        Tarea tarea = new Tarea(1L, "Tarea 1", "Desc", LocalDate.now(), "PENDIENTE");
        when(tareaRepository.findById(1L)).thenReturn(Optional.of(tarea));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.actualizarEstado(1L, "COMPLETADA");

        assertEquals("COMPLETADA", resultado.getEstado());
        assertNotNull(resultado.getFechaFinalizacion());
        verify(tareaRepository).save(tarea);
    }

    @Test
    void actualizarEstado_aPendienteDebeLimpiarFechaFinalizacion() {
        Tarea tarea = new Tarea(2L, "Tarea 2", "Desc", LocalDate.now(), "COMPLETADA");
        tarea.setFechaFinalizacion(LocalDate.now().minusDays(1));

        when(tareaRepository.findById(2L)).thenReturn(Optional.of(tarea));
        when(tareaRepository.save(any(Tarea.class))).thenAnswer(inv -> inv.getArgument(0));

        Tarea resultado = tareaService.actualizarEstado(2L, "PENDIENTE");

        assertEquals("PENDIENTE", resultado.getEstado());
        assertNull(resultado.getFechaFinalizacion());
    }

    @Test
    void actualizarEstado_siNoExisteDebeLanzarExcepcion() {
        when(tareaRepository.findById(99L)).thenReturn(Optional.empty());

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            tareaService.actualizarEstado(99L, "COMPLETADA");
        });
        assertNotNull(thrown);
    }

}
