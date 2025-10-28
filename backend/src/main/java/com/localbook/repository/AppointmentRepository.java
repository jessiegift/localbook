package com.localbook.repository;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import com.localbook.model.User;
import com.localbook.model.Business;
import com.localbook.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    // Find appointments by client
    List<Appointment> findByClientId(Long clientId);
    
    // Find appointments by business
    List<Appointment> findByBusinessId(Long businessId);
    
    // Find appointments by service
    List<Appointment> findByServiceId(Long serviceId);
    
    // Find appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);
    
    // Find appointments by client and status
    List<Appointment> findByClientIdAndStatus(Long clientId, AppointmentStatus status);
    
    // Find appointments by business and status
    List<Appointment> findByBusinessIdAndStatus(Long businessId, AppointmentStatus status);
    
    // Find upcoming appointments for a client (after a certain date)
    List<Appointment> findByClientIdAndAppointmentDateTimeAfter(Long clientId, LocalDateTime dateTime);
    
    // Find upcoming appointments for a business
    List<Appointment> findByBusinessIdAndAppointmentDateTimeAfter(Long businessId, LocalDateTime dateTime);
    
    // Find past appointments for a client
    List<Appointment> findByClientIdAndAppointmentDateTimeBefore(Long clientId, LocalDateTime dateTime);
    
    // Find appointments on a specific date for a business
    List<Appointment> findByBusinessIdAndAppointmentDateTimeBetween(
        Long businessId, LocalDateTime start, LocalDateTime end);
    
    // Find appointments for a specific service on a specific date
    List<Appointment> findByServiceIdAndAppointmentDateTimeBetween(
        Long serviceId, LocalDateTime start, LocalDateTime end);
    
    // Check if appointment exists at a specific time for a business
    boolean existsByBusinessIdAndAppointmentDateTime(Long businessId, LocalDateTime dateTime);
    
    // Check if client has an appointment at a specific time
    boolean existsByClientIdAndAppointmentDateTime(Long clientId, LocalDateTime dateTime);
    
    // Find all confirmed appointments for a business
    List<Appointment> findByBusinessIdAndStatusAndAppointmentDateTimeAfter(
        Long businessId, AppointmentStatus status, LocalDateTime dateTime);
}