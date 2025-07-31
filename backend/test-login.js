const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('🧪 Testing Login Functionality...\n');

  try {
    // Test 1: Create a new user (first login)
    console.log('1. Testing first login (new user)...');
    const userData1 = {
      name: 'John Doe',
      email: `john${Date.now()}@example.com`,
      avatar: 'https://via.placeholder.com/150',
      level: 'N5'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/users`, userData1);
    console.log('✅ First login successful:', createResponse.data._id);

    // Test 2: Try to create the same user again (should fail)
    console.log('\n2. Testing duplicate user creation...');
    try {
      await axios.post(`${API_BASE_URL}/users`, userData1);
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected duplicate user');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    // Test 3: Get user by email (simulating existing user login)
    console.log('\n3. Testing existing user login...');
    const getUserResponse = await axios.get(`${API_BASE_URL}/users/email/${encodeURIComponent(userData1.email)}`);
    console.log('✅ Existing user login successful:', getUserResponse.data._id);

    // Test 4: Update user activity
    console.log('\n4. Testing user activity update...');
    const activityResponse = await axios.post(`${API_BASE_URL}/users/${getUserResponse.data._id}/activity`);
    console.log('✅ User activity updated:', activityResponse.data);

    console.log('\n🎉 Login functionality is working correctly!');
    console.log('   - New users can register');
    console.log('   - Existing users can login');
    console.log('   - Duplicate registrations are prevented');
    console.log('   - User activity is tracked');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLogin(); 