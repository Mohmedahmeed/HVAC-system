package com.example.projet.repository;

import com.example.projet.entity.ServiceRequest;
import com.example.projet.enums.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByCustomerId(Long customerId);
    List<ServiceRequest> findByStatus(ServiceRequestStatus status);
    List<ServiceRequest> findByZipCodeAndStatus(String zipCode, ServiceRequestStatus status);
}