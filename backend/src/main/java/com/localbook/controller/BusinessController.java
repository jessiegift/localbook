package com.localbook.controller;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import com.localbook.model.Business;
import com.localbook.service.AppointmentService;
import com.localbook.service.BusinessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin(origins = "*")
public class BusinessController {
    
    @Autowired
    private BusinessService businessService;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @GetMapping("/{businessId}/dashboard")
    public ResponseEntity<?> getBusinessDashboard(@PathVariable Long businessId) {
        try {
            System.out.println("=== Dashboard requested for business: " + businessId);
            
            Optional<Business> businessOpt = businessService.getBusinessById(businessId);
            if (!businessOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Business not found with ID: " + businessId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            LocalDateTime now = LocalDateTime.now();
            LocalDate today = LocalDate.now();
            
            LocalDateTime startOfToday = today.atStartOfDay();
            LocalDateTime endOfToday = today.atTime(23, 59, 59);
            
            LocalDate startOfWeekDate = today.with(DayOfWeek.MONDAY);
            LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();
            
            LocalDate startOfMonthDate = today.withDayOfMonth(1);
            LocalDateTime startOfMonth = startOfMonthDate.atStartOfDay();
            
            System.out.println("Current time: " + now);
            System.out.println("Start of today: " + startOfToday);
            System.out.println("End of today: " + endOfToday);
            System.out.println("Start of week: " + startOfWeek);
            System.out.println("Start of month: " + startOfMonth);
            
            List<Appointment> allAppointments = appointmentService.getBusinessAppointments(businessId);
            System.out.println("Total appointments found: " + allAppointments.size());
            
            long todayAppointments = 0;
            long weekAppointments = 0;
            double monthRevenue = 0.0;
            
            for (Appointment apt : allAppointments) {
                LocalDateTime aptDateTime = apt.getAppointmentDateTime();
                
                if (aptDateTime.isAfter(startOfToday.minusSeconds(1)) && aptDateTime.isBefore(endOfToday.plusSeconds(1))) {
                    todayAppointments++;
                    System.out.println("TODAY: " + aptDateTime + " | Status: " + apt.getStatus());
                }
                
                if (aptDateTime.isAfter(startOfWeek.minusSeconds(1)) && aptDateTime.isBefore(now.plusDays(1))) {
                    weekAppointments++;
                    System.out.println("THIS WEEK: " + aptDateTime + " | Status: " + apt.getStatus());
                }
                
                if (aptDateTime.isAfter(startOfMonth.minusSeconds(1)) && 
                    aptDateTime.isBefore(now.plusDays(1)) && 
                    apt.getStatus() == AppointmentStatus.COMPLETED) {
                    double price = apt.getService() != null ? apt.getService().getPrice() : 0.0;
                    monthRevenue = monthRevenue + price;
                    System.out.println("COMPLETED THIS MONTH: " + aptDateTime + " | Price: $" + price);
                }
            }
            
            long totalCustomers = allAppointments.stream()
                .filter(apt -> apt.getUser() != null)
                .map(apt -> apt.getUser().getId())
                .distinct()
                .count();
            
            List<Appointment> todaySchedule = allAppointments.stream()
                .filter(apt -> {
                    LocalDateTime aptDateTime = apt.getAppointmentDateTime();
                    return aptDateTime.isAfter(startOfToday.minusSeconds(1)) && 
                           aptDateTime.isBefore(endOfToday.plusSeconds(1));
                })
                .sorted((a1, a2) -> a1.getAppointmentDateTime().compareTo(a2.getAppointmentDateTime()))
                .collect(Collectors.toList());
            
            System.out.println("=== STATS SUMMARY ===");
            System.out.println("Today's appointments: " + todayAppointments);
            System.out.println("This week's appointments: " + weekAppointments);
            System.out.println("This month's revenue: $" + monthRevenue);
            System.out.println("Total unique customers: " + totalCustomers);
            System.out.println("Today's schedule size: " + todaySchedule.size());
            
            Map<String, Object> response = new HashMap<>();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("todayAppointments", todayAppointments);
            stats.put("weekAppointments", weekAppointments);
            stats.put("monthRevenue", monthRevenue);
            stats.put("totalCustomers", totalCustomers);
            
            response.put("stats", stats);
            response.put("todaySchedule", todaySchedule);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERROR: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error loading dashboard: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
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
    
    @GetMapping
    public ResponseEntity<List<Business>> getAllBusinesses() {
        List<Business> businesses = businessService.getAllBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/approved")
    public ResponseEntity<List<Business>> getApprovedBusinesses() {
        List<Business> businesses = businessService.getApprovedBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/unapproved")
    public ResponseEntity<List<Business>> getUnapprovedBusinesses() {
        List<Business> businesses = businessService.getUnapprovedBusinesses();
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Business> getBusinessById(@PathVariable Long id) {
        Optional<Business> business = businessService.getBusinessById(id);
        
        if (business.isPresent()) {
            return new ResponseEntity<>(business.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/search/location/{location}")
    public ResponseEntity<List<Business>> searchByLocation(@PathVariable String location) {
        List<Business> businesses = businessService.searchByLocation(location);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/search/category/{category}")
    public ResponseEntity<List<Business>> searchByCategory(@PathVariable String category) {
        List<Business> businesses = businessService.searchByCategory(category);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Business>> searchByLocationAndCategory(
            @RequestParam String location, @RequestParam String category) {
        List<Business> businesses = businessService.searchByLocationAndCategory(location, category);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/search/name/{keyword}")
    public ResponseEntity<List<Business>> searchByName(@PathVariable String keyword) {
        List<Business> businesses = businessService.searchByName(keyword);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Business>> getBusinessesByOwner(@PathVariable Long ownerId) {
        List<Business> businesses = businessService.getBusinessesByOwner(ownerId);
        return new ResponseEntity<>(businesses, HttpStatus.OK);
    }
    
    // ✅ FIXED: Update Business Method - Now accepts Map instead of Business object
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBusiness(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            @RequestParam Long ownerId) {
        
        try {
            System.out.println("📝 Updating business ID: " + id);
            System.out.println("📦 Updates received: " + updates);
            System.out.println("👤 Owner ID: " + ownerId);
            
            // Find the business
            Optional<Business> businessOpt = businessService.getBusinessById(id);
            if (!businessOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Business not found"));
            }
            
            Business business = businessOpt.get();
            
            // Verify ownership
            if (!business.getOwner().getId().equals(ownerId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Unauthorized"));
            }
            
            // Update fields if present in request
            if (updates.containsKey("businessName")) {
                business.setBusinessName((String) updates.get("businessName"));
            }
            if (updates.containsKey("ownerName")) {
                business.setOwnerName((String) updates.get("ownerName"));
            }
            if (updates.containsKey("description")) {
                business.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("category")) {
                business.setCategory((String) updates.get("category"));
            }
            if (updates.containsKey("location")) {
                business.setLocation((String) updates.get("location"));
            }
            if (updates.containsKey("address")) {
                business.setAddress((String) updates.get("address"));
            }
            if (updates.containsKey("town")) {
                business.setTown((String) updates.get("town"));
            }
            if (updates.containsKey("county")) {
                business.setCounty((String) updates.get("county"));
            }
            if (updates.containsKey("eircode")) {
                business.setEircode((String) updates.get("eircode"));
            }
            if (updates.containsKey("phoneNumber")) {
                business.setPhoneNumber((String) updates.get("phoneNumber"));
            }
            if (updates.containsKey("email")) {
                business.setEmail((String) updates.get("email"));
            }
            
            
            // ✅ Handle opening hours (check both possible field names)
            if (updates.containsKey("openingHours")) {
                String hours = (String) updates.get("openingHours");
                System.out.println("🕐 Setting opening hours: " + hours);
                business.setOpeningHours(hours);
            }
            
            if (updates.containsKey("operatingHours")) {
                String hours = (String) updates.get("operatingHours");
                System.out.println("🕐 Setting operating hours: " + hours);
                business.setOpeningHours(hours);
            }
            
            // Save
            business.setUpdatedAt(LocalDateTime.now());
            Business updated = businessService.saveBusinessDirect(business);
            
            System.out.println("✅ Business updated successfully");
            return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            System.err.println("❌ Error updating business: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/approve")
    public ResponseEntity<Business> approveBusiness(@PathVariable Long id) {
        try {
            Business approvedBusiness = businessService.approveBusiness(id);
            return new ResponseEntity<>(approvedBusiness, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBusiness(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        try {
            // Get reason from request body
            String reason = "Did not meet requirements";
            if (payload != null && payload.containsKey("reason")) {
                reason = payload.get("reason");
            }
            
            Business rejectedBusiness = businessService.rejectBusiness(id, reason);
            
            return ResponseEntity.ok(rejectedBusiness);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBusiness(@PathVariable Long id, @RequestParam Long userId) {
        try {
            businessService.deleteBusiness(id, userId);
            return new ResponseEntity<>("Business deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/owner/{ownerId}/status")
    public ResponseEntity<?> getBusinessStatusByOwner(@PathVariable Long ownerId) {
        try {
            System.out.println("=== GET BUSINESS STATUS ===");
            System.out.println("Owner ID: " + ownerId);
            
            List<Business> businesses = businessService.getBusinessesByOwner(ownerId);
            
            if (businesses.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("hasBusinesses", false);
                response.put("isApproved", false);
                response.put("status", "NO_BUSINESS");
                response.put("message", "No business registered");
                return ResponseEntity.ok(response);
            }
            
            // Get the first business (assuming one business per owner)
            Business business = businesses.get(0);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasBusinesses", true);
            response.put("businessId", business.getId());
            response.put("businessName", business.getBusinessName());
            response.put("isApproved", business.isApproved());
            
            if (business.isApproved()) {
                response.put("status", "APPROVED");
                response.put("message", "Your business is approved and active");
            } else {
                response.put("status", "PENDING");
                response.put("message", "Your business is pending approval");
            }
            
            System.out.println("Business status: " + response.get("status"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error getting business status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }
}