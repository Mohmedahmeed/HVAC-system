package com.example.projet.controller;

import com.example.projet.entity.ServiceArea;
import com.example.projet.service.ServiceAreaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service-areas")
public class ServiceAreaController {

    private final ServiceAreaService serviceAreaService;

    public ServiceAreaController(ServiceAreaService serviceAreaService) {
        this.serviceAreaService = serviceAreaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<ServiceArea> createServiceArea(@RequestBody ServiceArea serviceArea) {
        return ResponseEntity.ok(serviceAreaService.createServiceArea(serviceArea));
    }

    @GetMapping("/my-areas")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<List<ServiceArea>> getMyServiceAreas() {
        return ResponseEntity.ok(serviceAreaService.getMyServiceAreas());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Void> deleteServiceArea(@PathVariable Long id) {
        serviceAreaService.deleteServiceArea(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/zip/{zipCode}")
    public ResponseEntity<List<ServiceArea>> findByZipCode(@PathVariable String zipCode) {
        return ResponseEntity.ok(serviceAreaService.findByZipCode(zipCode));
    }
}
