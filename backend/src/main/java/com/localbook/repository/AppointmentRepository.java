package com.localbook.repository;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByUserId(Long userId);
    
    List<Appointment> findByBusinessId(Long businessId);
    
    List<Appointment> findByStatus(AppointmentStatus status);
    
    List<Appointment> findByUserIdAndStatus(Long userId, AppointmentStatus status);
    
    List<Appointment> findByBusinessIdAndStatus(Long businessId, AppointmentStatus status);
    
    List<Appointment> findByUserIdAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
        Long userId, LocalDateTime dateTime);
    
    List<Appointment> findByUserIdAndAppointmentDateTimeBeforeOrderByAppointmentDateTimeDesc(
        Long userId, LocalDateTime dateTime);
    
    List<Appointment> findByBusinessIdAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(
        Long businessId, LocalDateTime dateTime);
    
    List<Appointment> findByBusinessIdAndAppointmentDateTimeBeforeOrderByAppointmentDateTimeDesc(
        Long businessId, LocalDateTime dateTime);
    
    List<Appointment> findByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByBusinessIdAndAppointmentDateTimeBetween(
        Long businessId, LocalDateTime start, LocalDateTime end);
}