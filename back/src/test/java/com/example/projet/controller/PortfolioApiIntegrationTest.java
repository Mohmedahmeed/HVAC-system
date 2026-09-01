package com.example.projet.controller;

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

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("demo")
class PortfolioApiIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String contractor1Token() {
        return tokenProvider.generateTokenFromUsername("contractor1@hvacmarketplace.com");
    }

    private String contractor2Token() {
        return tokenProvider.generateTokenFromUsername("contractor2@hvacmarketplace.com");
    }

    private String customerToken() {
        return tokenProvider.generateTokenFromUsername("customer1@hvacmarketplace.com");
    }

    private String baseUrl() {
        return "http://localhost:" + port;
    }

    private HttpHeaders headers(String token, boolean json) {
        HttpHeaders headers = new HttpHeaders();
        if (token != null) {
            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        if (json) {
            headers.setContentType(MediaType.APPLICATION_JSON);
        }
        return headers;
    }

    private ResponseEntity<String> exchange(HttpMethod method, String path, String token, String body, boolean json) {
        return restTemplate.exchange(baseUrl() + path, method,
                new HttpEntity<>(body, headers(token, json)), String.class);
    }

    private String createItem(String token, String title) throws Exception {
        String body = "{\"title\":\"" + title + "\",\"serviceType\":\"AC Repair\",\"location\":\"Phoenix AZ\"}";
        ResponseEntity<String> resp = exchange(HttpMethod.POST, "/api/v1/contractor-portfolio", token, body, true);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        JsonNode node = objectMapper.readTree(resp.getBody());
        return node.get("id").asText();
    }

    private List<String> titlesFor(String token) throws Exception {
        ResponseEntity<String> resp = exchange(HttpMethod.GET, "/api/v1/contractor-portfolio/my-projects", token, null, false);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        List<String> titles = new ArrayList<>();
        for (JsonNode node : objectMapper.readTree(resp.getBody())) {
            titles.add(node.path("title").asText());
        }
        return titles;
    }

    @Test
    void anonymousCannotListPortfolio() {
        assertEquals(HttpStatus.FORBIDDEN,
                exchange(HttpMethod.GET, "/api/v1/contractor-portfolio/my-projects", null, null, false).getStatusCode());
    }

    @Test
    void customerCannotListPortfolio() {
        assertEquals(HttpStatus.FORBIDDEN,
                exchange(HttpMethod.GET, "/api/v1/contractor-portfolio/my-projects", customerToken(), null, false).getStatusCode());
    }

    @Test
    void contractorCanListOwnPortfolio() {
        assertEquals(HttpStatus.OK,
                exchange(HttpMethod.GET, "/api/v1/contractor-portfolio/my-projects", contractor1Token(), null, false).getStatusCode());
    }

    @Test
    void contractorCreatesItemAndOnlyOwnerSeesIt() throws Exception {
        createItem(contractor1Token(), "Cool Air Install Unique");

        assertTrue(titlesFor(contractor1Token()).contains("Cool Air Install Unique"));
        assertFalse(titlesFor(contractor2Token()).contains("Cool Air Install Unique"));
    }

    @Test
    void createdItemDoesNotExposeOwnerObject() throws Exception {
        ResponseEntity<String> resp = exchange(HttpMethod.POST, "/api/v1/contractor-portfolio", contractor1Token(),
                "{\"title\":\"No owner leak\",\"serviceType\":\"AC Repair\"}", true);
        assertEquals(HttpStatus.CREATED, resp.getStatusCode());
        assertFalse(objectMapper.readTree(resp.getBody()).has("contractor"));
    }

    @Test
    void customerCannotCreatePortfolioItem() {
        assertEquals(HttpStatus.FORBIDDEN, exchange(HttpMethod.POST, "/api/v1/contractor-portfolio", customerToken(),
                "{\"title\":\"Sneaky\",\"serviceType\":\"AC Repair\"}", true).getStatusCode());
    }

    @Test
    void contractorCannotUpdateOthersItem() throws Exception {
        String id = createItem(contractor1Token(), "Owned by contractor1");

        assertEquals(HttpStatus.FORBIDDEN, exchange(HttpMethod.PUT, "/api/v1/contractor-portfolio/" + id, contractor2Token(),
                "{\"title\":\"Hijacked\"}", true).getStatusCode());
    }

    @Test
    void contractorCanUpdateOwnItem() throws Exception {
        String id = createItem(contractor1Token(), "Before update");

        ResponseEntity<String> resp = exchange(HttpMethod.PUT, "/api/v1/contractor-portfolio/" + id, contractor1Token(),
                "{\"title\":\"After update\",\"serviceType\":\"HVAC Maintenance\"}", true);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertEquals("After update", objectMapper.readTree(resp.getBody()).get("title").asText());
    }

    @Test
    void contractorCannotDeleteOthersItem() throws Exception {
        String id = createItem(contractor1Token(), "Protected item");

        assertEquals(HttpStatus.FORBIDDEN, exchange(HttpMethod.DELETE, "/api/v1/contractor-portfolio/" + id, contractor2Token(),
                null, false).getStatusCode());
    }

    @Test
    void contractorCanDeleteOwnItem() throws Exception {
        String id = createItem(contractor1Token(), "To be deleted unique");

        assertEquals(HttpStatus.NO_CONTENT, exchange(HttpMethod.DELETE, "/api/v1/contractor-portfolio/" + id, contractor1Token(),
                null, false).getStatusCode());

        assertFalse(titlesFor(contractor1Token()).contains("To be deleted unique"));
    }
}