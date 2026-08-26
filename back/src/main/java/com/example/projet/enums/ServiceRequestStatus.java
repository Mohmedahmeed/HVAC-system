package com.example.projet.enums;

public enum ServiceRequestStatus {
    NEW,           // Just submitted
    MATCHED,       // Contractors have been notified
    ACCEPTED,      // Contractor accepted the lead
    SCHEDULED,     // Appointment booked
    IN_PROGRESS,   // Job in progress
    COMPLETED,     // Job completed
    CANCELLED      // Cancelled by customer or contractor
}