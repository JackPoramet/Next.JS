#!/usr/bin/env python3
"""
Run All Test Devices - Controller Script
สคริปต์สำหรับรันอุปกรณ์ทดสอบทั้งหมดพร้อมกัน
"""

import threading
import time
import signal
import sys
from digital_device_1 import SmartMeterDevice
from digital_device_2 import PowerMonitorDevice
from analog_device_1 import AnalogEnvironmentalSensor

class DeviceController:
    def __init__(self):
        self.devices = []
        self.threads = []
        self.running = True
        
        print("🎛️ MQTT Test Device Controller")
        print("=" * 50)
        
    def signal_handler(self, sig, frame):
        """Handle Ctrl+C gracefully"""
        print("\n🛑 Shutting down all devices...")
        self.running = False
        
        # Wait for all threads to finish
        for thread in self.threads:
            if thread.is_alive():
                thread.join(timeout=2)
        
        print("👋 All devices stopped")
        sys.exit(0)
    
    def run_device(self, device_class, device_name):
        """Run a device in a separate thread"""
        try:
            device = device_class()
            print(f"🚀 Starting {device_name}...")
            device.run()
        except Exception as e:
            print(f"❌ Error in {device_name}: {e}")
    
    def start_all_devices(self):
        """Start all test devices"""
        # Register signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        
        devices_to_start = [
            (SmartMeterDevice, "Smart Meter (Engineering Lab)"),
            (PowerMonitorDevice, "Power Monitor (Library)"),
            (AnalogEnvironmentalSensor, "Environmental Sensor (Architecture Studio)")
        ]
        
        print(f"🔄 Starting {len(devices_to_start)} test devices...")
        print()
        
        # Start each device in a separate thread
        for device_class, device_name in devices_to_start:
            thread = threading.Thread(
                target=self.run_device,
                args=(device_class, device_name),
                daemon=True
            )
            thread.start()
            self.threads.append(thread)
            time.sleep(2)  # Stagger startup
        
        print()
        print("✅ All devices started!")
        print("📊 Monitoring device status...")
        print("🔍 Check real-time data at: http://localhost:3000/realtime")
        print("📡 MQTT Topics:")
        print("   - devices/engineering/ENG_SM_LAB_01")
        print("   - devices/institution/LIB_PM_MAIN_01")
        print("   - devices/architecture/ARC_ENV_STUDIO_01")
        print()
        print("Press Ctrl+C to stop all devices")
        print("=" * 50)
        
        # Keep main thread alive
        try:
            while self.running:
                time.sleep(1)
                
                # Check if any thread died
                alive_threads = [t for t in self.threads if t.is_alive()]
                if len(alive_threads) < len(self.threads):
                    print(f"⚠️  Some devices may have stopped. Active: {len(alive_threads)}/{len(self.threads)}")
                
        except KeyboardInterrupt:
            self.signal_handler(signal.SIGINT, None)

def main():
    """Main function"""
    print("🌟 IoT Device Simulator - MQTT Test Suite")
    print("📡 Connecting to: iot666.ddns.net:1883")
    print("🏢 Simulating devices across 3 faculties")
    print()
    
    controller = DeviceController()
    controller.start_all_devices()

if __name__ == "__main__":
    main()
