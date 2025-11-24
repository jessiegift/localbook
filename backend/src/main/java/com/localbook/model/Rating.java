package com.localbook.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
public class Rating {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;
    
    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @Column(nullable = false)
    private Integer rating; // 1-5 stars
    
    @Column(length = 500)
    private String review;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public Rating() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Rating(User user, Business business, Appointment appointment, Integer rating, String review) {
        this.user = user;
        this.business = business;
        this.appointment = appointment;
        this.rating = rating;
        this.review = review;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }
    
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}