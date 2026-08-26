package com.example.projet.config;

import com.example.projet.entity.*;
import com.example.projet.enums.*;
import com.example.projet.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * Actually does the demo-data seeding. This needs to be a real Spring bean
 * method call (not a CommandLineRunner lambda) so that @Transactional can
 * wrap it via a proxy. Without that, every repository.save(...) call opens
 * and closes its own transaction, and every entity you reuse afterward
 * (contractor1, customer1, etc.) becomes detached -> Hibernate throws
 * "detached entity passed to persist" the moment a later save touches it
 * through a relationship (e.g. ContractorProfile's @MapsId on User).
 */
@Component
public class DemoDataSeeder {

    private final UserRepository userRepository;
    private final ContractorProfileRepository contractorProfileRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final LeadAssignmentRepository leadAssignmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final AvailabilityRepository availabilityRepository;

    public DemoDataSeeder(
            UserRepository userRepository,
            ContractorProfileRepository contractorProfileRepository,
            ServiceRequestRepository serviceRequestRepository,
            LeadAssignmentRepository leadAssignmentRepository,
            AppointmentRepository appointmentRepository,
            ReviewRepository reviewRepository,
            ServiceAreaRepository serviceAreaRepository,
            AvailabilityRepository availabilityRepository) {
        this.userRepository = userRepository;
        this.contractorProfileRepository = contractorProfileRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.leadAssignmentRepository = leadAssignmentRepository;
        this.appointmentRepository = appointmentRepository;
        this.reviewRepository = reviewRepository;
        this.serviceAreaRepository = serviceAreaRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Transactional
    public void seed(PasswordEncoder passwordEncoder) {
        System.out.println("=== Seeding Demo Data for Phoenix, AZ ===");

        // Create Admin
        User admin = new User();
        admin.setEmail("admin@hvacmarketplace.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(Role.ADMIN);
        admin.setPhone("+1-602-555-0000");
        userRepository.save(admin);

        // Create Demo Customers (3)
        User customer1 = createUser("customer1@hvacmarketplace.com", "John", "Doe", Role.CUSTOMER, "+1-602-555-0101", passwordEncoder);
        User customer2 = createUser("customer2@hvacmarketplace.com", "Jane", "Smith", Role.CUSTOMER, "+1-602-555-0102", passwordEncoder);
        User customer3 = createUser("customer3@hvacmarketplace.com", "Mike", "Wilson", Role.CUSTOMER, "+1-602-555-0103", passwordEncoder);

        // Create Demo Contractors (5) - fix contractor name bug
        User contractor1 = createContractor("contractor1@hvacmarketplace.com", "Mike", "Davis", "Cool Air Solutions", Role.CONTRACTOR, "+1-602-555-0201", passwordEncoder);
        User contractor2 = createContractor("contractor2@hvacmarketplace.com", "Sarah", "Johnson", "Frost Comfort Co", Role.CONTRACTOR, "+1-602-555-0202", passwordEncoder);
        User contractor3 = createContractor("contractor3@hvacmarketplace.com", "Robert", "Martinez", "Arctic Breeze HVAC", Role.CONTRACTOR, "+1-602-555-0203", passwordEncoder);
        User contractor4 = createContractor("contractor4@hvacmarketplace.com", "Lisa", "Anderson", "Desert Cooling Experts", Role.CONTRACTOR, "+1-602-555-0204", passwordEncoder);
        User contractor5 = createContractor("contractor5@hvacmarketplace.com", "David", "Thompson", "Sun State HVAC", Role.CONTRACTOR, "+1-602-555-0205", passwordEncoder);

        // Create Contractor Profiles
        createContractorProfile(contractor1, "Cool Air Solutions", "Expert AC repair and installation with 15+ years experience in Phoenix area.", "AZ-ROC-123456", "AC Repair,AC Installation,Emergency AC Repair,HVAC Maintenance", 85.0, 2, true);
        createContractorProfile(contractor2, "Frost Comfort Co", "Family-owned HVAC company specializing in residential cooling solutions.", "AZ-ROC-234567", "AC Repair,AC Installation,Heating Repair,HVAC Maintenance", 75.0, 3, true);
        createContractorProfile(contractor3, "Arctic Breeze HVAC", "Commercial and residential HVAC services. Licensed and insured.", "AZ-ROC-345678", "AC Repair,AC Installation,Emergency AC Repair,Heating Repair,HVAC Maintenance", 90.0, 1, true);
        createContractorProfile(contractor4, "Desert Cooling Experts", "Fast, reliable AC repair services in the Phoenix metro area.", "AZ-ROC-456789", "AC Repair,Emergency AC Repair,HVAC Maintenance", 70.0, 4, false);
        createContractorProfile(contractor5, "Sun State HVAC", "Full-service HVAC contractor with certified technicians.", "AZ-ROC-567890", "AC Repair,AC Installation,Heating Repair,HVAC Maintenance", 80.0, 2, true);

        // Create Service Areas (Phoenix ZIP codes) - deterministic assignment
        // Contractor 1: 85001, 85003, 85004, 85006, 85007, 85008
        createServiceAreas(contractor1, Arrays.asList("85001", "85003", "85004", "85006", "85007", "85008"));
        // Contractor 2: 85009, 85012, 85013, 85014, 85015, 85016
        createServiceAreas(contractor2, Arrays.asList("85009", "85012", "85013", "85014", "85015", "85016"));
        // Contractor 3: 85017, 85018, 85019, 85020, 85021, 85022
        createServiceAreas(contractor3, Arrays.asList("85017", "85018", "85019", "85020", "85021", "85022"));
        // Contractor 4: 85023, 85024, 85027, 85028, 85029, 85031
        createServiceAreas(contractor4, Arrays.asList("85023", "85024", "85027", "85028", "85029", "85031"));
        // Contractor 5: 85032, 85033, 85034, 85035, 85037, 85040
        createServiceAreas(contractor5, Arrays.asList("85032", "85033", "85034", "85035", "85037", "85040"));

        // Create Availability for contractors (Mon-Fri 8am-6pm, emergency based on profile)
        for (User contractor : Arrays.asList(contractor1, contractor2, contractor3, contractor4, contractor5)) {
            for (DayOfWeek day : Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY)) {
                Availability availability = new Availability();
                availability.setContractor(contractor);
                availability.setDayOfWeek(day);
                availability.setStartTime(LocalTime.of(8, 0));
                availability.setEndTime(LocalTime.of(18, 0));
                availability.setEmergencyAvailable(contractor.getContractorProfile().isAcceptsEmergency());
                availabilityRepository.save(availability);
            }
        }

        // Create Service Requests - demonstrating different states
        // SR1: NEW -> MATCHED -> ACCEPTED -> SCHEDULED
        ServiceRequest sr1 = createServiceRequest(customer1, "AC Repair", "AC unit not cooling properly. Making strange noise.", Urgency.ROUTINE, "85016", "123 E Camelback Rd, Phoenix, AZ 85016", "residential", 1800, "central", LocalDateTime.now().plusDays(2));
        sr1.setStatus(ServiceRequestStatus.MATCHED); // MATCHED state

        // SR2: NEW -> MATCHED -> ACCEPTED -> SCHEDULED
        ServiceRequest sr2 = createServiceRequest(customer2, "AC Installation", "Need new AC unit installed. Old one died.", Urgency.ROUTINE, "85020", "456 W Northern Ave, Phoenix, AZ 85020", "residential", 2200, "central", LocalDateTime.now().plusDays(5));
        sr2.setStatus(ServiceRequestStatus.MATCHED); // MATCHED state

        // SR3: NEW -> MATCHED -> ACCEPTED -> SCHEDULED -> COMPLETED
        ServiceRequest sr3 = createServiceRequest(customer3, "Emergency AC Repair", "AC completely dead in 110 degree heat!", Urgency.EMERGENCY, "85028", "789 N 32nd St, Phoenix, AZ 85028", "residential", 1600, "heat-pump", LocalDateTime.now());
        sr3.setStatus(ServiceRequestStatus.MATCHED); // MATCHED state

        // SR4: NEW state (no matches yet)
        ServiceRequest sr4 = createServiceRequest(customer1, "Heating Repair", "Furnace not producing heat. Pilot light issues.", Urgency.URGENT, "85016", "123 E Camelback Rd, Phoenix, AZ 85016", "residential", 1800, "central", LocalDateTime.now().plusDays(1));
        sr4.setStatus(ServiceRequestStatus.NEW); // NEW state

        // SR5: NEW state
        ServiceRequest sr5 = createServiceRequest(customer2, "HVAC Maintenance", "Annual maintenance check needed.", Urgency.ROUTINE, "85020", "456 W Northern Ave, Phoenix, AZ 85020", "residential", 2200, "heat-pump", LocalDateTime.now().plusDays(7));
        sr5.setStatus(ServiceRequestStatus.NEW); // NEW state

        // Create Lead Assignments
        // SR1 -> contractor1 (ACCEPTED), contractor2 (REJECTED)
        LeadAssignment la1 = createLeadAssignment(sr1, contractor1);
        la1.setStatus(LeadAssignmentStatus.ACCEPTED);
        la1.setRespondedAt(LocalDateTime.now().minusDays(1));
        la1.setQuotedPrice(450.0);
        leadAssignmentRepository.save(la1);

        LeadAssignment la2 = createLeadAssignment(sr1, contractor2);
        la2.setStatus(LeadAssignmentStatus.REJECTED);
        la2.setRespondedAt(LocalDateTime.now().minusDays(1));
        la2.setContractorNotes("Schedule full, cannot take emergency work");
        leadAssignmentRepository.save(la2);

        // SR2 -> contractor3 (ACCEPTED), contractor5 (SENT)
        LeadAssignment la3 = createLeadAssignment(sr2, contractor3);
        la3.setStatus(LeadAssignmentStatus.ACCEPTED);
        la3.setRespondedAt(LocalDateTime.now().minusDays(1));
        la3.setQuotedPrice(5500.0);
        leadAssignmentRepository.save(la3);

        LeadAssignment la4 = createLeadAssignment(sr2, contractor5);
        la4.setStatus(LeadAssignmentStatus.SENT);
        leadAssignmentRepository.save(la4);

        // SR3 -> contractor1 (ACCEPTED), contractor4 (SENT)
        LeadAssignment la5 = createLeadAssignment(sr3, contractor1);
        la5.setStatus(LeadAssignmentStatus.ACCEPTED);
        la5.setRespondedAt(LocalDateTime.now().minusHours(2));
        la5.setQuotedPrice(350.0);
        leadAssignmentRepository.save(la5);

        LeadAssignment la6 = createLeadAssignment(sr3, contractor4);
        la6.setStatus(LeadAssignmentStatus.SENT);
        leadAssignmentRepository.save(la6);

        // Create Appointments
        // SR1 + contractor1 -> SCHEDULED
        Appointment apt1 = createAppointment(sr1, contractor1, LocalDateTime.now().plusDays(3).withHour(10).withMinute(0), LocalDateTime.now().plusDays(3).withHour(12).withMinute(0), "Customer will be home. Gate code: 1234");
        apt1.setStatus(AppointmentStatus.SCHEDULED);
        appointmentRepository.save(apt1);

        // Update SR1 to SCHEDULED
        sr1.setStatus(ServiceRequestStatus.SCHEDULED);
        serviceRequestRepository.save(sr1);

        // SR2 + contractor3 -> SCHEDULED
        Appointment apt2 = createAppointment(sr2, contractor3, LocalDateTime.now().plusDays(7).withHour(9).withMinute(0), LocalDateTime.now().plusDays(7).withHour(15).withMinute(0), "New unit delivery scheduled");
        apt2.setStatus(AppointmentStatus.SCHEDULED);
        appointmentRepository.save(apt2);

        // Update SR2 to SCHEDULED
        sr2.setStatus(ServiceRequestStatus.SCHEDULED);
        serviceRequestRepository.save(sr2);

        // SR3 + contractor1 -> COMPLETED
        Appointment apt3 = createAppointment(sr3, contractor1, LocalDateTime.now().minusDays(1).withHour(8).withMinute(0), LocalDateTime.now().minusDays(1).withHour(10).withMinute(0), "Emergency service - priority");
        apt3.setStatus(AppointmentStatus.COMPLETED);
        apt3.setCompletedAt(LocalDateTime.now().minusDays(1).withHour(10).withMinute(30));
        apt3.setCompletionNotes("Replaced faulty capacitor. AC now working properly.");
        appointmentRepository.save(apt3);

        // Update SR3 to COMPLETED
        sr3.setStatus(ServiceRequestStatus.COMPLETED);
        sr3.setCompletedAt(LocalDateTime.now().minusDays(1).withHour(10).withMinute(30));
        serviceRequestRepository.save(sr3);

        // Create Review for completed SR3 by customer3 for contractor1
        Review review = new Review();
        review.setCustomer(customer3);
        review.setContractor(contractor1);
        review.setServiceRequest(sr3);
        review.setOverallRating(5);
        review.setQualityRating(5);
        review.setProfessionalismRating(5);
        review.setPunctualityRating(4);
        review.setCommunicationRating(5);
        review.setComment("Excellent emergency service! Technician arrived quickly and fixed the issue. Highly recommend!");
        review.setCreatedAt(LocalDateTime.now().minusDays(1).withHour(11).withMinute(0));
        reviewRepository.save(review);

        // Update contractor1 rating based on reviews
        contractor1.getContractorProfile().setAverageRating(5.0);
        contractor1.getContractorProfile().setTotalReviews(1);
        userRepository.save(contractor1);

        System.out.println("=== Demo Data Seeding Complete ===");
        System.out.println("Demo Accounts:");
        System.out.println("Admin: admin@hvacmarketplace.com / admin123");
        System.out.println("Customer: customer1@hvacmarketplace.com / customer123");
        System.out.println("Customer: customer2@hvacmarketplace.com / customer123");
        System.out.println("Customer: customer3@hvacmarketplace.com / customer123");
        System.out.println("Contractor: contractor1@hvacmarketplace.com / contractor123");
        System.out.println("Contractor: contractor2@hvacmarketplace.com / contractor123");
        System.out.println("Contractor: contractor3@hvacmarketplace.com / contractor123");
        System.out.println("Contractor: contractor4@hvacmarketplace.com / contractor123");
        System.out.println("Contractor: contractor5@hvacmarketplace.com / contractor123");
    }

    private User createUser(String email, String firstName, String lastName, Role role, String phone, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("customer123"));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setPhone(phone);
        return userRepository.save(user);
    }

    private User createContractor(String email, String firstName, String lastName, String businessName, Role role, String phone, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("contractor123"));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setPhone(phone);
        user.setSiret("SIRET-" + email.hashCode());
        user.setEstVerifie(true);
        return userRepository.save(user);
    }

    private void createContractorProfile(User contractor, String businessName, String description, String licenseNumber, String specialties, Double baseRate, Integer responseTimeHours, boolean acceptsEmergency) {
        ContractorProfile profile = new ContractorProfile();
        profile.setUser(contractor);
        profile.setBusinessName(businessName);
        profile.setDescription(description);
        profile.setLicenseNumber(licenseNumber);
        profile.setSpecialties(specialties);
        profile.setBaseRate(baseRate);
        profile.setResponseTimeHours(responseTimeHours);
        profile.setAcceptsEmergency(acceptsEmergency);
        profile.setVerified(true);
        contractorProfileRepository.save(profile);
        contractor.setContractorProfile(profile);
    }

    private void createServiceAreas(User contractor, List<String> zipCodes) {
        for (String zip : zipCodes) {
            ServiceArea serviceArea = new ServiceArea();
            serviceArea.setContractor(contractor);
            serviceArea.setZipCode(zip);
            serviceArea.setCity("Phoenix");
            serviceArea.setState("AZ");
            serviceAreaRepository.save(serviceArea);
        }
    }

    private ServiceRequest createServiceRequest(User customer, String serviceType, String description, Urgency urgency, String zipCode, String address, String propertyType, Integer squareFootage, String hvacSystemType, LocalDateTime preferredDate) {
        ServiceRequest sr = new ServiceRequest();
        sr.setCustomer(customer);
        sr.setServiceType(serviceType);
        sr.setProblemDescription(description);
        sr.setUrgency(urgency);
        sr.setZipCode(zipCode);
        sr.setAddress(address);
        sr.setPropertyType(propertyType);
        sr.setSquareFootage(squareFootage);
        sr.setHvacSystemType(hvacSystemType);
        sr.setPreferredDate(preferredDate);
        sr.setStatus(ServiceRequestStatus.NEW);
        sr.setCreatedAt(LocalDateTime.now());
        return serviceRequestRepository.save(sr);
    }

    private LeadAssignment createLeadAssignment(ServiceRequest serviceRequest, User contractor) {
        LeadAssignment la = new LeadAssignment();
        la.setServiceRequest(serviceRequest);
        la.setContractor(contractor);
        la.setStatus(LeadAssignmentStatus.SENT);
        la.setSentAt(LocalDateTime.now());
        return leadAssignmentRepository.save(la);
    }

    private Appointment createAppointment(ServiceRequest serviceRequest, User contractor, LocalDateTime scheduledStart, LocalDateTime scheduledEnd, String notes) {
        Appointment apt = new Appointment();
        apt.setServiceRequest(serviceRequest);
        apt.setContractor(contractor);
        apt.setScheduledStart(scheduledStart);
        apt.setScheduledEnd(scheduledEnd);
        apt.setNotes(notes);
        apt.setStatus(AppointmentStatus.SCHEDULED);
        return appointmentRepository.save(apt);
    }
}