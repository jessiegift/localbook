package com.localbook.service;

import com.localbook.model.Appointment;
import com.localbook.model.Business;
import com.localbook.model.Rating;
import com.localbook.model.User;
import com.localbook.repository.AppointmentRepository;
import com.localbook.repository.BusinessRepository;
import com.localbook.repository.RatingRepository;
import com.localbook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RatingService {
    
    @Autowired
    private RatingRepository ratingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public Rating createRating(
            Long userId,
            Long businessId,
            Long appointmentId,
            Integer rating,
            String review) {
        
        System.out.println("=== CREATE RATING SERVICE ===");
        System.out.println("User ID: " + userId);
        System.out.println("Business ID: " + businessId);
        System.out.println("Appointment ID: " + appointmentId);
        System.out.println("Rating: " + rating);
        
        final Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() == false) {
            final String errorMessage = "User not found with ID: " + userId;
            throw new IllegalArgumentException(errorMessage);
        }
        final User user = userOpt.get();
        
        final Optional<Business> businessOpt = businessRepository.findById(businessId);
        if (businessOpt.isPresent() == false) {
            final String errorMessage = "Business not found with ID: " + businessId;
            throw new IllegalArgumentException(errorMessage);
        }
        final Business business = businessOpt.get();
        
        final Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent() == false) {
            final String errorMessage = "Appointment not found with ID: " + appointmentId;
            throw new IllegalArgumentException(errorMessage);
        }
        final Appointment appointment = appointmentOpt.get();
        
        final Long appointmentUserId = appointment.getUser().getId();
        final boolean isUserMatch = appointmentUserId.equals(userId);
        if (isUserMatch == false) {
            throw new IllegalArgumentException("Appointment does not belong to this user");
        }
        
        final Long appointmentBusinessId = appointment.getBusiness().getId();
        final boolean isBusinessMatch = appointmentBusinessId.equals(businessId);
        if (isBusinessMatch == false) {
            throw new IllegalArgumentException("Appointment is not for this business");
        }
        
        final Optional<Rating> existingRatingOpt = ratingRepository.findByAppointment(appointment);
        if (existingRatingOpt.isPresent() == true) {
            throw new IllegalArgumentException("Rating already exists for this appointment");
        }
        
        final Rating newRating = new Rating();
        newRating.setUser(user);
        newRating.setBusiness(business);
        newRating.setAppointment(appointment);
        newRating.setRating(rating);
        newRating.setReview(review);
        newRating.setCreatedAt(LocalDateTime.now());
        
        final Rating savedRating = ratingRepository.save(newRating);
        
        System.out.println("✅ Rating created with ID: " + savedRating.getId());
        
        return savedRating;
    }
    
    public List<Rating> getBusinessRatings(Long businessId) {
        System.out.println("📊 Fetching ratings for business ID: " + businessId);
        
        final Optional<Business> businessOpt = businessRepository.findById(businessId);
        if (businessOpt.isPresent() == false) {
            final String errorMessage = "Business not found with ID: " + businessId;
            throw new IllegalArgumentException(errorMessage);
        }
        
        final Business business = businessOpt.get();
        final List<Rating> ratings = ratingRepository.findByBusinessOrderByCreatedAtDesc(business);
        final int ratingsCount = ratings.size();
        
        System.out.println("✅ Found " + ratingsCount + " ratings");
        
        return ratings;
    }
    
    // ✅ NEW METHOD: Get ratings by User object
    public List<Rating> getUserRatings(User user) {
        System.out.println("👤 Fetching ratings for user ID: " + user.getId());
        
        final List<Rating> ratings = ratingRepository.findByUserOrderByCreatedAtDesc(user);
        final int ratingsCount = ratings.size();
        
        System.out.println("✅ Found " + ratingsCount + " ratings by user");
        
        return ratings;
    }
    
    // ✅ NEW METHOD: Get ratings by User ID
    public List<Rating> getUserRatings(Long userId) {
        System.out.println("👤 Fetching ratings for user ID: " + userId);
        
        final Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() == false) {
            final String errorMessage = "User not found with ID: " + userId;
            throw new IllegalArgumentException(errorMessage);
        }
        
        final User user = userOpt.get();
        final List<Rating> ratings = ratingRepository.findByUserOrderByCreatedAtDesc(user);
        final int ratingsCount = ratings.size();
        
        System.out.println("✅ Found " + ratingsCount + " ratings by user");
        
        return ratings;
    }
    
    // ✅ NEW METHOD: Get rating by appointment ID
    public Optional<Rating> getRatingByAppointment(Long appointmentId) {
        System.out.println("🔍 Fetching rating for appointment ID: " + appointmentId);
        
        final Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent() == false) {
            final String errorMessage = "Appointment not found with ID: " + appointmentId;
            throw new IllegalArgumentException(errorMessage);
        }
        
        final Appointment appointment = appointmentOpt.get();
        final Optional<Rating> ratingOpt = ratingRepository.findByAppointment(appointment);
        
        if (ratingOpt.isPresent() == true) {
            System.out.println("✅ Rating found for appointment");
        } else {
            System.out.println("⚠️ No rating found for appointment");
        }
        
        return ratingOpt;
    }
    
    public void deleteRating(Long ratingId, Long userId) {
        System.out.println("🗑️ Delete rating ID: " + ratingId + " by user ID: " + userId);
        
        final Optional<Rating> ratingOpt = ratingRepository.findById(ratingId);
        if (ratingOpt.isPresent() == false) {
            final String errorMessage = "Rating not found with ID: " + ratingId;
            throw new IllegalArgumentException(errorMessage);
        }
        
        final Rating rating = ratingOpt.get();
        final Long ratingUserId = rating.getUser().getId();
        final boolean isUserMatch = ratingUserId.equals(userId);
        
        if (isUserMatch == false) {
            throw new IllegalArgumentException("Not authorized to delete this rating");
        }
        
        ratingRepository.delete(rating);
        
        System.out.println("✅ Rating deleted successfully");
    }
    
    public double getAverageRating(Long businessId) {
        System.out.println("📊 Calculating average rating for business ID: " + businessId);
        
        final List<Rating> ratings = getBusinessRatings(businessId);
        final int totalRatings = ratings.size();
        
        if (totalRatings == 0) {
            System.out.println("⚠️ No ratings found, returning 0.0");
            return 0.0;
        }
        
        double totalScore = 0.0;
        int ratingIndex = 0;
        
        while (ratingIndex < totalRatings) {
            final Rating currentRating = ratings.get(ratingIndex);
            final Integer ratingValue = currentRating.getRating();
            final double ratingDouble = ratingValue.doubleValue();
            totalScore = totalScore + ratingDouble;
            ratingIndex = ratingIndex + 1;
        }
        
        final double averageRating = totalScore / totalRatings;
        final double roundedAverage = Math.round(averageRating * 10.0) / 10.0;
        
        System.out.println("✅ Average rating: " + roundedAverage + " from " + totalRatings + " ratings");
        
        return roundedAverage;
    }
    
    public int getTotalRatings(Long businessId) {
        System.out.println("📊 Counting ratings for business ID: " + businessId);
        
        final List<Rating> ratings = getBusinessRatings(businessId);
        final int totalRatings = ratings.size();
        
        System.out.println("✅ Total ratings: " + totalRatings);
        
        return totalRatings;
    }
}