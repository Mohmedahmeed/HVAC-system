package com.example.projet.controller;

import com.example.projet.entity.Availability;
import com.example.projet.service.AvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Availability> createAvailability(@RequestBody Availability availability) {
        return ResponseEntity.ok(availabilityService.createAvailability(availability));
    }

    @GetMapping("/my-availability")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<List<Availability>> getMyAvailability() {
        return ResponseEntity.ok(availabilityService.getMyAvailability());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Availability> updateAvailability(
            @PathVariable Long id,
            @RequestBody Availability availability) {
        return ResponseEntity.ok(availabilityService.updateAvailability(id, availability));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.noContent().build();
    }
}
