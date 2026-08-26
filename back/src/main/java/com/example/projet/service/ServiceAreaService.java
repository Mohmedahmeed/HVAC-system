package com.example.projet.service;

import com.example.projet.entity.ServiceArea;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.ServiceAreaRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ServiceAreaService {

    private final ServiceAreaRepository serviceAreaRepository;

    public ServiceAreaService(ServiceAreaRepository serviceAreaRepository) {
        this.serviceAreaRepository = serviceAreaRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public ServiceArea createServiceArea(ServiceArea serviceArea) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can manage service areas");
        
        serviceArea.setContractor(currentUser);
        
        if (serviceArea.getZipCode() == null || serviceArea.getZipCode().isBlank())
            throw new IllegalArgumentException("ZIP code is required");
        if (!serviceArea.getZipCode().matches("\\d{5}"))
            throw new IllegalArgumentException("Invalid ZIP code format");
        
        return serviceAreaRepository.save(serviceArea);
    }

    public List<ServiceArea> getMyServiceAreas() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can view their service areas");
        return serviceAreaRepository.findByContractorId(currentUser.getId());
    }

    public void deleteServiceArea(Long id) {
        User currentUser = getCurrentUser();
        ServiceArea serviceArea = serviceAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found with id: " + id));
        
        if (currentUser.getRole() == Role.CONTRACTOR && 
            !serviceArea.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only delete your own service areas");
        
        if (currentUser.getRole() == Role.CUSTOMER)
            throw new UnauthorizedException("Customers cannot delete service areas");
        
        serviceAreaRepository.delete(serviceArea);
    }

public List<ServiceArea> findByZipCode(String zipCode) {
        // Public endpoint - no authentication required for contractor matching
        return serviceAreaRepository.findByZipCode(zipCode);
    }
}
