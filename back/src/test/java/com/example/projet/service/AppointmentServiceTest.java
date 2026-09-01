package com.example.projet.service;

import com.example.projet.entity.Appointment;
import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.AppointmentStatus;
import com.example.projet.enums.Role;
import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.AppointmentRepository;
import com.example.projet.repository.ServiceRequestRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;
    @Mock
    private ServiceRequestRepository serviceRequestRepository;

    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        appointmentService = new AppointmentService(appointmentRepository, serviceRequestRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private User customer(Long id) {
        User user = new User();
        user.setId(id);
        user.setRole(Role.CUSTOMER);
        return user;
    }

    private User contractor(Long id) {
        User user = new User();
        user.setId(id);
        user.setRole(Role.CONTRACTOR);
        return user;
    }

    private ServiceRequest serviceRequest(Long id, User owner) {
        ServiceRequest sr = new ServiceRequest();
        sr.setId(id);
        sr.setCustomer(owner);
        sr.setStatus(ServiceRequestStatus.SCHEDULED);
        return sr;
    }

    private Appointment appointment(Long id, ServiceRequest sr, LocalDateTime start) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setServiceRequest(sr);
        appointment.setContractor(contractor(99L));
        appointment.setScheduledStart(start);
        appointment.setScheduledEnd(start.plusHours(2));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        return appointment;
    }

    // ────────────────────────── Cancellation ──────────────────────────

    @Test
    void cancelByCustomer_whenNotOwner_throwsUnauthorized() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(2L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(UnauthorizedException.class, () -> appointmentService.cancelByCustomer(100L));
        verify(appointmentRepository, never()).save(any());
        verify(serviceRequestRepository, never()).save(any());
    }

    @Test
    void cancelByCustomer_whenNotCustomerRole_throwsUnauthorized() {
        authenticate(contractor(99L));

        assertThrows(UnauthorizedException.class, () -> appointmentService.cancelByCustomer(100L));
    }

    @Test
    void cancelByCustomer_within24Hours_throwsIllegalState() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusHours(12));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.cancelByCustomer(100L));

        appointment.setScheduledStart(LocalDateTime.now().plusHours(23));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        assertThrows(IllegalStateException.class, () -> appointmentService.cancelByCustomer(100L));
    }

    @Test
    void cancelByCustomer_whenNotScheduled_throwsIllegalState() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.cancelByCustomer(100L));
    }

    @Test
    void cancelByCustomer_success_cancelsAppointmentAndServiceRequest() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        Appointment result = appointmentService.cancelByCustomer(100L);

        assertEquals(AppointmentStatus.CANCELLED, result.getStatus());
        assertEquals(ServiceRequestStatus.CANCELLED, sr.getStatus());
        verify(appointmentRepository).save(appointment);
        verify(serviceRequestRepository).save(sr);
    }

    // ────────────────────────── Reschedule ──────────────────────────

    @Test
    void reschedule_whenNotOwner_throwsUnauthorized() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(2L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(UnauthorizedException.class,
                () -> appointmentService.reschedule(100L, LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(5).plusHours(2)));
    }

    @Test
    void reschedule_whenNotCustomerRole_throwsUnauthorized() {
        authenticate(contractor(99L));

        assertThrows(UnauthorizedException.class,
                () -> appointmentService.reschedule(100L, LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(5).plusHours(2)));
    }

    @Test
    void reschedule_whenNotScheduled_throwsIllegalState() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        appointment.setStatus(AppointmentStatus.CANCELLED);
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class,
                () -> appointmentService.reschedule(100L, LocalDateTime.now().plusDays(5), LocalDateTime.now().plusDays(5).plusHours(2)));
    }

    @Test
    void reschedule_whenStartInPast_throwsIllegalArgument() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalArgumentException.class,
                () -> appointmentService.reschedule(100L, LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusHours(2)));
    }

    @Test
    void reschedule_whenEndBeforeOrEqualToStart_throwsIllegalArgument() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));

        LocalDateTime start = LocalDateTime.now().plusDays(5);
        assertThrows(IllegalArgumentException.class,
                () -> appointmentService.reschedule(100L, start, start));
        assertThrows(IllegalArgumentException.class,
                () -> appointmentService.reschedule(100L, start, start.minusMinutes(30)));
    }

    @Test
    void reschedule_success_updatesTimesAndKeepsStatus() {
        User current = customer(1L);
        authenticate(current);
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(3));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        LocalDateTime newStart = LocalDateTime.now().plusDays(5);
        LocalDateTime newEnd = newStart.plusHours(3);
        Appointment result = appointmentService.reschedule(100L, newStart, newEnd);

        assertEquals(newStart, result.getScheduledStart());
        assertEquals(newEnd, result.getScheduledEnd());
        assertEquals(AppointmentStatus.SCHEDULED, result.getStatus());
        verify(appointmentRepository).save(appointment);
        verify(serviceRequestRepository, never()).save(any());
    }

    // ──────────────────── Status / consistency ────────────────────

    @Test
    void updateAppointmentStatus_toCancelled_alsoCancelsServiceRequest() {
        authenticate(contractor(99L));
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().plusDays(1));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        appointmentService.updateAppointmentStatus(100L, AppointmentStatus.CANCELLED);

        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
        assertEquals(ServiceRequestStatus.CANCELLED, sr.getStatus());
        verify(serviceRequestRepository).save(sr);
    }

    @Test
    void updateAppointmentStatus_toCompleted_keepsServiceRequestCompleted() {
        authenticate(contractor(99L));
        ServiceRequest sr = serviceRequest(10L, customer(1L));
        Appointment appointment = appointment(100L, sr, LocalDateTime.now().minusDays(1));
        when(appointmentRepository.findById(100L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);

        appointmentService.updateAppointmentStatus(100L, AppointmentStatus.COMPLETED);

        assertEquals(AppointmentStatus.COMPLETED, appointment.getStatus());
        assertEquals(ServiceRequestStatus.COMPLETED, sr.getStatus());
        verify(serviceRequestRepository).save(sr);
    }
}