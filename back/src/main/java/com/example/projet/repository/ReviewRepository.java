package com.example.projet.repository;

import com.example.projet.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByContractorId(Long contractorId);
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByServiceRequestId(Long serviceRequestId);
}