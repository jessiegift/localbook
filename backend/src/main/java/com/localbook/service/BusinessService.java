package com.localbook.service;

import com.localbook.model.Business;
import com.localbook.model.User;
import com.localbook.repository.BusinessRepository;
import com.localbook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BusinessService {
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Business registerBusiness(Business business, Long ownerId) {
        System.out.println("=== REGISTER BUSINESS SERVICE ===");
        System.out.println("Owner ID: " + ownerId);
        System.out.println("Business Name: " + business.getBusinessName());
        System.out.println("Category: " + business.getCategory());
        System.out.println("Address: " + business.getAddress());
        System.out.println("Town: " + business.getTown());
        System.out.println("County: " + business.getCounty());
        System.out.println("Eircode: " + business.getEircode());
        System.out.println("Location: " + business.getLocation());
        System.out.println("Phone: " + business.getPhoneNumber());
        System.out.println("Email: " + business.getEmail());
        System.out.println("==================================");
        
        // Find the owner
        Optional<User> ownerOpt = userRepository.findById(ownerId);
        if (ownerOpt.isEmpty()) {
            System.err.println("ERROR: User not found with ID: " + ownerId);
            throw new IllegalArgumentException("User not found with ID: " + ownerId);
        }
        
        User owner = ownerOpt.get();
        System.out.println("Found owner: " + owner.getName());
        
        // Set the owner
        business.setOwner(owner);
        
        // Set timestamps
        business.setCreatedAt(LocalDateTime.now());
        business.setUpdatedAt(LocalDateTime.now());
        
        // Set approval status
        business.setApproved(false);
        
        // Save
        Business saved = businessRepository.save(business);
        System.out.println("✅ Business saved with ID: " + saved.getId());
        
        return saved;
    }
    
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }
    
    public List<Business> getApprovedBusinesses() {
        return businessRepository.findByIsApproved(true);
    }
    
    public List<Business> getUnapprovedBusinesses() {
        return businessRepository.findByIsApproved(false);
    }
    
    public Optional<Business> getBusinessById(Long id) {
        return businessRepository.findById(id);
    }
    
    public List<Business> searchByLocation(String location) {
        return businessRepository.findByLocationContainingIgnoreCase(location);
    }
    
    public List<Business> searchByCategory(String category) {
        return businessRepository.findByCategory(category);
    }
    
    public List<Business> searchByLocationAndCategory(String location, String category) {
        return businessRepository.findByLocationContainingIgnoreCaseAndCategory(location, category);
    }
    
    public List<Business> searchByName(String keyword) {
        return businessRepository.findByBusinessNameContainingIgnoreCase(keyword);
    }
    
    public List<Business> getBusinessesByOwner(Long ownerId) {
        return businessRepository.findByOwner_Id(ownerId);
    }
    
    public Business updateBusiness(Long id, Business updatedBusiness, Long ownerId) {
        Optional<Business> existing = businessRepository.findById(id);
        
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("Business not found");
        }
        
        Business business = existing.get();
        
        // Verify ownership
        if (!business.getOwner().getId().equals(ownerId)) {
            throw new IllegalArgumentException("You can only update your own business");
        }
        
        // Update fields
        business.setBusinessName(updatedBusiness.getBusinessName());
        business.setOwnerName(updatedBusiness.getOwnerName());
        business.setAddress(updatedBusiness.getAddress());
        business.setTown(updatedBusiness.getTown());
        business.setCounty(updatedBusiness.getCounty());
        business.setEircode(updatedBusiness.getEircode());
        business.setLocation(updatedBusiness.getLocation());
        business.setCategory(updatedBusiness.getCategory());
        business.setPhoneNumber(updatedBusiness.getPhoneNumber());
        business.setEmail(updatedBusiness.getEmail());
        business.setDescription(updatedBusiness.getDescription());
        business.setUpdatedAt(LocalDateTime.now());
        
        return businessRepository.save(business);
    }
    
    /**
     * Approve business with console notification
     */
    @Transactional
    public Business approveBusiness(Long businessId) {
        Business business = businessRepository.findById(businessId)
            .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        
        business.setApproved(true);
        business.setStatus("ACTIVE");
        business.setUpdatedAt(LocalDateTime.now());
        
        Business approved = businessRepository.save(business);
        
        // Simple console notification
        System.out.println("\n========================================");
        System.out.println("✅ BUSINESS APPROVED");
        System.out.println("========================================");
        System.out.println("Business: " + business.getBusinessName());
        System.out.println("Owner: " + business.getOwnerName());
        System.out.println("Email: " + business.getEmail());
        System.out.println("\n📧 EMAIL SENT:");
        System.out.println("To: " + business.getEmail());
        System.out.println("Subject: Business Approved - LocalBook");
        System.out.println("Message: Congratulations! Your business is now live on LocalBook.");
        System.out.println("========================================\n");
        
        return approved;
    }
    
    /**
     * Reject business with reason
     */
    @Transactional
    public Business rejectBusiness(Long businessId, String reason) {
        Business business = businessRepository.findById(businessId)
            .orElseThrow(() -> new IllegalArgumentException("Business not found"));
        
        business.setApproved(false);
        business.setStatus("REJECTED");
        business.setUpdatedAt(LocalDateTime.now());
        
        Business rejected = businessRepository.save(business);
        
        // Simple console notification
        System.out.println("\n========================================");
        System.out.println("❌ BUSINESS REJECTED");
        System.out.println("========================================");
        System.out.println("Business: " + business.getBusinessName());
        System.out.println("Owner: " + business.getOwnerName());
        System.out.println("Email: " + business.getEmail());
        System.out.println("Reason: " + reason);
        System.out.println("\n📧 EMAIL SENT:");
        System.out.println("To: " + business.getEmail());
        System.out.println("Subject: Business Registration Update - LocalBook");
        System.out.println("Message: Your business was not approved. Reason: " + reason);
        System.out.println("========================================\n");
        
        return rejected;
    }
    
    public void deleteBusiness(Long id, Long userId) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        
        if (businessOpt.isEmpty()) {
            throw new IllegalArgumentException("Business not found");
        }
        
        Business business = businessOpt.get();
        
        // Verify ownership
        if (!business.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own business");
        }
        
        businessRepository.deleteById(id);
    }
}