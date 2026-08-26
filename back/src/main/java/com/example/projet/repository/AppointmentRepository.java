package com.example.projet.repository;

import com.example.projet.entity.Appointment;
import com.example.projet.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByContractorId(Long contractorId);
    List<Appointment> findByContractorIdAndStatus(Long contractorId, AppointmentStatus status);
    List<Appointment> findByServiceRequestId(Long serviceRequestId);
    List<Appointment> findByScheduledStartBetween(LocalDateTime start, LocalDateTime end);
}