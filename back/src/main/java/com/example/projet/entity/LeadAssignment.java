package com.example.projet.entity;

import com.example.projet.enums.LeadAssignmentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "lead_assignment")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LeadAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id", nullable = false)
    private ServiceRequest serviceRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private LeadAssignmentStatus status = LeadAssignmentStatus.SENT;

    @Column(nullable = false)
    private LocalDateTime sentAt = LocalDateTime.now();

    private LocalDateTime respondedAt;
    private Double quotedPrice;
    
    @Column(columnDefinition = "TEXT")
    private String contractorNotes;
}