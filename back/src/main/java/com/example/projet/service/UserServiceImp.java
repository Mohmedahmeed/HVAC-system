package com.example.projet.service;

import com.example.projet.entity.User;
import com.example.projet.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImp implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User createUser(User user) {
        if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(null);
    }

    @Override
    public User updateUser(Long id, User user) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            if (user.getFirstName() != null)
                existingUser.setFirstName(user.getFirstName());
            if (user.getLastName() != null)
                existingUser.setLastName(user.getLastName());
            if (user.getEmail() != null)
                existingUser.setEmail(user.getEmail());
            if (user.getPhone() != null)
                existingUser.setPhone(user.getPhone());
            if (user.getSiret() != null)
                existingUser.setSiret(user.getSiret());
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
