package com.example.projet.controller;

import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.repository.ServiceRequestRepository;
import com.example.projet.repository.UserRepository;
import com.example.projet.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("demo")
class AuthAndAccessIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private String authHeader(String email) {
        return "Bearer " + tokenProvider.generateTokenFromUsername(email);
    }

    private HttpHeaders headers(String token) {
        HttpHeaders headers = new HttpHeaders();
        if (token != null) {
            headers.set(HttpHeaders.AUTHORIZATION, token);
        }
        return headers;
    }

    private ResponseEntity<String> get(String path, String token) {
        return restTemplate.exchange(baseUrl() + path, HttpMethod.GET,
                new HttpEntity<>(headers(token)), String.class);
    }

    private ResponseEntity<String> postJson(String path, String token, String body) {
        HttpHeaders headers = headers(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.exchange(baseUrl() + path, HttpMethod.POST,
                new HttpEntity<>(body, headers), String.class);
    }

    private Long seededContractorId() {
        User contractor = userRepository.findByEmail("contractor1@hvacmarketplace.com").orElseThrow();
        return contractor.getId();
    }

    private Long nonCompletedOwnedRequestId(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail).orElseThrow();
        ServiceRequest sr = serviceRequestRepository.findByCustomerId(customer.getId()).stream()
                .filter(r -> r.getStatus() == ServiceRequestStatus.SCHEDULED)
                .findFirst()
                .orElseThrow();
        return sr.getId();
    }

    // ───────────── Public reviews GET (read-only) ─────────────

    @Test
    void anonymousCanReadPublicContractorReviews() throws Exception {
        ResponseEntity<String> resp = get("/api/v1/reviews/contractor/" + seededContractorId(), null);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        JsonNode reviews = objectMapper.readTree(resp.getBody());
        assertTrue(reviews.isArray() && reviews.size() >= 1);
        assertEquals(5, reviews.get(0).get("overallRating").asInt());
        assertTrue(reviews.get(0).hasNonNull("comment"));
    }

    @Test
    void publicReviewsDoNotExposeCustomerEmailOrPhone() throws Exception {
        ResponseEntity<String> resp = get("/api/v1/reviews/contractor/" + seededContractorId(), null);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        JsonNode customer = objectMapper.readTree(resp.getBody()).get(0).get("customer");
        assertFalse(customer.has("email"));
        assertFalse(customer.has("phone"));
        assertTrue(customer.has("firstName"));
    }

    @Test
    void anonymousCannotWriteReviews() {
        ResponseEntity<String> resp = postJson("/api/v1/reviews/service-request/1", null,
                "{\"overallRating\":5,\"qualityRating\":5,\"professionalismRating\":5,\"punctualityRating\":5,\"communicationRating\":5,\"comment\":\"x\"}");

        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
    }

    @Test
    void customerCannotReviewNonCompletedServiceRequest() {
        // customer1 owns an SCHEDULED service request in seed data
        Long srId = nonCompletedOwnedRequestId("customer1@hvacmarketplace.com");
        ResponseEntity<String> resp = postJson("/api/v1/reviews/service-request/" + srId,
                authHeader("customer1@hvacmarketplace.com"),
                "{\"overallRating\":5,\"qualityRating\":5,\"professionalismRating\":5,\"punctualityRating\":5,\"communicationRating\":5,\"comment\":\"x\"}");

        assertEquals(HttpStatus.FORBIDDEN, resp.getStatusCode());
    }

    @Test
    void anonymousCannotReadPublicProfileRegressionStaysOpen() {
        ResponseEntity<String> resp = get("/api/v1/contractor-profile/" + seededContractorId(), null);

        assertEquals(HttpStatus.OK, resp.getStatusCode());
    }

    // ───────────── Admin endpoints (ADMIN-only) ─────────────

    @Test
    void anonymousCannotListUsers() {
        assertEquals(HttpStatus.FORBIDDEN, get("/api/v1/users", null).getStatusCode());
    }

    @Test
    void contractorCannotListUsers() {
        assertEquals(HttpStatus.FORBIDDEN, get("/api/v1/users", authHeader("contractor1@hvacmarketplace.com")).getStatusCode());
    }

    @Test
    void adminCanListUsers() throws Exception {
        ResponseEntity<String> resp = get("/api/v1/users", authHeader("admin@hvacmarketplace.com"));

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(objectMapper.readTree(resp.getBody()).size() >= 9);
    }

    @Test
    void adminUsersIncludeCreatedAtForActivityFeed() throws Exception {
        ResponseEntity<String> resp = get("/api/v1/users", authHeader("admin@hvacmarketplace.com"));

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        JsonNode first = objectMapper.readTree(resp.getBody()).get(0);
        assertTrue(first.hasNonNull("createdAt"));
    }

    @Test
    void contractorCannotListAllServiceRequests() {
        assertEquals(HttpStatus.FORBIDDEN, get("/api/v1/service-requests", authHeader("contractor1@hvacmarketplace.com")).getStatusCode());
    }

    @Test
    void adminCanListAllServiceRequests() throws Exception {
        ResponseEntity<String> resp = get("/api/v1/service-requests", authHeader("admin@hvacmarketplace.com"));

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(objectMapper.readTree(resp.getBody()).size() >= 5);
    }
}