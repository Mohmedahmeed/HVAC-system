package com.example.projet.entity;

import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.enums.Urgency;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "service_request")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServiceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private String serviceType; // "ac-repair", "ac-install", "heating-repair", etc.

    @Column(nullable = false, columnDefinition = "TEXT")
    private String problemDescription;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Urgency urgency;

    private String propertyType; // "residential", "commercial"
    private Integer squareFootage;
    private String hvacSystemType; // "central", "window", "ductless", "heat-pump"

    @Column(nullable = false)
    private String zipCode;

    private String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ServiceRequestStatus status = ServiceRequestStatus.NEW;

    private Double estimatedPrice;
    private LocalDateTime preferredDate;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    // Optional photo upload (URL or base64 encoded)
    private String photoUrl;

    @JsonIgnore
    @OneToMany(mappedBy = "serviceRequest", cascade = CascadeType.ALL)
    private List<LeadAssignment> leadAssignments = new ArrayList<>();
}
