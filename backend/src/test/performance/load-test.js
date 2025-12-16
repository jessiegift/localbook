import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

// Custom metrics
let errorCount = new Counter('errors');
let responseTime = new Trend('response_time');

// Test configuration
export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users over 30s
    { duration:  '1m', target: 50 },    // Ramp up to 50 users over 1 min
    { duration: '2m', target: 100 },   // Ramp up to 100 users over 2 min
    { duration: '1m', target: 100 },   // Stay at 100 users for 1 min
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds:  {
    http_req_duration: ['p(95)<500'],  // 95% of requests must be below 500ms
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['count<50'],              // Total errors must be below 50
  },
};

const BASE_URL = 'http://localhost:8080';

// Main test function - simulates user journey
export default function () {
  
  // ==========================================
  // TEST 1: Get Approved Businesses
  // ==========================================
  let businessesRes = http.get(`${BASE_URL}/api/businesses/approved`);
  
  check(businessesRes, {
    'Get Businesses:  status 200': (r) => r.status === 200,
    'Get Businesses: response time OK': (r) => r.timings.duration < 300,
    'Get Businesses:  has data': (r) => {
      try {
        let body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch (e) {
        return false;
      }
    },
  }) || errorCount.add(1);
  
  responseTime.add(businessesRes. timings.duration);
  sleep(1); // User reads the list for 1 second
  
  
  // ==========================================
  // TEST 2: Get Services for Business 1
  // ==========================================
  let servicesRes = http.get(`${BASE_URL}/api/services/business/1`);
  
  check(servicesRes, {
    'Get Services: status 200': (r) => r.status === 200,
    'Get Services: response time OK': (r) => r.timings.duration < 300,
    'Get Services: has data': (r) => {
      try {
        let body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  }) || errorCount.add(1);
  
  responseTime.add(servicesRes.timings.duration);
  sleep(1.5); // User reviews services
  
  
  // ==========================================
  // TEST 3: Get Booked Time Slots
  // ==========================================
  let slotsRes = http.get(
    `${BASE_URL}/api/appointments/business/1/booked-slots?date=2025-12-25`
  );
  
  check(slotsRes, {
    'Get Slots: status 200': (r) => r.status === 200,
    'Get Slots: response time OK': (r) => r.timings.duration < 300,
    'Get Slots:  returns array': (r) => {
      try {
        let body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  }) || errorCount.add(1);
  
  responseTime. add(slotsRes.timings.duration);
  sleep(2); // User selects a time slot
  
  
  // ==========================================
  // TEST 4: Create Appointment
  // ==========================================
  // Generate random user ID to simulate different users
  let randomUserId = Math.floor(Math.random() * 100) + 1;
  
  // Random time to avoid all bookings at same time
  let hours = 10 + Math.floor(Math.random() * 8); // 10-17 (10am-5pm)
  let minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  let appointmentTime = `2025-12-25T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  let appointmentRes = http.post(
    `${BASE_URL}/api/appointments? userId=${randomUserId}&businessId=1&serviceId=1&dateTime=${appointmentTime}&notes=k6 load test`
  );
  
  check(appointmentRes, {
    'Create Appointment: status 201 or 400': (r) => r.status === 201 || r.status === 400,
    'Create Appointment: response time OK': (r) => r.timings.duration < 1000,
  }) || errorCount.add(1);
  
  responseTime. add(appointmentRes.timings.duration);
  
  // If appointment created successfully, check response
  if (appointmentRes.status === 201) {
    check(appointmentRes, {
      'Create Appointment:  has ID': (r) => {
        try {
          let body = JSON.parse(r.body);
          return body.id !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
  }
  
  sleep(1); // User views confirmation
  
  
  // ==========================================
  // TEST 5: Submit Rating (occasionally)
  // ==========================================
  // Only 30% of users submit ratings
  if (Math.random() < 0.3) {
    let randomRating = Math.floor(Math. random() * 5) + 1; // 1-5 stars
    let comments = ['Great service!', 'Very professional', 'Highly recommend', 'Good experience', 'Will return'];
    let randomComment = comments[Math.floor(Math.random() * comments.length)];
    
    let ratingRes = http.post(
      `${BASE_URL}/api/ratings? userId=${randomUserId}&businessId=1&appointmentId=1&rating=${randomRating}&review=${randomComment}`
    );
    
    check(ratingRes, {
      'Submit Rating:  status 201':  (r) => r.status === 201,
      'Submit Rating: response time OK': (r) => r.timings.duration < 500,
    }) || errorCount.add(1);
    
    responseTime.add(ratingRes.timings.duration);
    sleep(1);
  }
  
  
  // ==========================================
  // TEST 6: Get User Appointments
  // ==========================================
  let myAppointmentsRes = http.get(`${BASE_URL}/api/appointments/user/${randomUserId}`);
  
  check(myAppointmentsRes, {
    'Get User Appointments: status 200': (r) => r.status === 200,
    'Get User Appointments: response time OK': (r) => r.timings.duration < 300,
  }) || errorCount.add(1);
  
  responseTime. add(myAppointmentsRes.timings.duration);
  
  sleep(2); // User reviews their appointments
}

// Summary function - runs at the end
export function handleSummary(data) {
  return {
    'summary. json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return `
╔═══════════════════════════════════════════════════════════════╗
║           LocalBook Load Testing Results                      
╚═══════════════════════════════════════════════════════════════╝

📊 Test Duration: ${data.state.testRunDurationMs / 1000}s

👥 Virtual Users: 
   - Max VUs: ${data.metrics.vus_max. values.max}
   - Avg VUs: ${Math.round(data.metrics.vus. values.avg)}

📈 HTTP Requests:
   - Total Requests: ${data.metrics.http_reqs. values.count}
   - Requests/sec: ${data.metrics.http_reqs.values.rate. toFixed(2)}
   - Failed:  ${data.metrics.http_req_failed.values.rate.toFixed(2)}%

⏱️  Response Times:
   - Average:  ${data.metrics.http_req_duration.values.avg. toFixed(2)}ms
   - Median (p50): ${data.metrics.http_req_duration.values['p(50)'].toFixed(2)}ms
   - p95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
   - p99: ${data. metrics.http_req_duration.values['p(99)'].toFixed(2)}ms
   - Min: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms
   - Max: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms

✅ Checks Passed: ${((data.metrics.checks. values.passes / (data.metrics.checks.values. passes + data.metrics.checks.values.fails)) * 100).toFixed(2)}%

📦 Data Transfer:
   - Received: ${(data.metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB
   - Sent: ${(data.metrics.data_sent.values.count / 1024).toFixed(2)} KB

${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅' : '❌'} Threshold:  95% requests < 500ms
${data.metrics.http_req_failed.values.rate < 0.05 ? '✅' :  '❌'} Threshold: Error rate < 5%

═══════════════════════════════════════════════════════════════
`;
}