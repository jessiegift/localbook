package com.localbook.controller;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import com.localbook.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    // Create a new appointment (Client books)
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(
            @RequestParam Long clientId,
            @RequestParam Long businessId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(required = false) String notes) {
        try {
            Appointment appointment = appointmentService.createAppointment(
                clientId, businessId, serviceId, dateTime, notes);
            return new ResponseEntity<>(appointment, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Get all appointments
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get appointment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        
        if (appointment.isPresent()) {
            return new ResponseEntity<>(appointment.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Get all appointments for a client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Appointment>> getClientAppointments(@PathVariable Long clientId) {
        List<Appointment> appointments = appointmentService.getClientAppointments(clientId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get upcoming appointments for a client
    @GetMapping("/client/{clientId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingClientAppointments(@PathVariable Long clientId) {
        List<Appointment> appointments = appointmentService.getUpcomingClientAppointments(clientId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get past appointments for a client
    @GetMapping("/client/{clientId}/past")
    public ResponseEntity<List<Appointment>> getPastClientAppointments(@PathVariable Long clientId) {
        List<Appointment> appointments = appointmentService.getPastClientAppointments(clientId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get all appointments for a business
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Appointment>> getBusinessAppointments(@PathVariable Long businessId) {
        List<Appointment> appointments = appointmentService.getBusinessAppointments(businessId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get upcoming appointments for a business
    @GetMapping("/business/{businessId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingBusinessAppointments(@PathVariable Long businessId) {
        List<Appointment> appointments = appointmentService.getUpcomingBusinessAppointments(businessId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Get appointments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    // Confirm appointment (Business owner)
    @PutMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirmAppointment(@PathVariable Long id, 
                                                          @RequestParam Long businessId) {
        try {
            Appointment confirmedAppointment = appointmentService.confirmAppointment(id, businessId);
            return new ResponseEntity<>(confirmedAppointment, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Cancel appointment (Client or Business)
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancelAppointment(@PathVariable Long id, 
                                                         @RequestParam Long userId) {
        try {
            Appointment cancelledAppointment = appointmentService.cancelAppointment(id, userId);
            return new ResponseEntity<>(cancelledAppointment, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Complete appointment (Business owner)
    @PutMapping("/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id, 
                                                           @RequestParam Long businessId) {
        try {
            Appointment completedAppointment = appointmentService.completeAppointment(id, businessId);
            return new ResponseEntity<>(completedAppointment, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Reschedule appointment
    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDateTime,
            @RequestParam Long userId) {
        try {
            Appointment rescheduledAppointment = appointmentService.rescheduleAppointment(id, newDateTime, userId);
            return new ResponseEntity<>(rescheduledAppointment, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    // Delete appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long id, @RequestParam Long userId) {
        try {
            appointmentService.deleteAppointment(id, userId);
            return new ResponseEntity<>("Appointment deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        }
    }
}