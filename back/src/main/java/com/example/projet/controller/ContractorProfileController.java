package com.example.projet.controller;

import com.example.projet.entity.ContractorProfile;
import com.example.projet.service.ContractorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contractor-profile")
public class ContractorProfileController {

    private final ContractorProfileService contractorProfileService;

    public ContractorProfileController(ContractorProfileService contractorProfileService) {
        this.contractorProfileService = contractorProfileService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<ContractorProfile> getMyProfile() {
        return ResponseEntity.ok(contractorProfileService.getMyProfile());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<ContractorProfile> updateMyProfile(@RequestBody ContractorProfile profile) {
        return ResponseEntity.ok(contractorProfileService.updateMyProfile(profile));
    }

    @GetMapping("/{contractorId}")
    public ResponseEntity<ContractorProfile> getContractorProfile(@PathVariable Long contractorId) {
        return ResponseEntity.ok(contractorProfileService.getContractorProfile(contractorId));
    }
}
