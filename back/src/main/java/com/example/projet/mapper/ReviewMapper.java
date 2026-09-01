package com.example.projet.mapper;

import com.example.projet.dto.PublicReviewResponse;
import com.example.projet.entity.Review;
import org.springframework.stereotype.Component;

/**
 * Maps a Review entity to the public, read-only response shape.
 */
@Component
public class ReviewMapper {

    public PublicReviewResponse toPublicResponse(Review review) {
        PublicReviewResponse response = new PublicReviewResponse();
        response.setId(review.getId());

        PublicReviewResponse.Author customer = new PublicReviewResponse.Author();
        customer.setId(review.getCustomer().getId());
        customer.setFirstName(review.getCustomer().getFirstName());
        customer.setLastName(review.getCustomer().getLastName());
        response.setCustomer(customer);

        PublicReviewResponse.Author contractor = new PublicReviewResponse.Author();
        contractor.setId(review.getContractor().getId());
        contractor.setFirstName(review.getContractor().getFirstName());
        contractor.setLastName(review.getContractor().getLastName());
        response.setContractor(contractor);

        PublicReviewResponse.ProjectRef projectRef = new PublicReviewResponse.ProjectRef();
        projectRef.setId(review.getServiceRequest().getId());
        projectRef.setServiceType(review.getServiceRequest().getServiceType());
        response.setServiceRequest(projectRef);

        response.setOverallRating(review.getOverallRating());
        response.setQualityRating(review.getQualityRating());
        response.setProfessionalismRating(review.getProfessionalismRating());
        response.setPunctualityRating(review.getPunctualityRating());
        response.setCommunicationRating(review.getCommunicationRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}