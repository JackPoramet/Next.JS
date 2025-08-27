/**
 * Auto-Start Services
 * เริ่มต้น services สำคัญเมื่อ Next.js เริ่มทำงาน
 */

import { getMQTTService } from './mqtt-service';
import { getCleanupService } from './cleanup-service';

// Auto-start essential services
export function initializeServices() {
  console.log('🚀 Initializing essential services...');
  
  try {
    // Start MQTT Service
    const mqttService = getMQTTService();
    console.log('✅ MQTT Service initialized');
    
    // Start Cleanup Service
    const cleanupService = getCleanupService();
    console.log('✅ Cleanup Service initialized');
    
    console.log('🎉 All services initialized successfully');
    
    return {
      mqtt: mqttService.getConnectionStatus(),
      cleanup: cleanupService.getStatus()
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported (server-side only)
if (typeof window === 'undefined') {
  // Add small delay to ensure all imports are complete
  setTimeout(() => {
    initializeServices();
  }, 100);
}

export default initializeServices;
