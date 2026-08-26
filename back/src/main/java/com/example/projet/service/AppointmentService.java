package com.example.projet.service;

import com.example.projet.entity.Appointment;
import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.AppointmentStatus;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.AppointmentRepository;
import com.example.projet.repository.ServiceRequestRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRequestRepository serviceRequestRepository;

    public AppointmentService(AppointmentRepository appointmentRepository, 
                             ServiceRequestRepository serviceRequestRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRequestRepository = serviceRequestRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public Appointment createAppointment(Long serviceRequestId, Appointment appointmentDetails) {
        User currentUser = getCurrentUser();
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest not found with id: " + serviceRequestId));
        
        // Only contractors or admins can create appointments
        if (currentUser.getRole() == Role.CONTRACTOR) {
            boolean isAssigned = serviceRequest.getLeadAssignments().stream()
                    .anyMatch(lead -> lead.getContractor().getId().equals(currentUser.getId()) && 
                           lead.getStatus().toString().equals("ACCEPTED"));
            if (!isAssigned)
                throw new UnauthorizedException("You can only create appointments for accepted leads");
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only contractors or admins can create appointments");
        }
        
        Appointment appointment = new Appointment();
        appointment.setServiceRequest(serviceRequest);
        appointment.setContractor(currentUser);
        appointment.setScheduledStart(appointmentDetails.getScheduledStart());
        appointment.setScheduledEnd(appointmentDetails.getScheduledEnd());
        appointment.setNotes(appointmentDetails.getNotes());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        // Update service request status
        serviceRequest.setStatus(com.example.projet.enums.ServiceRequestStatus.SCHEDULED);
        serviceRequestRepository.save(serviceRequest);
        
        return appointmentRepository.save(appointment);
    }

    public Appointment getAppointment(Long id) {
        User currentUser = getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (!appointment.getServiceRequest().getCustomer().getId().equals(currentUser.getId()))
                throw new UnauthorizedException("You can only view your own appointments");
        } else if (currentUser.getRole() == Role.CONTRACTOR) {
            if (!appointment.getContractor().getId().equals(currentUser.getId()))
                throw new UnauthorizedException("You can only view your own appointments");
        }
        
        return appointment;
    }

    public List<Appointment> getMyAppointments() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.CONTRACTOR) {
            return appointmentRepository.findByContractorId(currentUser.getId());
        } else if (currentUser.getRole() == Role.CUSTOMER) {
            // Get appointments for customer's service requests
            List<ServiceRequest> serviceRequests = serviceRequestRepository.findByCustomerId(currentUser.getId());
            return serviceRequests.stream()
                    .flatMap(sr -> appointmentRepository.findByServiceRequestId(sr.getId()).stream())
                    .toList();
        }
        throw new UnauthorizedException("Invalid role");
    }

    public Appointment updateAppointmentStatus(Long id, AppointmentStatus status) {
        User currentUser = getCurrentUser();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        // Only contractor assigned to this appointment or admin can update status
        if (currentUser.getRole() == Role.CONTRACTOR && 
            !appointment.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only update your own appointments");
        
        if (currentUser.getRole() == Role.CUSTOMER)
            throw new UnauthorizedException("Customers cannot update appointment status");
        
        validateStatusTransition(appointment.getStatus(), status);
        
        appointment.setStatus(status);
        if (status == AppointmentStatus.COMPLETED) {
            appointment.setCompletedAt(LocalDateTime.now());
            appointment.getServiceRequest().setStatus(com.example.projet.enums.ServiceRequestStatus.COMPLETED);
            appointment.getServiceRequest().setCompletedAt(LocalDateTime.now());
            serviceRequestRepository.save(appointment.getServiceRequest());
        }
        
        return appointmentRepository.save(appointment);
    }

    private void validateStatusTransition(AppointmentStatus current, AppointmentStatus next) {
        boolean valid = switch (current) {
            case SCHEDULED -> next == AppointmentStatus.COMPLETED || next == AppointmentStatus.CANCELLED || next == AppointmentStatus.NO_SHOW;
            case COMPLETED, CANCELLED, NO_SHOW -> false;
        };
        if (!valid) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + next);
        }
    }
}
