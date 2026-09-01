package com.example.projet.controller;

import com.example.projet.entity.Appointment;
import com.example.projet.entity.ServiceRequest;
import com.example.projet.entity.User;
import com.example.projet.enums.AppointmentStatus;
import com.example.projet.enums.ServiceRequestStatus;
import com.example.projet.enums.Urgency;
import com.example.projet.repository.AppointmentRepository;
import com.example.projet.repository.ServiceRequestRepository;
import com.example.projet.repository.UserRepository;
import com.example.projet.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
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

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("demo")
class AppointmentApiIntegrationTest {

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
    private AppointmentRepository appointmentRepository;

    private User customer1;
    private User customer2;
    private User contractor1;
    private String customer1Token;
    private String customer2Token;
    private String contractorToken;

    @BeforeEach
    void setUp() {
        customer1 = userRepository.findByEmail("customer1@hvacmarketplace.com").orElseThrow();
        customer2 = userRepository.findByEmail("customer2@hvacmarketplace.com").orElseThrow();
        contractor1 = userRepository.findByEmail("contractor1@hvacmarketplace.com").orElseThrow();
        customer1Token = tokenProvider.generateTokenFromUsername(customer1.getEmail());
        customer2Token = tokenProvider.generateTokenFromUsername(customer2.getEmail());
        contractorToken = tokenProvider.generateTokenFromUsername(contractor1.getEmail());
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

    private ResponseEntity<String> post(String path, String token) {
        return restTemplate.exchange(baseUrl() + path, HttpMethod.POST,
                new HttpEntity<>(headers(token, false)), String.class);
    }

    private ResponseEntity<String> put(String path, String token, String body) {
        return restTemplate.exchange(baseUrl() + path, HttpMethod.PUT,
                new HttpEntity<>(body, headers(token, true)), String.class);
    }

    private Appointment newScheduledAppointmentFor(User customer, LocalDateTime start) {
        ServiceRequest sr = new ServiceRequest();
        sr.setCustomer(customer);
        sr.setServiceType("AC Repair");
        sr.setProblemDescription("Integration test request");
        sr.setUrgency(Urgency.ROUTINE);
        sr.setZipCode("85016");
        sr.setStatus(ServiceRequestStatus.SCHEDULED);
        sr = serviceRequestRepository.save(sr);

        Appointment appointment = new Appointment();
        appointment.setServiceRequest(sr);
        appointment.setContractor(contractor1);
        appointment.setScheduledStart(start);
        appointment.setScheduledEnd(start.plusHours(2));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        return appointmentRepository.save(appointment);
    }

    // ───────────── Cancellation ─────────────

    @Test
    void customerCancelsOwnFutureAppointment_successAndConsistency() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));

        ResponseEntity<String> resp = post("/api/v1/appointments/" + appointment.getId() + "/cancel", customer1Token);
        assertEquals(HttpStatus.OK, resp.getStatusCode());

        Appointment cancelled = appointmentRepository.findById(appointment.getId()).orElseThrow();
        ServiceRequest sr = serviceRequestRepository.findById(appointment.getServiceRequest().getId()).orElseThrow();
        assertEquals(AppointmentStatus.CANCELLED, cancelled.getStatus());
        assertEquals(ServiceRequestStatus.CANCELLED, sr.getStatus());
    }

    @Test
    void customerCannotCancelWithin24Hours() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(10));

        assertEquals(HttpStatus.CONFLICT, post("/api/v1/appointments/" + appointment.getId() + "/cancel", customer1Token).getStatusCode());
    }

    @Test
    void customerCannotCancelSomeoneElsesAppointment() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));

        assertEquals(HttpStatus.FORBIDDEN, post("/api/v1/appointments/" + appointment.getId() + "/cancel", customer2Token).getStatusCode());
    }

    @Test
    void contractorCannotUseCustomerCancelEndpoint() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));

        assertEquals(HttpStatus.FORBIDDEN, post("/api/v1/appointments/" + appointment.getId() + "/cancel", contractorToken).getStatusCode());
    }

    @Test
    void anonymousCannotCancelAppointment() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));

        assertEquals(HttpStatus.FORBIDDEN, post("/api/v1/appointments/" + appointment.getId() + "/cancel", null).getStatusCode());
    }

    // ───────────── Reschedule ─────────────

    @Test
    void customerReschedulesOwnAppointment_success() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));
        String body = "{\"scheduledStart\":\"2030-01-05T10:00:00\",\"scheduledEnd\":\"2030-01-05T12:00:00\"}";

        ResponseEntity<String> resp = put("/api/v1/appointments/" + appointment.getId() + "/reschedule", customer1Token, body);
        assertEquals(HttpStatus.OK, resp.getStatusCode());

        Appointment updated = appointmentRepository.findById(appointment.getId()).orElseThrow();
        assertEquals(LocalDateTime.of(2030, 1, 5, 10, 0), updated.getScheduledStart());
        assertEquals(LocalDateTime.of(2030, 1, 5, 12, 0), updated.getScheduledEnd());
    }

    @Test
    void customerCannotRescheduleToPastStart() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));
        String body = "{\"scheduledStart\":\"2020-01-05T10:00:00\",\"scheduledEnd\":\"2020-01-05T12:00:00\"}";

        assertEquals(HttpStatus.BAD_REQUEST, put("/api/v1/appointments/" + appointment.getId() + "/reschedule", customer1Token, body).getStatusCode());
    }

    @Test
    void customerCannotRescheduleWithEndBeforeStart() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));
        String body = "{\"scheduledStart\":\"2030-01-05T14:00:00\",\"scheduledEnd\":\"2030-01-05T12:00:00\"}";

        assertEquals(HttpStatus.BAD_REQUEST, put("/api/v1/appointments/" + appointment.getId() + "/reschedule", customer1Token, body).getStatusCode());
    }

    @Test
    void customerCannotRescheduleSomeoneElsesAppointment() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));
        String body = "{\"scheduledStart\":\"2030-01-05T10:00:00\",\"scheduledEnd\":\"2030-01-05T12:00:00\"}";

        assertEquals(HttpStatus.FORBIDDEN, put("/api/v1/appointments/" + appointment.getId() + "/reschedule", customer2Token, body).getStatusCode());
    }

    @Test
    void contractorCannotRescheduleAppointment() {
        Appointment appointment = newScheduledAppointmentFor(customer1, LocalDateTime.now().plusHours(48));
        String body = "{\"scheduledStart\":\"2030-01-05T10:00:00\",\"scheduledEnd\":\"2030-01-05T12:00:00\"}";

        assertEquals(HttpStatus.FORBIDDEN, put("/api/v1/appointments/" + appointment.getId() + "/reschedule", contractorToken, body).getStatusCode());
    }
}