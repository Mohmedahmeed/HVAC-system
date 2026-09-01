package com.example.projet.service;

import com.example.projet.dto.PublicReviewResponse;
import com.example.projet.entity.Review;
import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.mapper.ReviewMapper;
import com.example.projet.repository.ReviewRepository;
import com.example.projet.repository.ServiceRequestRepository;
import com.example.projet.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    public ReviewService(ReviewRepository reviewRepository, 
                        ServiceRequestRepository serviceRequestRepository,
                        UserRepository userRepository,
                        ReviewMapper reviewMapper) {
        this.reviewRepository = reviewRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
        this.reviewMapper = reviewMapper;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    public Review createReview(Long serviceRequestId, Review reviewDetails) {
        User currentUser = getCurrentUser();
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRequest not found with id: " + serviceRequestId));
        
        // Only customers can create reviews
        if (currentUser.getRole() != Role.CUSTOMER)
            throw new UnauthorizedException("Only customers can create reviews");
        
        // Customer must be the owner of the service request
        if (!serviceRequest.getCustomer().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only review your own service requests");
        
        // Service request must be completed
        if (serviceRequest.getStatus() != ServiceRequestStatus.COMPLETED)
            throw new UnauthorizedException("Can only review completed service requests");
        
        // Check if review already exists
        if (reviewRepository.findByServiceRequestId(serviceRequestId).stream()
                .anyMatch(r -> r.getCustomer().getId().equals(currentUser.getId())))
            throw new UnauthorizedException("You have already reviewed this service request");
        
        // Validate ratings (1-5)
        validateRating(reviewDetails.getOverallRating());
        validateRating(reviewDetails.getQualityRating());
        validateRating(reviewDetails.getProfessionalismRating());
        validateRating(reviewDetails.getPunctualityRating());
        validateRating(reviewDetails.getCommunicationRating());
        
        Review review = new Review();
        review.setCustomer(currentUser);
        review.setContractor(serviceRequest.getLeadAssignments().stream()
                .filter(lead -> lead.getStatus().toString().equals("ACCEPTED"))
                .findFirst()
                .map(lead -> lead.getContractor())
                .orElseThrow(() -> new ResourceNotFoundException("No contractor found for this service request")));
        review.setServiceRequest(serviceRequest);
        review.setOverallRating(reviewDetails.getOverallRating());
        review.setQualityRating(reviewDetails.getQualityRating());
        review.setProfessionalismRating(reviewDetails.getProfessionalismRating());
        review.setPunctualityRating(reviewDetails.getPunctualityRating());
        review.setCommunicationRating(reviewDetails.getCommunicationRating());
        review.setComment(reviewDetails.getComment());
        review.setCreatedAt(LocalDateTime.now());
        
        // Update contractor's average rating
        User contractor = review.getContractor();
        List<Review> contractorReviews = reviewRepository.findByContractorId(contractor.getId());
        double averageRating = contractorReviews.stream()
                .mapToInt(Review::getOverallRating)
                .average()
                .orElse(0.0);
        contractor.getContractorProfile().setAverageRating(averageRating);
        contractor.getContractorProfile().setTotalReviews(contractorReviews.size());
        userRepository.save(contractor);
        
        return reviewRepository.save(review);
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5)
            throw new IllegalArgumentException("Rating must be between 1 and 5");
    }

public List<PublicReviewResponse> getContractorReviews(Long contractorId) {
        // Public, read-only endpoint: no authentication required and only
        // the DTO (no PII) is exposed. Security is enforced at the filter
        // chain level via the GET-only matcher.
        return reviewRepository.findByContractorId(contractorId).stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
    }

    public List<Review> getMyReviews() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.CUSTOMER) {
            return reviewRepository.findByCustomerId(currentUser.getId());
        } else if (currentUser.getRole() == Role.CONTRACTOR) {
            return reviewRepository.findByContractorId(currentUser.getId());
        }
        throw new UnauthorizedException("Invalid role");
    }
}
