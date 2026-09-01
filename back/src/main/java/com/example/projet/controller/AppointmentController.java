package com.example.projet.controller;

import com.example.projet.dto.RescheduleRequest;
import com.example.projet.entity.Appointment;
import com.example.projet.enums.AppointmentStatus;
import com.example.projet.service.AppointmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/service-request/{serviceRequestId}")
    @PreAuthorize("hasRole('CONTRACTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> createAppointment(
            @PathVariable Long serviceRequestId,
            @RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.createAppointment(serviceRequestId, appointment));
    }

@GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN')")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointment(id));
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR')")
    public ResponseEntity<List<Appointment>> getMyAppointments() {
        return ResponseEntity.ok(appointmentService.getMyAppointments());
    }

@PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelByCustomer(id));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.reschedule(id, request.getScheduledStart(), request.getScheduledEnd()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('CONTRACTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }
}
