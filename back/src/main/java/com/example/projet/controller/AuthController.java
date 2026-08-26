package com.example.projet.controller;

import com.example.projet.dto.AuthRequest;
import com.example.projet.dto.AuthResponse;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse response = authService.authenticate(authRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/customer")
    public ResponseEntity<AuthResponse> registerCustomer(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @Valid @RequestBody AuthRequest authRequest) {
        User user = authService.register(authRequest, Role.CUSTOMER, firstName, lastName);
        
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/contractor")
    public ResponseEntity<AuthResponse> registerContractor(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @Valid @RequestBody AuthRequest authRequest) {
        User user = authService.register(authRequest, Role.CONTRACTOR, firstName, lastName);
        
        AuthResponse response = new AuthResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }

        String email = authentication.getName();
        User user = authService.getCurrentUser(email);

        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", true);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        response.put("isActive", user.isActive());

        return ResponseEntity.ok(response);
    }
}