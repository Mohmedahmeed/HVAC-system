package com.example.projet.repository;

import com.example.projet.entity.LeadAssignment;
import com.example.projet.enums.LeadAssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeadAssignmentRepository extends JpaRepository<LeadAssignment, Long> {
    List<LeadAssignment> findByContractorId(Long contractorId);
    List<LeadAssignment> findByServiceRequestId(Long serviceRequestId);
    List<LeadAssignment> findByContractorIdAndStatus(Long contractorId, LeadAssignmentStatus status);
}