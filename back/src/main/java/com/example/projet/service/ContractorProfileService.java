package com.example.projet.service;

import com.example.projet.entity.ContractorProfile;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.ContractorProfileRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContractorProfileService {

    private final ContractorProfileRepository contractorProfileRepository;

    public ContractorProfileService(ContractorProfileRepository contractorProfileRepository) {
        this.contractorProfileRepository = contractorProfileRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public ContractorProfile getMyProfile() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can view contractor profiles");
        
        return contractorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Contractor profile not found"));
    }

    public ContractorProfile updateMyProfile(ContractorProfile profileDetails) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can update their profile");
        
        ContractorProfile profile = contractorProfileRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Contractor profile not found"));
        
        if (profileDetails.getBusinessName() != null)
            profile.setBusinessName(profileDetails.getBusinessName());
        if (profileDetails.getDescription() != null)
            profile.setDescription(profileDetails.getDescription());
        if (profileDetails.getLicenseNumber() != null)
            profile.setLicenseNumber(profileDetails.getLicenseNumber());
        if (profileDetails.getSpecialties() != null)
            profile.setSpecialties(profileDetails.getSpecialties());
        if (profileDetails.getBaseRate() != null)
            profile.setBaseRate(profileDetails.getBaseRate());
        if (profileDetails.getResponseTimeHours() != null)
            profile.setResponseTimeHours(profileDetails.getResponseTimeHours());
        if (profileDetails.getLogoUrl() != null)
            profile.setLogoUrl(profileDetails.getLogoUrl());
        
        return contractorProfileRepository.save(profile);
    }

public ContractorProfile getContractorProfile(Long contractorId) {
        // Public endpoint - allow anonymous access for contractor profile viewing
        // getCurrentUser() would throw if not authenticated, so we check optionally
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            // Authenticated user - no additional checks needed
        }
        return contractorProfileRepository.findByUserId(contractorId)
                .orElseThrow(() -> new ResourceNotFoundException("Contractor profile not found"));
    }
}
