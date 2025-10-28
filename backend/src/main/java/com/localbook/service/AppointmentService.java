package com.localbook.service;
import com.localbook.model.AppointmentStatus;
import com.localbook.model.*;
import com.localbook.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BusinessRepository businessRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    // Create a new appointment (Client books)
    public Appointment createAppointment(Long clientId, Long businessId, 
                                        Long serviceId, LocalDateTime dateTime, String notes) {
        // Verify client exists
        Optional<User> client = userRepository.findById(clientId);
        if (client.isEmpty() || client.get().getRole() != UserRole.CLIENT) {
            throw new IllegalArgumentException("Invalid client ID");
        }
        
        // Verify business exists and is approved
        Optional<Business> business = businessRepository.findById(businessId);
        if (business.isEmpty() || !business.get().isApproved()) {
            throw new IllegalArgumentException("Business not found or not approved");
        }
        
        // Verify service exists and belongs to this business
        Optional<com.localbook.model.Service> service = serviceRepository.findById(serviceId);
        if (service.isEmpty() || !service.get().getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("Service not found or doesn't belong to this business");
        }
        
        // Check if appointment time is in the future
        if (dateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book appointments in the past");
        }
        
        // Check if time slot is already taken
        if (appointmentRepository.existsByBusinessIdAndAppointmentDateTime(businessId, dateTime)) {
            throw new IllegalArgumentException("This time slot is already booked");
        }
        
        // Check if client already has an appointment at this time
        if (appointmentRepository.existsByClientIdAndAppointmentDateTime(clientId, dateTime)) {
            throw new IllegalArgumentException("You already have an appointment at this time");
        }
        
        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setClient(client.get());
        appointment.setBusiness(business.get());
        appointment.setService(service.get());
        appointment.setAppointmentDateTime(dateTime);
        appointment.setNotes(notes);
        appointment.setStatus(AppointmentStatus.PENDING);
        
        return appointmentRepository.save(appointment);
    }
    
    // Get all appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    // Get appointment by ID
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    // Get all appointments for a client
    public List<Appointment> getClientAppointments(Long clientId) {
        return appointmentRepository.findByClientId(clientId);
    }
    
    // Get upcoming appointments for a client
    public List<Appointment> getUpcomingClientAppointments(Long clientId) {
        return appointmentRepository.findByClientIdAndAppointmentDateTimeAfter(
            clientId, LocalDateTime.now());
    }
    
    // Get past appointments for a client
    public List<Appointment> getPastClientAppointments(Long clientId) {
        return appointmentRepository.findByClientIdAndAppointmentDateTimeBefore(
            clientId, LocalDateTime.now());
    }
    
    // Get all appointments for a business
    public List<Appointment> getBusinessAppointments(Long businessId) {
        return appointmentRepository.findByBusinessId(businessId);
    }
    
    // Get upcoming appointments for a business
    public List<Appointment> getUpcomingBusinessAppointments(Long businessId) {
        return appointmentRepository.findByBusinessIdAndAppointmentDateTimeAfter(
            businessId, LocalDateTime.now());
    }
    
    // Get appointments by status
    public List<Appointment> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }
    
    // Confirm appointment (Business owner)
    public Appointment confirmAppointment(Long appointmentId, Long businessId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        
        if (appointment.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }
        
        Appointment appt = appointment.get();
        
        // Verify the appointment belongs to this business
        if (!appt.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("You can only confirm your own appointments");
        }
        
        appt.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentRepository.save(appt);
    }
    
    // Cancel appointment (Client or Business)
    public Appointment cancelAppointment(Long appointmentId, Long userId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        
        if (appointment.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }
        
        Appointment appt = appointment.get();
        
        // Verify user is either the client or the business owner
        boolean isClient = appt.getClient().getId().equals(userId);
        boolean isBusinessOwner = appt.getBusiness().getOwner().getId().equals(userId);
        
        if (!isClient && !isBusinessOwner) {
            throw new IllegalArgumentException("You don't have permission to cancel this appointment");
        }
        
        appt.setStatus(AppointmentStatus.CANCELED);
        return appointmentRepository.save(appt);
    }
    
    // Mark appointment as completed (Business owner)
    public Appointment completeAppointment(Long appointmentId, Long businessId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        
        if (appointment.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }
        
        Appointment appt = appointment.get();
        
        if (!appt.getBusiness().getId().equals(businessId)) {
            throw new IllegalArgumentException("You can only complete your own appointments");
        }
        
        appt.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appt);
    }
    
    // Reschedule appointment
    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, Long userId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        
        if (appointment.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }
        
        Appointment appt = appointment.get();
        
        // Verify user is the client
        if (!appt.getClient().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the client can reschedule");
        }
        
        // Check if new time is in the future
        if (newDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot reschedule to past time");
        }
        
        // Check if new time slot is available
        if (appointmentRepository.existsByBusinessIdAndAppointmentDateTime(
                appt.getBusiness().getId(), newDateTime)) {
            throw new IllegalArgumentException("This time slot is already booked");
        }
        
        appt.setAppointmentDateTime(newDateTime);
        appt.setStatus(AppointmentStatus.PENDING);  // Reset to pending
        
        return appointmentRepository.save(appt);
    }
    
    // Delete appointment
    public void deleteAppointment(Long appointmentId, Long userId) {
        Optional<Appointment> appointment = appointmentRepository.findById(appointmentId);
        
        if (appointment.isEmpty()) {
            throw new IllegalArgumentException("Appointment not found");
        }
        
        Appointment appt = appointment.get();
        
        // Only client or business owner can delete
        boolean isClient = appt.getClient().getId().equals(userId);
        boolean isBusinessOwner = appt.getBusiness().getOwner().getId().equals(userId);
        
        if (!isClient && !isBusinessOwner) {
            throw new IllegalArgumentException("You don't have permission to delete this appointment");
        }
        
        appointmentRepository.deleteById(appointmentId);
    }

    
}