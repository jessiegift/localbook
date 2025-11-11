package com.localbook.service;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import com.localbook.model.Business;
import com.localbook.model.User;
import com.localbook.model.Service;
import com.localbook.repository.AppointmentRepository;
import com.localbook.repository.BusinessRepository;
import com.localbook.repository.UserRepository;
import com.localbook.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Transactional
    public Appointment createAppointment(Long userId, Long businessId, Long serviceId, 
                                        LocalDateTime appointmentDateTime, String notes) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        
        Business business = businessRepository.findById(businessId)
            .orElseThrow(() -> new IllegalArgumentException("Business not found with ID: " + businessId));
        
        Service service = serviceRepository.findById(serviceId)
            .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceId));
        
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book appointment in the past");
        }
        
        Appointment appointment = new Appointment();
        appointment.setUser(user);
        appointment.setBusiness(business);
        appointment.setService(service);
        appointment.setAppointmentDateTime(appointmentDateTime);
        appointment.setNotes(notes);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> getUserAppointments(Long userId) {
        return appointmentRepository.findByUserId(userId);
    }
    
    public List<Appointment> getUpcomingUserAppointments(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByUserIdAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(userId, now);
    }
    
    public List<Appointment> getPastUserAppointments(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByUserIdAndAppointmentDateTimeBeforeOrderByAppointmentDateTimeDesc(userId, now);
    }
    
    public List<Appointment> getBusinessAppointments(Long businessId) {
        return appointmentRepository.findByBusinessId(businessId);
    }
    
    public List<Appointment> getUpcomingBusinessAppointments(Long businessId) {
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByBusinessIdAndAppointmentDateTimeAfterOrderByAppointmentDateTimeAsc(businessId, now);
    }
    
    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    
    @Transactional
    public Appointment confirmAppointment(Long appointmentId, Long businessId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        if (!appointment.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Unauthorized: You can only confirm appointments for your business");
        }
        
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        boolean isUser = appointment.getUser().getId().equals(userId);
        boolean isBusiness = appointment.getBusiness().getId().equals(userId);
        
        if (!isUser && !isBusiness) {
            throw new IllegalArgumentException("Unauthorized: You can only cancel your own appointments");
        }
        
        appointment.setStatus(AppointmentStatus.CANCELED);
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public Appointment completeAppointment(Long appointmentId, Long businessId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        if (!appointment.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Unauthorized: You can only complete appointments for your business");
        }
        
        if (appointment.getAppointmentDateTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot complete a future appointment");
        }
        
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        boolean isUser = appointment.getUser().getId().equals(userId);
        boolean isBusiness = appointment.getBusiness().getId().equals(userId);
        
        if (!isUser && !isBusiness) {
            throw new IllegalArgumentException("Unauthorized: You can only reschedule your own appointments");
        }
        
        if (newDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot reschedule appointment to a past date/time");
        }
        
        if (appointment.getStatus() == AppointmentStatus.CANCELED) {
            throw new IllegalArgumentException("Cannot reschedule a cancelled appointment");
        }
        
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot reschedule a completed appointment");
        }
        
        appointment.setAppointmentDateTime(newDateTime);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public void deleteAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        boolean isUser = appointment.getUser().getId().equals(userId);
        boolean isBusiness = appointment.getBusiness().getId().equals(userId);
        
        if (!isUser && !isBusiness) {
            throw new IllegalArgumentException("Unauthorized: You can only delete your own appointments");
        }
        
        appointmentRepository.delete(appointment);
    }
}