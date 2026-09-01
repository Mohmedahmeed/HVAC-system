package com.example.projet.controller;

import com.example.projet.dto.PublicReviewResponse;
import com.example.projet.entity.Review;
import com.example.projet.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/service-request/{serviceRequestId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> createReview(
            @PathVariable Long serviceRequestId,
            @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.createReview(serviceRequestId, review));
    }

    @GetMapping("/contractor/{contractorId}")
    public ResponseEntity<List<PublicReviewResponse>> getContractorReviews(@PathVariable Long contractorId) {
        // Public, GET-only, read-only. Writes are never exposed here: the
        // SecurityConfig matcher permits only this GET path.
        return ResponseEntity.ok(reviewService.getContractorReviews(contractorId));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR')")
    public ResponseEntity<List<Review>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
}
