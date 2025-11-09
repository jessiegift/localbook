package com.localbook.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "businesses")
public class Business {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String businessName;  // "Mary's Salon", "John's Barber Shop"
    
    @Column(nullable = false)
    private String ownerName;  // Owner's full name
    
    @Column(nullable = false)
    private String address;  // "123 Tullow Street"
    
    @Column(nullable = false)
    private String town;     // Default: "Carlow"

    @Column(nullable = false)
    private String county;   // Default: "Carlow"

    @Column(nullable = false)
     private String eircode;  // "R93 F7W3"
    
    @Column(nullable = false)
    private String category;  // "Beauty Salon", "Barber Shop", "Pet Grooming"
    
    @Column(nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private boolean isApproved = false;  // Admin must approve new businesses
    
    @Column(length = 1000)
    private String description;  // About the business

    @Column(name = "latitude")
    private Double lat;  // For map display
    
    @Column(name = "longitude")
    private Double lng;  // For map display

    @Column(nullable = true)
    private String location; // Optional location descriptor, used by getLocation()/setLocation()
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;  // Link to the User who owns this business
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Default Constructor
    public Business() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    // Constructor with parameters
    public Business(String businessName, String ownerName, String address, 
                    String location, String town, String county, String eircode,
                    String category, String phoneNumber, 
                    String email, User owner) {
        this.businessName = businessName;
        this.ownerName = ownerName;
        this.address = address;
        this.location = location;
        this.town = town;
        this.county = county;
        this.eircode = eircode;
        this.category = category;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.owner = owner;
        this.isApproved = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getOwnerName() {
        return ownerName;
    }
    
    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public boolean isApproved() {
        return isApproved;
    }
    
    public void setApproved(boolean approved) {
        isApproved = approved;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public User getOwner() {
        return owner;
    }
    
    public void setOwner(User owner) {
        this.owner = owner;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}