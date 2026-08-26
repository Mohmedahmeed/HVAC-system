package com.example.projet.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "contractor_profile")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ContractorProfile {
    @Id
    private Long userId; // One-to-one with User

    @JsonIgnore
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String businessName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String licenseNumber;
    private String insuranceProvider;
    private LocalDate insuranceExpiry;
    
    @Column(columnDefinition = "TEXT")
    private String specialties; // JSON array of services
    
    private Double baseRate;
    private Integer responseTimeHours;
    
    @Column(nullable = false)
    private boolean acceptsEmergency = false;
    
    private String logoUrl;
    
    @Column(nullable = false)
    private double averageRating = 0.0;
    
    @Column(nullable = false)
    private int totalReviews = 0;
    
    private boolean isVerified = false;
}