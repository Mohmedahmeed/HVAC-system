package com.example.projet.repository;

import com.example.projet.entity.ServiceArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceAreaRepository extends JpaRepository<ServiceArea, Long> {
    List<ServiceArea> findByContractorId(Long contractorId);
    List<ServiceArea> findByZipCode(String zipCode);
}