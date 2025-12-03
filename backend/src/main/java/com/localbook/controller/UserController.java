package com.localbook.controller;

import com.localbook.dto.LoginRequest;
import com.localbook.dto.UserResponseDTO;
import com.localbook.model.User;
import com.localbook.model.UserRole;
import com.localbook.model.UserNotificationSettings;
import com.localbook.service.UserService;
import com.localbook.repository.UserNotificationSettingsRepository;
import com.localbook.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
    origins = {
        "http://localhost:5173",      // for your web frontend
        "http://192.168.1.15:8081",   // for React Native (Metro or emulator)
        "*"                            // ✅ Allow all origins for mobile testing
    },
    allowedHeaders = "*",
    allowCredentials = "false"          // ✅ Set to false when using wildcard
)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserNotificationSettingsRepository settingsRepository;  // ✅ NEW
    
    // Register a new client
    @PostMapping("/register/client")
public ResponseEntity<? > registerClient(@RequestBody User user) {
    try {
        User newUser = userService.registerClient(user);
        
        // ✅ Create default notification settings
        createDefaultNotificationSettings(newUser.getId());
        
        // ✅ Generate JWT token
        String token = jwtUtil.generateToken(
            newUser.getId(),
            newUser.getEmail(),
            newUser.getRole().toString()
        );
        
        // Build response with token
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", newUser.getId());
        userResponse.put("name", newUser. getName());
        userResponse.put("email", newUser.getEmail());
        userResponse.put("phoneNumber", newUser.getPhoneNumber());
        userResponse. put("role", newUser.getRole().toString());
        userResponse.put("businessId", newUser.getBusinessId());
        
        Map<String, Object> response = new HashMap<>();
        response. put("token", token);
        response.put("user", userResponse);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
        
    } catch (IllegalArgumentException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}

@PostMapping("/register/business-owner")
public ResponseEntity<?> registerBusinessOwner(@RequestBody User user) {
    try {
        User newUser = userService.registerBusinessOwner(user);
        
        // ✅ Create default notification settings
        createDefaultNotificationSettings(newUser.getId());
        
        // ✅ Generate JWT token
        String token = jwtUtil.generateToken(
            newUser.getId(),
            newUser.getEmail(),
            newUser.getRole().toString()
        );
        
        // Build response with token
        Map<String, Object> userResponse = new HashMap<>();
        userResponse. put("id", newUser.getId());
        userResponse.put("name", newUser.getName());
        userResponse.put("email", newUser.getEmail());
        userResponse.put("phoneNumber", newUser.getPhoneNumber());
        userResponse.put("role", newUser.getRole().toString());
        userResponse.put("businessId", newUser.getBusinessId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", userResponse);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
        
    } catch (IllegalArgumentException e) {
        Map<String, String> error = new HashMap<>();
        error.put("message", e.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
    // Login with JWT token generation
    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    System.out.println("📥 Login request for: " + loginRequest.getEmail());
    
    try {
        // Authenticate user
        User user = userService. getUserByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        
        // Verify password (add proper password checking here)
        // For now, assuming password is already validated in userService
        
        // ✅ NEW: Ensure notification settings exist
        createDefaultNotificationSettings(user.getId());
        
        // ✅ FIXED: Generate REAL JWT token
        String token = jwtUtil.generateToken(
            user.getId(),
            user.getEmail(),
            user. getRole(). toString()
        );
        
        System.out.println("🔐 Generated JWT for user " + user.getId() + ": " + token. substring(0, 20) + "...");
        
        // Build response
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("name", user. getName());
        userResponse.put("email", user.getEmail());
        userResponse.put("phoneNumber", user.getPhoneNumber());
        userResponse.put("role", user.getRole().toString());
        userResponse.put("businessId", user.getBusinessId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);  // ✅ CHANGED: Use real JWT
        response.put("user", userResponse);
        
        System. out.println("✅ Login successful for user: " + user.getId());
        
        return ResponseEntity. ok(response);
        
    } catch (IllegalArgumentException e) {
        System.out.println("❌ Login failed: " + e.getMessage());
        
        Map<String, String> error = new HashMap<>();
        error. put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
    
    // ✅ NEW: Helper method to create default notification settings
    private void createDefaultNotificationSettings(Long userId) {
        try {
            Optional<UserNotificationSettings> existing = settingsRepository.findByUserId(userId);
            
            if (existing.isEmpty()) {
                UserNotificationSettings settings = new UserNotificationSettings(userId);
                settingsRepository.save(settings);
                System.out.println("✅ Created default notification settings for user " + userId);
            } else {
                System.out.println("ℹ️ Notification settings already exist for user " + userId);
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to create notification settings for user " + userId + ": " + e.getMessage());
            // Don't fail the registration/login if notification settings fail
        }
    }
    
    // Get all users (Admin only - add authorization later)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        
        if (user.isPresent()) {
            return new ResponseEntity<>(user.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Get all clients
    @GetMapping("/clients")
    public ResponseEntity<List<User>> getAllClients() {
        List<User> clients = userService.getAllClients();
        return new ResponseEntity<>(clients, HttpStatus.OK);
    }
    
    // Get all business owners
    @GetMapping("/business-owners")
    public ResponseEntity<List<User>> getAllBusinessOwners() {
        List<User> businessOwners = userService.getAllBusinessOwners();
        return new ResponseEntity<>(businessOwners, HttpStatus.OK);
    }
    
    // Update user profile
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    
    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    // Check if email exists
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}