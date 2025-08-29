// Test script for delete device API
const testDeviceDelete = async () => {
  try {
    console.log('🧪 Testing device delete API...');
    
    // First, get list of devices
    const listResponse = await fetch('/api/admin/devices');
    const listResult = await listResponse.json();
    
    console.log('📋 Available devices:', listResult);
    
    if (listResult.success && listResult.data.devices.length > 0) {
      const testDevice = listResult.data.devices[0];
      console.log('🎯 Test device:', testDevice);
      
      // Test delete API
      const deleteResponse = await fetch(`/api/admin/devices/${testDevice.device_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Delete response status:', deleteResponse.status);
      console.log('📡 Delete response headers:', Object.fromEntries(deleteResponse.headers.entries()));
      
      const deleteResult = await deleteResponse.json();
      console.log('📄 Delete result:', deleteResult);
      
    } else {
      console.log('⚠️ No devices available for testing');
    }
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

// Call this in browser console to test
window.testDeviceDelete = testDeviceDelete;
console.log('🧪 Test function loaded. Call testDeviceDelete() to run tests.');
