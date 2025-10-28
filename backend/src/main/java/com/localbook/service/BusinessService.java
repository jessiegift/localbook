package com.localbook.service;

import com.localbook.model.Business;
import com.localbook.model.User;
import com.localbook.model.UserRole;
import com.localbook.repository.BusinessRepository;
import com.localbook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BusinessService {
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Register a new business (Business Owner only)
    public Business registerBusiness(Business business, Long ownerId) {
        // Verify the owner exists and is a Business Owner
        Optional<User> owner = userRepository.findById(ownerId);
        
        if (owner.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + ownerId);
        }
        
        if (owner.get().getRole() != UserRole.BUSINESS_OWNER) {
            throw new IllegalArgumentException("Only business owners can register businesses.");
        }
        
        // Check if email already exists
        if (businessRepository.existsByEmail(business.getEmail())) {
            throw new IllegalArgumentException("Business email already in use.");
        }
        
        // Check if phone number already exists
        if (businessRepository.existsByPhoneNumber(business.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already in use.");
        }
        
        // Link the business to the owner
        business.setOwner(owner.get());
        
        // New businesses start as unapproved
        business.setApproved(false);
        
        return businessRepository.save(business);
    }
    
    // Get all businesses
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }
    
    // Get business by ID
    public Optional<Business> getBusinessById(Long id) {
        return businessRepository.findById(id);
    }
    
    // Get all APPROVED businesses (for clients to browse)
    public List<Business> getApprovedBusinesses() {
        return businessRepository.findByIsApprovedTrue();
    }
    
    // Get all UNAPPROVED businesses (for admin approval)
    public List<Business> getUnapprovedBusinesses() {
        return businessRepository.findByIsApprovedFalse();
    }
    
    // Search businesses by location (approved only)
    public List<Business> searchByLocation(String location) {
        return businessRepository.findByLocationAndIsApprovedTrue(location);
    }
    
    // Search businesses by category (approved only)
    public List<Business> searchByCategory(String category) {
        return businessRepository.findByCategoryAndIsApprovedTrue(category);
    }
    
    // Search businesses by location AND category (approved only)
    public List<Business> searchByLocationAndCategory(String location, String category) {
        List<Business> businesses = businessRepository.findByLocationAndCategory(location, category);
        // Filter to only approved
        return businesses.stream()
                .filter(Business::isApproved)
                .toList();
    }
    
    // Search businesses by name keyword
    public List<Business> searchByName(String keyword) {
        return businessRepository.findByBusinessNameContainingIgnoreCase(keyword);
    }
    
    // Get all businesses owned by a specific user
    public List<Business> getBusinessesByOwner(Long ownerId) {
        return businessRepository.findByOwnerId(ownerId);
    }
    
    // Update business information (Owner only)
    public Business updateBusiness(Long id, Business updatedBusiness, Long ownerId) {
        Optional<Business> existing = businessRepository.findById(id);
        
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Business not found with ID: " + id);
        }
        
        Business business = existing.get();
        
        // Verify the owner is updating their own business
        if (!business.getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("You can only update your own businesses.");
        }
        
        // Update fields
        business.setBusinessName(updatedBusiness.getBusinessName());
        business.setAddress(updatedBusiness.getAddress());
        business.setLocation(updatedBusiness.getLocation());
        business.setCategory(updatedBusiness.getCategory());
        business.setPhoneNumber(updatedBusiness.getPhoneNumber());
        business.setDescription(updatedBusiness.getDescription());
        
        return businessRepository.save(business);
    }
    
    // Approve business (Admin only)
    public Business approveBusiness(Long id) {
        Optional<Business> business = businessRepository.findById(id);
        
        if (business.isEmpty()) {
            throw new IllegalArgumentException("Business not found with ID: " + id);
        }
        
        Business b = business.get();
        b.setApproved(true);
        
        return businessRepository.save(b);
    }
    
    // Reject/Unapprove business (Admin only)
    public Business rejectBusiness(Long id) {
        Optional<Business> business = businessRepository.findById(id);
        
        if (business.isEmpty()) {
            throw new IllegalArgumentException("Business not found with ID: " + id);
        }
        
        Business b = business.get();
        b.setApproved(false);
        
        return businessRepository.save(b);
    }
    
    // Delete business (Owner or Admin)
    public void deleteBusiness(Long id, Long userId) {
        Optional<Business> business = businessRepository.findById(id);
        
        if (business.isEmpty()) {
            throw new IllegalArgumentException("Business not found with ID: " + id);
        }
        
        Optional<User> user = userRepository.findById(userId);
        
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }
        
        // Allow deletion if user is the owner OR an admin
        if (business.get().getOwner().getId().equals(userId) || 
            user.get().getRole() == UserRole.ADMIN) {
            businessRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("You don't have permission to delete this business.");
        }
    }
    
    // Check if business exists by email
    public boolean existsByEmail(String email) {
        return businessRepository.existsByEmail(email);
    }
}