package com.example.projet.repository;

import com.example.projet.entity.ContractorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ContractorProfileRepository extends JpaRepository<ContractorProfile, Long> {
    Optional<ContractorProfile> findByUserId(Long userId);
}