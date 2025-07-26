#!/usr/bin/env node

// ทดสอบ API devices หลังจากการ migration
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testDevicesAPI() {
  try {
    console.log('🧪 Testing Devices API...');
    
    // ทดสอบ GET /api/devices
    console.log('\n📡 Testing GET /api/devices...');
    const response = await fetch(`${API_BASE}/devices`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API Response successful!');
      console.log(`📊 Stats: ${JSON.stringify(data.data.stats, null, 2)}`);
      console.log(`📱 Total devices: ${data.data.devices.length}`);
      
      // แสดงอุปกรณ์แต่ละ faculty
      const devicesByFaculty = data.data.devices.reduce((acc, device) => {
        if (!acc[device.faculty]) acc[device.faculty] = [];
        acc[device.faculty].push(device);
        return acc;
      }, {});
      
      console.log('\n📋 Devices by Faculty:');
      Object.keys(devicesByFaculty).forEach(faculty => {
        console.log(`   ${faculty}: ${devicesByFaculty[faculty].length} devices`);
        devicesByFaculty[faculty].forEach(device => {
          console.log(`     - ${device.name} (${device.device_id}) - ${device.status}`);
        });
      });
      
    } else {
      console.log('❌ API Error:', data.message);
      console.log('Error details:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// รันการทดสอบ
if (require.main === module) {
  testDevicesAPI()
    .then(() => {
      console.log('\n🎉 API test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 API test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDevicesAPI };
