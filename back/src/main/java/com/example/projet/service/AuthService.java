package com.example.projet.service;

import com.example.projet.dto.AuthRequest;
import com.example.projet.dto.AuthResponse;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.repository.UserRepository;
import com.example.projet.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse authenticate(AuthRequest authRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authRequest.getEmail(),
                        authRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow();
        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFirstName(), user.getLastName(), user.getRole());
    }

    public User register(AuthRequest authRequest, Role role, String firstName, String lastName) {
        if (userRepository.existsByEmail(authRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(authRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(authRequest.getPassword()));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setActive(true);

        return userRepository.save(user);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}