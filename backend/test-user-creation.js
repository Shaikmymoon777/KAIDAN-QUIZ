const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testUserCreation() {
  console.log('🧪 Testing User Creation API');
  console.log('=============================');

  try {
    // Test 1: Check if server is running
    console.log('\n1️⃣ Testing server connection...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log('✅ Server is running, found', usersResponse.data.length, 'existing users');

    // Test 2: Create a new user
    console.log('\n2️⃣ Testing user creation...');
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      level: 'N5',
      avatar: 'https://example.com/avatar.jpg'
    };

    console.log('Creating user with data:', testUser);
    
    const createResponse = await axios.post(`${API_BASE_URL}/users`, testUser);
    console.log('✅ User created successfully:', createResponse.data._id);

    // Test 3: Fetch the created user
    console.log('\n3️⃣ Testing user retrieval...');
    const fetchResponse = await axios.get(`${API_BASE_URL}/users/email/${encodeURIComponent(testUser.email)}`);
    console.log('✅ User retrieved successfully:', fetchResponse.data._id);

    // Test 4: Try to create the same user again (should fail)
    console.log('\n4️⃣ Testing duplicate user creation...');
    try {
      await axios.post(`${API_BASE_URL}/users`, testUser);
      console.log('❌ This should have failed!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected duplicate user');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Full error:', error);
  }
}

// Run the test
testUserCreation(); 