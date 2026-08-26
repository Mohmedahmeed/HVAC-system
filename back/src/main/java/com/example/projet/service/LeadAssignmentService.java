package com.example.projet.service;

import com.example.projet.entity.LeadAssignment;
import com.example.projet.entity.User;
import com.example.projet.enums.LeadAssignmentStatus;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.LeadAssignmentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class LeadAssignmentService {

    private final LeadAssignmentRepository leadAssignmentRepository;

    public LeadAssignmentService(LeadAssignmentRepository leadAssignmentRepository) {
        this.leadAssignmentRepository = leadAssignmentRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public LeadAssignment getLeadAssignment(Long id) {
        User currentUser = getCurrentUser();
        LeadAssignment lead = leadAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead assignment not found with id: " + id));
        
        if (currentUser.getRole() == Role.CONTRACTOR && 
            !lead.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only view your own lead assignments");
        
        if (currentUser.getRole() == Role.CUSTOMER) {
            if (!lead.getServiceRequest().getCustomer().getId().equals(currentUser.getId()))
                throw new UnauthorizedException("You can only view leads for your own service requests");
        }
        
        return lead;
    }

    public List<LeadAssignment> getMyLeads() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can view their leads");
        return leadAssignmentRepository.findByContractorId(currentUser.getId());
    }

    public LeadAssignment acceptLead(Long id) {
        User currentUser = getCurrentUser();
        LeadAssignment lead = leadAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead assignment not found with id: " + id));
        
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can accept leads");
        
        if (!lead.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only accept leads assigned to you");
        
        lead.setStatus(LeadAssignmentStatus.ACCEPTED);
        lead.setRespondedAt(LocalDateTime.now());
        return leadAssignmentRepository.save(lead);
    }

    public LeadAssignment rejectLead(Long id, String reason) {
        User currentUser = getCurrentUser();
        LeadAssignment lead = leadAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead assignment not found with id: " + id));
        
        if (currentUser.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can reject leads");
        
        if (!lead.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only reject leads assigned to you");
        
        lead.setStatus(LeadAssignmentStatus.REJECTED);
        lead.setRespondedAt(LocalDateTime.now());
        lead.setContractorNotes(reason);
        return leadAssignmentRepository.save(lead);
    }
}
