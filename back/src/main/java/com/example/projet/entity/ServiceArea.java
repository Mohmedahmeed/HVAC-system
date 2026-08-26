package com.example.projet.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "service_area")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServiceArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    @Column(nullable = false)
    private String zipCode;

    private String city;
    private String state;
}