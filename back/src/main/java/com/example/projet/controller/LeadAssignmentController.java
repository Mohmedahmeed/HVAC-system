package com.example.projet.controller;

import com.example.projet.entity.LeadAssignment;
import com.example.projet.service.LeadAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leads")
public class LeadAssignmentController {

    private final LeadAssignmentService leadAssignmentService;

    public LeadAssignmentController(LeadAssignmentService leadAssignmentService) {
        this.leadAssignmentService = leadAssignmentService;
    }

@GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN')")
    public ResponseEntity<LeadAssignment> getLeadAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(leadAssignmentService.getLeadAssignment(id));
    }

    @GetMapping("/my-leads")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<List<LeadAssignment>> getMyLeads() {
        return ResponseEntity.ok(leadAssignmentService.getMyLeads());
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<LeadAssignment> acceptLead(@PathVariable Long id) {
        return ResponseEntity.ok(leadAssignmentService.acceptLead(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<LeadAssignment> rejectLead(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(leadAssignmentService.rejectLead(id, reason));
    }
}
