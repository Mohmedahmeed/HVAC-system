package com.example.projet.controller;

import com.example.projet.entity.ServiceRequest;
import com.example.projet.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service-requests")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ServiceRequest> createServiceRequest(@RequestBody ServiceRequest serviceRequest) {
        ServiceRequest created = serviceRequestService.createServiceRequest(serviceRequest);
        return ResponseEntity.ok(created);
    }

@GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN')")
    public ResponseEntity<ServiceRequest> getServiceRequest(@PathVariable Long id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequest(id));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ServiceRequest>> getMyServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getMyServiceRequests());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN')")
    public ResponseEntity<ServiceRequest> updateServiceRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequest serviceRequest) {
        return ResponseEntity.ok(serviceRequestService.updateServiceRequest(id, serviceRequest));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceRequest>> getAllServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequests());
    }
}
