package com.example.projet.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "portfolio_item")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String serviceType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String problemDescription;

    @Column(columnDefinition = "TEXT")
    private String solutionDescription;

    private String beforePhotoUrl;
    private String afterPhotoUrl;
    private String wipPhotoUrl;
    private String location;

    private LocalDate completionDate;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}