package com.example.projet.entity;

import com.example.projet.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

@Data
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
// Implementing UserDetails directly means the authenticated principal set by
// JwtAuthenticationFilter IS this entity, so every service's
// (User) authentication.getPrincipal() cast works instead of throwing
// ClassCastException against Spring Security's own User class.
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash;

    private String firstName;
    private String lastName;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    private String phone;
    
    @Column(nullable = false)
    private boolean isActive = true;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastLogin;

    // Contractor-specific fields (only for CONTRACTOR role)
    private String siret; // Business registration number
    private boolean estVerifie = false;

    // Relationships
    @JsonIgnore
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ContractorProfile contractorProfile;

    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<ServiceRequest> serviceRequests = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "contractor", cascade = CascadeType.ALL)
    private List<LeadAssignment> leadAssignments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "contractor", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "contractor", cascade = CascadeType.ALL)
    private List<Review> receivedReviews = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Review> givenReviews = new ArrayList<>();

    // --- UserDetails implementation ---
    // (Lombok's @Data still generates getPasswordHash()/isActive()/etc. for
    // the fields; these extra methods just satisfy the interface contract.)

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
