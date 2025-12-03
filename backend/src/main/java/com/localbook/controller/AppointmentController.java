package com.localbook.controller;

import com.localbook.model.Appointment;
import com.localbook.model.AppointmentStatus;
import com.localbook.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.localbook.model.Service;
import java.util.Collections;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(
            @RequestParam Long userId,
            @RequestParam Long businessId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam(required = false) String notes) {
        try {
            Appointment appointment = appointmentService.createAppointment(
                userId, businessId, serviceId, dateTime, notes);
            return new ResponseEntity<>(appointment, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        
        if (appointment.isPresent()) {
            return new ResponseEntity<>(appointment.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Appointment>> getUserAppointments(@PathVariable Long userId) {
        List<Appointment> appointments = appointmentService.getUserAppointments(userId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingUserAppointments(@PathVariable Long userId) {
        List<Appointment> appointments = appointmentService.getUpcomingUserAppointments(userId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
@GetMapping("/business/{businessId}/today")
public ResponseEntity<List<Appointment>> getTodayBusinessAppointments(@PathVariable Long businessId) {
    try {
        List<Appointment> appointments = appointmentService.getTodayBusinessAppointments(businessId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    } catch (Exception e) {
        System.err.println("❌ Error fetching today's appointments: " + e.getMessage());
        return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
    
    @GetMapping("/user/{userId}/past")
    public ResponseEntity<List<Appointment>> getPastUserAppointments(@PathVariable Long userId) {
        List<Appointment> appointments = appointmentService.getPastUserAppointments(userId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<Appointment>> getBusinessAppointments(@PathVariable Long businessId) {
        List<Appointment> appointments = appointmentService.getBusinessAppointments(businessId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    @GetMapping("/business/{businessId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingBusinessAppointments(@PathVariable Long businessId) {
        List<Appointment> appointments = appointmentService.getUpcomingBusinessAppointments(businessId);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Appointment>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        List<Appointment> appointments = appointmentService.getAppointmentsByStatus(status);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }
    
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

   @GetMapping("/business/{businessId}/booked-slots")
public ResponseEntity<? > getBookedSlots(
        @PathVariable Long businessId,
        @RequestParam(required = false) String date) {
    try {
        System.out.println("📅 Fetching booked slots for business: " + businessId);
        System.out.println("📅 Date parameter received: " + date);
        
        // ✅ Validate date parameter
        if (date == null || date.isEmpty()) {
            System.err.println("❌ Date parameter is missing or empty");
            return ResponseEntity.badRequest().body("Date parameter is required.  Format: YYYY-MM-DD");
        }
        
        // Parse date: YYYY-MM-DD
        LocalDate selectedDate;
        try {
            selectedDate = LocalDate.parse(date, DateTimeFormatter.ISO_DATE);
            System.out.println("✅ Parsed date: " + selectedDate);
        } catch (DateTimeParseException e) {
            System.err.println("❌ Invalid date format: " + date);
            return ResponseEntity.badRequest().body("Invalid date format. Expected: YYYY-MM-DD");
        }
        
        // Get all appointments for the business on that date
        List<Appointment> appointments = appointmentService.getBusinessAppointments(businessId);
        
        System.out.println("📋 Total appointments for business: " + appointments.size());
        
        List<String> bookedSlots = new ArrayList<>();
        
        for (Appointment apt : appointments) {
            LocalDate appointmentDate = apt.getAppointmentDateTime().toLocalDate();
            
            System.out.println("  🔍 Checking appointment " + apt.getId() + 
                             " | Date: " + appointmentDate + 
                             " | Status: " + apt.getStatus());
            
            // Only include appointments on the selected date that are CONFIRMED
            if (appointmentDate. equals(selectedDate) && apt.getStatus() == AppointmentStatus.CONFIRMED) {
                // Extract start time: HH:MM
                String startTime = apt.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("HH:mm"));
                bookedSlots.add(startTime);
                
                // ✅ Also block slots during the service duration
                Service service = apt.getService();
                if (service != null && service.getDurationMinutes() != null) {
                    int durationMinutes = service.getDurationMinutes();
                    LocalDateTime startDateTime = apt.getAppointmentDateTime();
                    LocalDateTime endDateTime = startDateTime.plusMinutes(durationMinutes);
                    
                    System.out.println("  ⏱️ Service duration: " + durationMinutes + " minutes");
                    System.out.println("  🕐 Start: " + startTime + " | End: " + endDateTime. format(DateTimeFormatter.ofPattern("HH:mm")));
                    
                    // Block intermediate slots
                    LocalDateTime currentSlot = startDateTime;
                    while (currentSlot.isBefore(endDateTime)) {
                        currentSlot = currentSlot.plusMinutes(15);
                        if (currentSlot.isBefore(endDateTime)) {
                            String slotTime = currentSlot. format(DateTimeFormatter.ofPattern("HH:mm"));
                            if (!bookedSlots.contains(slotTime)) {
                                bookedSlots.add(slotTime);
                                System.out.println("  ✓ Also blocking: " + slotTime + " (during service)");
                            }
                        }
                    }
                }
                
                System.out.println("  ✓ Booked: " + startTime);
            }
        }
        
        // Sort the booked slots
        Collections.sort(bookedSlots);
        
        System.out.println("✅ Total booked slots returned: " + bookedSlots. size());
        System.out. println("📋 Booked slots: " + bookedSlots);
        
        return ResponseEntity.ok(bookedSlots);
        
    } catch (Exception e) {
        System.err.println("❌ Error fetching booked slots: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                           .body("Internal server error: " + e.getMessage());
    }
}
    // ✅ FIXED: Cancel now uses userId (no changes needed, already correct)
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
    
    // ✅ FIXED: Complete now uses userId instead of businessId
    @PutMapping("/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable Long id, 
                                                           @RequestParam Long userId) {
        try {
            Appointment completedAppointment = appointmentService.completeAppointment(id, userId);
            return new ResponseEntity<>(completedAppointment, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }
    
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