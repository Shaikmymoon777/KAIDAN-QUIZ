const axios = require('axios');

async function testServer() {
  console.log('🧪 Testing server connection...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const response = await axios.get('http://localhost:5000/api/users');
    console.log('✅ Server is responding:', response.status);
    
    // Test 2: Create a user
    console.log('\n2. Creating test user...');
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://via.placeholder.com/150',
      level: 'N5'
    };

    const createResponse = await axios.post('http://localhost:5000/api/users', userData);
    console.log('✅ User created:', createResponse.data._id);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testServer(); 