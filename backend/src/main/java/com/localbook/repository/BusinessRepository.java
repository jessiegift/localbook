package com.localbook.repository;

import com.localbook.model.Business;
import com.localbook.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    
    // Find business by email
    Optional<Business> findByEmail(String email);
    
    // Find businesses by location (for local search)
    List<Business> findByLocation(String location);
    
    // Find businesses by category
    List<Business> findByCategory(String category);
    
    // Find businesses by location AND category
    List<Business> findByLocationAndCategory(String location, String category);
    
    // Find approved businesses only
    List<Business> findByIsApprovedTrue();
    
    // Find unapproved businesses (for admin approval)
    List<Business> findByIsApprovedFalse();
    
    // Find businesses by owner
    List<Business> findByOwner(User owner);
    
    // Find businesses by owner ID
    List<Business> findByOwnerId(Long ownerId);
    
    // Search businesses by name (case-insensitive)
    List<Business> findByBusinessNameContainingIgnoreCase(String keyword);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if phone number exists
    boolean existsByPhoneNumber(String phoneNumber);
    
    // Find approved businesses by location
    List<Business> findByLocationAndIsApprovedTrue(String location);
    
    // Find approved businesses by category
    List<Business> findByCategoryAndIsApprovedTrue(String category);
}