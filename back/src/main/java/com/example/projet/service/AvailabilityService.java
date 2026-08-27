package com.example.projet.service;

import com.example.projet.entity.Availability;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.AvailabilityRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public Availability createAvailability(Availability availability) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can manage availability");
        
        availability.setContractor(currentUser);
        return availabilityRepository.save(availability);
    }

    public List<Availability> getMyAvailability() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can view their availability");
        return availabilityRepository.findByContractorId(currentUser.getId());
    }

    public Availability updateAvailability(Long id, Availability availabilityDetails) {
        User currentUser = getCurrentUser();
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found with id: " + id));
        
        if (currentUser.getRole() == Role.CONTRACTOR && 
            !availability.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only update your own availability");
        
        if (currentUser.getRole() == Role.CUSTOMER)
            throw new UnauthorizedException("Customers cannot update availability");
        
        if (availabilityDetails.getDayOfWeek() != null)
            availability.setDayOfWeek(availabilityDetails.getDayOfWeek());
        if (availabilityDetails.getStartTime() != null)
            availability.setStartTime(availabilityDetails.getStartTime());
        if (availabilityDetails.getEndTime() != null)
            availability.setEndTime(availabilityDetails.getEndTime());
        availability.setEmergencyAvailable(availabilityDetails.isEmergencyAvailable());
        
        return availabilityRepository.save(availability);
    }

    public void deleteAvailability(Long id) {
        User currentUser = getCurrentUser();
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability not found with id: " + id));
        
        if (currentUser.getRole() == Role.CONTRACTOR && 
            !availability.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only delete your own availability");
        
        if (currentUser.getRole() == Role.CUSTOMER)
            throw new UnauthorizedException("Customers cannot delete availability");
        
        availabilityRepository.delete(availability);
    }
}
