// concurrent-users-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 75,        // 75 concurrent users ✅
  duration: '1m', // Run for 1 minute
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // 95% under 2s
    http_req_failed: ['rate<0.1'],       // Less than 10% failures
  },
};

export default function () {
  const BASE_URL = 'http://localhost:8080';
  
  // Test 1: Businesses endpoint
  const businessRes = http.get(`${BASE_URL}/api/businesses`);
  check(businessRes, {
    'businesses - status 200': (r) => r.status === 200,
    'businesses - response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Test 2: Users endpoint
  const usersRes = http.get(`${BASE_URL}/api/users`);
  check(usersRes, {
    'users - status 200': (r) => r.status === 200,
    'users - response time < 500ms': (r) => r. timings.duration < 500,
  });
  
  sleep(1); // Wait 1 second between iterations
}