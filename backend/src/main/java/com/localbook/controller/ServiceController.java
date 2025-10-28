package com.localbook.controller;

import com.localbook.model.Service;
import com.localbook.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {
    
    @Autowired
    private ServiceService serviceService;
    
    // Create a new service
    @PostMapping
    public ResponseEntity<Service> createService(@RequestBody Service service, 
                                                 @RequestParam Long businessId) {
        try {
            Service newService = serviceService.createService(service, businessId);
            return new ResponseEntity<>(newService, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get all services
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() {
        List<Service> services = serviceService.getAllServices();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
    
    // Get service by ID
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Optional<Service> service = serviceService.getServiceById(id);
        
        if (service.isPresent()) {
            return new ResponseEntity<>(service.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Get all services offered by a specific business
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Service>> getServicesByBusiness(@PathVariable Long businessId) {
        List<Service> services = serviceService.getServicesByBusiness(businessId);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
    
    // Search services by name
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<Service>> searchServicesByName(@PathVariable String keyword) {
        List<Service> services = serviceService.searchServicesByName(keyword);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
    
    // Get services by price range
    @GetMapping("/price-range")
    public ResponseEntity<List<Service>> getServicesByPriceRange(
            @RequestParam Double minPrice, @RequestParam Double maxPrice) {
        List<Service> services = serviceService.getServicesByPriceRange(minPrice, maxPrice);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
    
    // Get affordable services (under a certain price)
    @GetMapping("/affordable/{maxPrice}")
    public ResponseEntity<List<Service>> getAffordableServices(@PathVariable Double maxPrice) {
        List<Service> services = serviceService.getAffordableServices(maxPrice);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
    
    // Update service
    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, 
                                                 @RequestBody Service service,
                                                 @RequestParam Long businessId) {
        try {
            Service updatedService = serviceService.updateService(id, service, businessId);
            return new ResponseEntity<>(updatedService, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Delete service
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Long id, @RequestParam Long businessId) {
        try {
            serviceService.deleteService(id, businessId);
            return new ResponseEntity<>("Service deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }
    }
}