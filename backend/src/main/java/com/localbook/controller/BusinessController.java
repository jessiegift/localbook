package com.localbook.controller;

import com.localbook.model.Business;
import com.localbook.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin(origins = "*")
public class BusinessController {
    
    @Autowired
    private BusinessService businessService;
    
    // Register a new business
    @PostMapping("/register")
    public ResponseEntity<Business> registerBusiness(@RequestBody Business business, 
                                                     @RequestParam Long ownerId) {
        try {
            Business newBusiness = businessService.registerBusiness(business, ownerId);
            return new ResponseEntity<>(newBusiness, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get all businesses
    @GetMapping
    public ResponseEntity<List<Business>> getAllBusinesses() {
        List<Business> businesses = businessService.getAllBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Get all approved businesses (for clients to browse)
    @GetMapping("/approved")
    public ResponseEntity<List<Business>> getApprovedBusinesses() {
        List<Business> businesses = businessService.getApprovedBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Get all unapproved businesses (for admin)
    @GetMapping("/unapproved")
    public ResponseEntity<List<Business>> getUnapprovedBusinesses() {
        List<Business> businesses = businessService.getUnapprovedBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Get business by ID
    @GetMapping("/{id}")
    public ResponseEntity<Business> getBusinessById(@PathVariable Long id) {
        Optional<Business> business = businessService.getBusinessById(id);
        
        if (business.isPresent()) {
            return new ResponseEntity<>(business.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Search businesses by location
    @GetMapping("/search/location/{location}")
    public ResponseEntity<List<Business>> searchByLocation(@PathVariable String location) {
        List<Business> businesses = businessService.searchByLocation(location);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Search businesses by category
    @GetMapping("/search/category/{category}")
    public ResponseEntity<List<Business>> searchByCategory(@PathVariable String category) {
        List<Business> businesses = businessService.searchByCategory(category);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Search businesses by location AND category
    @GetMapping("/search")
    public ResponseEntity<List<Business>> searchByLocationAndCategory(
            @RequestParam String location, @RequestParam String category) {
        List<Business> businesses = businessService.searchByLocationAndCategory(location, category);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Search businesses by name
    @GetMapping("/search/name/{keyword}")
    public ResponseEntity<List<Business>> searchByName(@PathVariable String keyword) {
        List<Business> businesses = businessService.searchByName(keyword);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Get businesses owned by a specific user
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Business>> getBusinessesByOwner(@PathVariable Long ownerId) {
        List<Business> businesses = businessService.getBusinessesByOwner(ownerId);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // Update business information
    @PutMapping("/{id}")
    public ResponseEntity<Business> updateBusiness(@PathVariable Long id, 
                                                   @RequestBody Business business,
                                                   @RequestParam Long ownerId) {
        try {
            Business updatedBusiness = businessService.updateBusiness(id, business, ownerId);
            return new ResponseEntity<>(updatedBusiness, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Approve business (Admin only)
    @PutMapping("/{id}/approve")
    public ResponseEntity<Business> approveBusiness(@PathVariable Long id) {
        try {
            Business approvedBusiness = businessService.approveBusiness(id);
            return new ResponseEntity<>(approvedBusiness, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Reject/Unapprove business (Admin only)
    @PutMapping("/{id}/reject")
    public ResponseEntity<Business> rejectBusiness(@PathVariable Long id) {
        try {
            Business rejectedBusiness = businessService.rejectBusiness(id);
            return new ResponseEntity<>(rejectedBusiness, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete business
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBusiness(@PathVariable Long id, @RequestParam Long userId) {
        try {
            businessService.deleteBusiness(id, userId);
            return new ResponseEntity<>("Business deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }
    }
}