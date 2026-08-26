package com.example.projet.service;

import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.ServiceRequestRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (User) authentication.getPrincipal();
    }

    public ServiceRequest createServiceRequest(ServiceRequest serviceRequest) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CUSTOMER) {
            throw new UnauthorizedException("Only customers can create service requests");
        }
        serviceRequest.setCustomer(currentUser);
        serviceRequest.setStatus(ServiceRequestStatus.NEW);
        serviceRequest.setCreatedAt(LocalDateTime.now());
        
        if (serviceRequest.getServiceType() == null || serviceRequest.getServiceType().isBlank())
            throw new IllegalArgumentException("Service type is required");
        if (serviceRequest.getProblemDescription() == null || serviceRequest.getProblemDescription().isBlank())
            throw new IllegalArgumentException("Problem description is required");
        if (serviceRequest.getUrgency() == null)
            throw new IllegalArgumentException("Urgency is required");
        if (serviceRequest.getZipCode() == null || serviceRequest.getZipCode().isBlank())
            throw new IllegalArgumentException("ZIP code is required");
        if (!serviceRequest.getZipCode().matches("\\d{5}"))
            throw new IllegalArgumentException("Invalid ZIP code format");
        
        return serviceRequestRepository.save(serviceRequest);
    }

    public ServiceRequest getServiceRequest(Long id) {
        User currentUser = getCurrentUser();
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest not found with id: " + id));
        
        if (currentUser.getRole() == Role.CUSTOMER && 
            !serviceRequest.getCustomer().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only view your own service requests");
        
        if (currentUser.getRole() == Role.CONTRACTOR) {
            boolean isAssigned = serviceRequest.getLeadAssignments().stream()
                    .anyMatch(lead -> lead.getContractor().getId().equals(currentUser.getId()));
            if (!isAssigned)
                throw new UnauthorizedException("You are not assigned to this service request");
        }
        
        return serviceRequest;
    }

    public List<ServiceRequest> getMyServiceRequests() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CUSTOMER)
            throw new UnauthorizedException("Only customers can view their service requests");
        return serviceRequestRepository.findByCustomerId(currentUser.getId());
    }

    public ServiceRequest updateServiceRequest(Long id, ServiceRequest serviceRequestDetails) {
        User currentUser = getCurrentUser();
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest not found with id: " + id));
        
        if (currentUser.getRole() == Role.CUSTOMER && 
            !serviceRequest.getCustomer().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only update your own service requests");
        
        if (currentUser.getRole() == Role.CONTRACTOR) {
            boolean isAssignedWithAcceptedLead = serviceRequest.getLeadAssignments().stream()
                    .anyMatch(lead -> lead.getContractor().getId().equals(currentUser.getId()) && 
                           lead.getStatus().toString().equals("ACCEPTED"));
            if (!isAssignedWithAcceptedLead)
                throw new UnauthorizedException("You can only update service requests where you have an accepted lead");
        }
        
        if (serviceRequest.getStatus() != ServiceRequestStatus.NEW && 
            currentUser.getRole() == Role.CUSTOMER)
            throw new UnauthorizedException("Cannot update service request after it has been processed");
        
        if (serviceRequestDetails.getStatus() == ServiceRequestStatus.CANCELLED && 
            currentUser.getRole() == Role.CUSTOMER) {
            serviceRequest.setStatus(ServiceRequestStatus.CANCELLED);
            serviceRequest.setCompletedAt(LocalDateTime.now());
        }
        
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.CONTRACTOR) {
            if (serviceRequestDetails.getEstimatedPrice() != null)
                serviceRequest.setEstimatedPrice(serviceRequestDetails.getEstimatedPrice());
        }
        
        return serviceRequestRepository.save(serviceRequest);
    }

    public List<ServiceRequest> getAllServiceRequests() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN)
            throw new UnauthorizedException("Only admins can view all service requests");
        return serviceRequestRepository.findAll();
    }
}
