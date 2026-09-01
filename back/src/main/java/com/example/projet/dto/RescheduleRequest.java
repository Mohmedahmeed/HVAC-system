package com.example.projet.dto;

import java.time.LocalDateTime;

public class RescheduleRequest {
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    public RescheduleRequest() {}

    public RescheduleRequest(LocalDateTime scheduledStart, LocalDateTime scheduledEnd) {
        this.scheduledStart = scheduledStart;
        this.scheduledEnd = scheduledEnd;
    }

    public LocalDateTime getScheduledStart() {
        return scheduledStart;
    }

    public void setScheduledStart(LocalDateTime scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public LocalDateTime getScheduledEnd() {
        return scheduledEnd;
    }

    public void setScheduledEnd(LocalDateTime scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }
}