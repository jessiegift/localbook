package com.localbook.repository;

import com.localbook.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    // Find all services offered by a specific business
    List<Service> findByBusinessId(Long businessId);
    
    // Find services by name (search)
    List<Service> findByServiceNameContainingIgnoreCase(String keyword);
    
    // Find services by price range
    List<Service> findByPriceBetween(Double minPrice, Double maxPrice);
    
    // Find services cheaper than a price
    List<Service> findByPriceLessThan(Double price);
    
    // Find services by duration
    List<Service> findByDurationMinutes(Integer duration);
    
    // Find services by business and price range
    List<Service> findByBusinessIdAndPriceBetween(Long businessId, Double minPrice, Double maxPrice);
    
    // Check if a service name exists for a specific business
    boolean existsByServiceNameAndBusinessId(String serviceName, Long businessId);
}