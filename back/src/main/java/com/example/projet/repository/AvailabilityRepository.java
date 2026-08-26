package com.example.projet.repository;

import com.example.projet.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByContractorId(Long contractorId);
    List<Availability> findByContractorIdAndIsEmergencyAvailableTrue(Long contractorId);
}