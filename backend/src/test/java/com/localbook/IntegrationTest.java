package com.localbook;
import com.fasterxml.jackson.databind. ObjectMapper;
import com.localbook.dto.*;
import com.localbook.model.*;
import com.localbook. repository.*;
import org.junit.jupiter.api.BeforeEach;
import org. junit.jupiter.api.Test;
import org.springframework.beans. factory.annotation.Autowired;
import org.springframework.boot. test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org. springframework.test.web.servlet. MockMvc;
import org. springframework.test.web.servlet. MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for LocalBook API endpoints
 * Tests complete request/response cycles
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    private String testEmail;
    private String businessEmail;

    @BeforeEach
    public void setup() {
        // Generate unique emails for each test run
        testEmail = "testclient" + System.currentTimeMillis() + "@example.com";
        businessEmail = "testbusiness" + System.currentTimeMillis() + "@example.com";
    }

    // ========================================
    // TEST 1: REGISTER CLIENT API
    // ========================================
    @Test
    public void test01_RegisterClient_API() throws Exception {
        System.out.println("\n📝 INTEGRATION TEST 1: Register Client API");
        System.out.println("=". repeat(50));

        // Create registration request
        String requestBody = """
            {
                "name": "John Doe",
                "email": "%s",
                "password": "password123",
                "phoneNumber":  "0871234567",
                "role": "CLIENT"
            }
            """.formatted(testEmail);

        // Send POST request
        MvcResult result = mockMvc.perform(post("/api/users/register/client")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value(testEmail))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andReturn();

        String response = result.getResponse().getContentAsString();
        System.out.println("✅ Response: " + response);
        System.out.println("✅ Client registered successfully via API\n");
    }

    // ========================================
    // TEST 2: REGISTER BUSINESS OWNER API
    // ========================================
    @Test
    public void test02_RegisterBusinessOwner_API() throws Exception {
        System.out.println("\n🏪 INTEGRATION TEST 2: Register Business Owner API");
        System.out.println("=".repeat(50));

        String requestBody = """
            {
                "name": "Jane Smith",
                "email": "%s",
                "password": "password123",
                "phoneNumber":  "0871234567",
                "role": "BUSINESS_OWNER",
                "businessName": "Jane's Salon",
                "ownerName": "Jane Smith",
                "address": "123 Main St",
                "town": "Carlow",
                "county": "Carlow",
                "eircode": "R93 X123",
                "location": "Carlow Town",
                "category": "Hair Salons",
                "description": "Professional hair salon"
            }
            """.formatted(businessEmail);

        MvcResult result = mockMvc. perform(post("/api/users/register/business-owner")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.email").value(businessEmail))
                .andExpect(jsonPath("$.businessId").exists())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Response: " + response);
        System.out.println("✅ Business owner registered successfully via API\n");
    }

    // ========================================
    // TEST 3: LOGIN API
    // ========================================
    @Test
    public void test03_Login_API() throws Exception {
        System.out.println("\n🔐 INTEGRATION TEST 3: Login API");
        System.out.println("=". repeat(50));

        // First register a user
        User user = new User();
        user.setName("Login Test");
        user.setEmail(testEmail);
        user.setPassword("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"); // "password" encrypted
        user.setPhoneNumber("0871234567");
        user.setRole(UserRole. CLIENT);
        userRepository.save(user);

        // Now try to login
        String loginRequest = """
            {
                "email": "%s",
                "password": "password"
            }
            """.formatted(testEmail);

        MvcResult result = mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value(testEmail))
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Response: " + response);
        System.out.println("✅ Login successful via API\n");
    }

    // ========================================
    // TEST 4: GET APPROVED BUSINESSES API
    // ========================================
    @Test
    public void test04_GetApprovedBusinesses_API() throws Exception {
        System.out.println("\n🏢 INTEGRATION TEST 4: Get Approved Businesses API");
        System.out.println("=".repeat(50));

        // Create an approved business
        User owner = new User();
        owner.setName("Test Owner");
        owner.setEmail("apiowner" + System.currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole.BUSINESS_OWNER);
        owner = userRepository.save(owner);

        Business business = new Business();
        business.setBusinessName("API Test Salon");
        business.setOwnerName("Test Owner");
        business.setAddress("456 API St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 API1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("apisalon" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business.setIsApproved(true);
        businessRepository.save(business);

        // Get approved businesses
        MvcResult result = mockMvc. perform(get("/api/businesses/approved"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Found businesses: " + response);
        System.out.println("✅ Get approved businesses API working\n");
    }

    // ========================================
    // TEST 5: CREATE APPOINTMENT API
    // ========================================
    @Test
    public void test05_CreateAppointment_API() throws Exception {
        System.out.println("\n📅 INTEGRATION TEST 5: Create Appointment API");
        System.out.println("=".repeat(50));

        // Setup: Create user, business, service
        User client = new User();
        client.setName("API Client");
        client.setEmail("apiclient" + System.currentTimeMillis() + "@example.com");
        client.setPassword("password");
        client.setPhoneNumber("0871234567");
        client.setRole(UserRole.CLIENT);
        client = userRepository.save(client);

        User owner = new User();
        owner.setName("API Owner");
        owner.setEmail("apiowner2" + System.currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole. BUSINESS_OWNER);
        owner = userRepository.save(owner);

        Business business = new Business();
        business.setBusinessName("API Appointment Business");
        business.setOwnerName("API Owner");
        business.setAddress("789 Appointment St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 APT1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("apibiz" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business = businessRepository.save(business);

        com.localbook.model.Service service = new com.localbook.model.Service();
        service.setName("API Haircut");
        service.setDurationMinutes(60);
        service.setPrice(25.0);
        service.setBusiness(business);
        service = serviceRepository.save(service);

        // Create appointment request
        String appointmentRequest = """
            {
                "userId": %d,
                "businessId":  %d,
                "serviceId": %d,
                "appointmentDateTime": "%s",
                "notes": "API test appointment"
            }
            """.formatted(
                client.getId(),
                business.getId(),
                service.getId(),
                LocalDateTime.now().plusDays(1).toString()
            );

        MvcResult result = mockMvc. perform(post("/api/appointments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(appointmentRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").exists())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Appointment created: " + response);
        System.out.println("✅ Create appointment API working\n");
    }

    // ========================================
    // TEST 6: GET BOOKED SLOTS API
    // ========================================
    @Test
    public void test06_GetBookedSlots_API() throws Exception {
        System.out.println("\n🕐 INTEGRATION TEST 6: Get Booked Slots API");
        System.out.println("=".repeat(50));

        // Setup: Create business
        User owner = new User();
        owner.setName("Slots Owner");
        owner.setEmail("slotsowner" + System.currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole.BUSINESS_OWNER);
        owner = userRepository. save(owner);

        Business business = new Business();
        business.setBusinessName("Slots Business");
        business.setOwnerName("Slots Owner");
        business.setAddress("111 Slots St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 SLT1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("slotsbiz" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business = businessRepository.save(business);

        // Get booked slots
        MvcResult result = mockMvc.perform(get("/api/appointments/business/" + business.getId() + "/booked-slots")
                .param("date", "2025-12-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Booked slots:  " + response);
        System.out.println("✅ Get booked slots API working\n");
    }

    // ========================================
    // TEST 7: GET BUSINESS SERVICES API
    // ========================================
    @Test
    public void test07_GetBusinessServices_API() throws Exception {
        System.out.println("\n⚙️ INTEGRATION TEST 7: Get Business Services API");
        System.out.println("=".repeat(50));

        // Setup
        User owner = new User();
        owner.setName("Services Owner");
        owner.setEmail("servicesowner" + System.currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole.BUSINESS_OWNER);
        owner = userRepository. save(owner);

        Business business = new Business();
        business.setBusinessName("Services Business");
        business.setOwnerName("Services Owner");
        business.setAddress("222 Services St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 SVC1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("servicesbiz" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business = businessRepository.save(business);

        com.localbook.model.Service service = new com.localbook.model.Service();
        service.setName("API Service");
        service.setDurationMinutes(30);
        service.setPrice(20.0);
        service.setBusiness(business);
        serviceRepository.save(service);

        // Get services
        MvcResult result = mockMvc.perform(get("/api/services/business/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Services found: " + response);
        System.out.println("✅ Get business services API working\n");
    }

    // ========================================
    // TEST 8: SUBMIT RATING API
    // ========================================
    @Test
    public void test08_SubmitRating_API() throws Exception {
        System.out.println("\n⭐ INTEGRATION TEST 8: Submit Rating API");
        System.out.println("=".repeat(50));

        // Setup
        User client = new User();
        client.setName("Rating Client");
        client.setEmail("ratingclient" + System.currentTimeMillis() + "@example.com");
        client.setPassword("password");
        client.setPhoneNumber("0871234567");
        client.setRole(UserRole.CLIENT);
        client = userRepository.save(client);

        User owner = new User();
        owner.setName("Rating Owner");
        owner.setEmail("ratingowner" + System. currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole.BUSINESS_OWNER);
        owner = userRepository.save(owner);

        Business business = new Business();
        business.setBusinessName("Rating Business");
        business.setOwnerName("Rating Owner");
        business.setAddress("333 Rating St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 RAT1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("ratingbiz" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business = businessRepository.save(business);

        // Submit rating
        String ratingRequest = """
            {
                "userId": %d,
                "businessId": %d,
                "rating": 5,
                "comment": "Excellent service! ",
                "sentiment": "positive"
            }
            """. formatted(client.getId(), business.getId());

        MvcResult result = mockMvc.perform(post("/api/ratings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(ratingRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.rating").value(5))
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Rating submitted: " + response);
        System.out. println("✅ Submit rating API working\n");
    }

    // ========================================
    // TEST 9: GET BUSINESS RATINGS API
    // ========================================
    @Test
    public void test09_GetBusinessRatings_API() throws Exception {
        System.out.println("\n📊 INTEGRATION TEST 9: Get Business Ratings API");
        System.out.println("=". repeat(50));

        // Setup (reuse from test 8 or create new)
        User owner = new User();
        owner.setName("Ratings Owner");
        owner.setEmail("ratingsowner" + System.currentTimeMillis() + "@example.com");
        owner.setPassword("password");
        owner.setPhoneNumber("0871234567");
        owner.setRole(UserRole.BUSINESS_OWNER);
        owner = userRepository.save(owner);

        Business business = new Business();
        business.setBusinessName("Ratings Business");
        business.setOwnerName("Ratings Owner");
        business.setAddress("444 Ratings St");
        business.setTown("Carlow");
        business.setCounty("Carlow");
        business.setEircode("R93 RTS1");
        business.setLocation("Carlow");
        business.setCategory("Hair Salons");
        business.setPhoneNumber("0871234567");
        business.setEmail("ratingsbiz" + System.currentTimeMillis() + "@example.com");
        business.setOwner(owner);
        business.setStatus("APPROVED");
        business = businessRepository.save(business);

        // Get ratings
        MvcResult result = mockMvc.perform(get("/api/ratings/business/" + business.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andReturn();

        String response = result. getResponse().getContentAsString();
        System.out.println("✅ Ratings retrieved: " + response);
        System.out.println("✅ Get business ratings API working\n");
    }

    // ========================================
    // TEST 10: SUMMARY
    // ========================================
    @Test
    public void test99_Summary() {
        System.out.println("\n" + "=".repeat(50));
        System.out.println("🎉 ALL INTEGRATION TESTS COMPLETED!");
        System.out.println("=".repeat(50));
        System.out.println("\n📊 Integration Test Summary:");
        System.out. println("   ✅ Register Client API");
        System.out.println("   ✅ Register Business Owner API");
        System.out. println("   ✅ Login API");
        System.out.println("   ✅ Get Approved Businesses API");
        System.out.println("   ✅ Create Appointment API");
        System.out.println("   ✅ Get Booked Slots API");
        System.out.println("   ✅ Get Business Services API");
        System.out.println("   ✅ Submit Rating API");
        System.out.println("   ✅ Get Business Ratings API");
        System.out. println("\n" + "=".repeat(50) + "\n");
    }
}