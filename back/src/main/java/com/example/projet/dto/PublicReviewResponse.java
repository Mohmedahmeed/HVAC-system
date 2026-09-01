package com.example.projet.dto;

import java.time.LocalDateTime;

/**
 * Public, read-only representation of a review. Exposes only the display
 * fields the public contractor profile needs, and deliberately omits the
 * reviewer's email/phone/role (no PII leakage on a public endpoint).
 */
public class PublicReviewResponse {

    private Long id;
    private Author customer;
    private Author contractor;
    private ProjectRef serviceRequest;
    private Integer overallRating;
    private Integer qualityRating;
    private Integer professionalismRating;
    private Integer punctualityRating;
    private Integer communicationRating;
    private String comment;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Author getCustomer() {
        return customer;
    }

    public void setCustomer(Author customer) {
        this.customer = customer;
    }

    public Author getContractor() {
        return contractor;
    }

    public void setContractor(Author contractor) {
        this.contractor = contractor;
    }

    public ProjectRef getServiceRequest() {
        return serviceRequest;
    }

    public void setServiceRequest(ProjectRef serviceRequest) {
        this.serviceRequest = serviceRequest;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }

    public Integer getQualityRating() {
        return qualityRating;
    }

    public void setQualityRating(Integer qualityRating) {
        this.qualityRating = qualityRating;
    }

    public Integer getProfessionalismRating() {
        return professionalismRating;
    }

    public void setProfessionalismRating(Integer professionalismRating) {
        this.professionalismRating = professionalismRating;
    }

    public Integer getPunctualityRating() {
        return punctualityRating;
    }

    public void setPunctualityRating(Integer punctualityRating) {
        this.punctualityRating = punctualityRating;
    }

    public Integer getCommunicationRating() {
        return communicationRating;
    }

    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static class Author {
        private Long id;
        private String firstName;
        private String lastName;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public static class ProjectRef {
        private Long id;
        private String serviceType;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getServiceType() {
            return serviceType;
        }

        public void setServiceType(String serviceType) {
            this.serviceType = serviceType;
        }
    }
}