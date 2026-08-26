package com.example.projet.controller;

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
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN')")
    public ResponseEntity<List<Review>> getContractorReviews(@PathVariable Long contractorId) {
        return ResponseEntity.ok(reviewService.getContractorReviews(contractorId));
    }

    @GetMapping("/my-reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR')")
    public ResponseEntity<List<Review>> getMyReviews() {
        return ResponseEntity.ok(reviewService.getMyReviews());
    }
}
