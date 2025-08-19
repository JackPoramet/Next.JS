#!/usr/bin/env python3
"""
MQTT Data Monitor - Real-time Data Viewer
สคริปต์สำหรับตรวจสอบข้อมูลที่ส่งมาจากอุปกรณ์ทดสอบ
"""

import json
import time
from datetime import datetime
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD

class MQTTDataMonitor:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect
        
        self.message_count = 0
        self.devices_seen = set()
        self.last_data = {}
        self.faculty_stats = {
            "engineering": 0,
            "institution": 0,
            "liberal_arts": 0,
            "business_administration": 0,
            "architecture": 0,
            "industrial_education": 0
        }
        
        print("👀 MQTT Data Monitor - Multi-Faculty IoT System")
        print(f"📡 Connecting to: {MQTT_BROKER}:{MQTT_PORT}")
        print("=" * 60)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ Connected to MQTT Broker")
            
            # Subscribe to all department device topics
            topics = [
                "devices/+/+",                           # All device data (general pattern)
                "devices/engineering/+",                 # 🔧 Engineering Faculty
                "devices/institution/+",                 # 🏛️ Institution/Central
                "devices/liberal_arts/+",                # 📚 Liberal Arts Faculty
                "devices/business_administration/+",     # 💼 Business Administration Faculty  
                "devices/architecture/+",                # 🏗️ Architecture Faculty
                "devices/industrial_education/+",       # ⚙️ Industrial Education Faculty
            ]
            
            print("📡 MQTT Topic Patterns:")
            print("🔧 devices/engineering/+")
            print("🏛️ devices/institution/+")
            print("📚 devices/liberal_arts/+")
            print("💼 devices/business_administration/+")
            print("🏗️ devices/architecture/+")
            print("⚙️ devices/industrial_education/+")
            print()
            
            for topic in topics:
                client.subscribe(topic)
                print(f"📥 Subscribed to: {topic}")
            
            print("🎧 Listening for messages...")
            print("=" * 60)
        else:
            print(f"❌ Failed to connect, return code {rc}")

    def on_disconnect(self, client, userdata, rc):
        print(f"🔌 Disconnected from MQTT Broker")

    def format_device_data(self, topic, data):
        """Format device data for display"""
        try:
            device_id = data.get("device_id", "Unknown")
            timestamp = data.get("timestamp", "")
            
            # Parse timestamp for display
            if timestamp:
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                time_str = dt.strftime("%H:%M:%S")
            else:
                time_str = datetime.now().strftime("%H:%M:%S")
            
            # Extract faculty from topic
            faculty_emoji = "🏢"
            faculty_name = "unknown"
            if "/engineering/" in topic:
                faculty_emoji = "🔧"
                faculty_name = "Engineering"
            elif "/institution/" in topic:
                faculty_emoji = "🏛️"
                faculty_name = "Institution"
            elif "/liberal_arts/" in topic:
                faculty_emoji = "📚"
                faculty_name = "Liberal Arts"
            elif "/business_administration/" in topic:
                faculty_emoji = "💼"
                faculty_name = "Business Admin"
            elif "/architecture/" in topic:
                faculty_emoji = "🏗️"
                faculty_name = "Architecture"
            elif "/industrial_education/" in topic:
                faculty_emoji = "⚙️"
                faculty_name = "Industrial Education"
            
            if "energy_data" in data:
                # Energy device data
                energy = data["energy_data"]
                status = data.get("device_status", {}).get("status", "unknown")
                
                return (f"⚡ [{time_str}] {faculty_emoji} {faculty_name} - {device_id} - "
                       f"V:{energy.get('voltage', 0):.1f}V, "
                       f"I:{energy.get('current_amperage', 0):.1f}A, "
                       f"P:{energy.get('active_power', 0):.0f}W, "
                       f"PF:{energy.get('power_factor', 0):.2f}, "
                       f"Status:{status}")
            
            elif "environmental_data" in data:
                # Environmental sensor data
                env = data["environmental_data"]
                occupancy = data.get("studio_context", {}).get("estimated_occupancy", 0)
                
                return (f"🌡️ [{time_str}] {faculty_emoji} {faculty_name} - {device_id} - "
                       f"T:{env.get('temperature', 0):.1f}°C, "
                       f"People:{occupancy}")
            
            elif "power_quality" in data:
                # Power quality data
                pq = data["power_quality"]
                return (f"📊 [{time_str}] {faculty_emoji} {faculty_name} - {device_id} - Power Quality - "
                       f"THD-V:{pq.get('thd_voltage', 0):.1f}%, "
                       f"THD-I:{pq.get('thd_current', 0):.1f}%, "
                       f"Unbalance:{pq.get('voltage_unbalance', 0):.1f}%")
            
            elif "analog_sensor_info" in data:
                # Sensor health data
                sensor = data["analog_sensor_info"]
                power = data.get("power_status", {})
                return (f"🔧 [{time_str}] {faculty_emoji} {faculty_name} - {device_id} - Sensor Health - "
                       f"Measurements:{sensor.get('measurement_count', 0)}, "
                       f"Calibration:{sensor.get('days_since_calibration', 0)} days, "
                       f"Power:{power.get('power_consumption', 0):.1f}W")
            
            elif "device_type" in data:
                # Device registration
                return (f"📋 [{time_str}] {faculty_emoji} {faculty_name} - Registration - {device_id} - "
                       f"Type:{data.get('device_type', 'unknown')}, "
                       f"Model:{data.get('model', 'unknown')}, "
                       f"Location:{data.get('building', '')}")
            
            else:
                # Generic data
                return f"📦 [{time_str}] {faculty_emoji} {faculty_name} - {device_id} - Generic data (keys: {list(data.keys())})"
                
        except Exception as e:
            return f"❌ [{datetime.now().strftime('%H:%M:%S')}] Error formatting data: {e}"

    def on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages"""
        try:
            self.message_count += 1
            topic = msg.topic
            
            # Extract faculty from topic for statistics
            faculty = "unknown"
            if "/engineering/" in topic:
                faculty = "engineering"
            elif "/institution/" in topic:
                faculty = "institution"
            elif "/liberal_arts/" in topic:
                faculty = "liberal_arts"
            elif "/business_administration/" in topic:
                faculty = "business_administration"
            elif "/architecture/" in topic:
                faculty = "architecture"
            elif "/industrial_education/" in topic:
                faculty = "industrial_education"
            
            if faculty in self.faculty_stats:
                self.faculty_stats[faculty] += 1
            
            # Try to parse JSON data
            try:
                data = json.loads(msg.payload.decode())
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON in topic {topic}: {msg.payload.decode()[:100]}")
                return
            
            # Track devices
            device_id = data.get("device_id")
            if device_id:
                self.devices_seen.add(device_id)
                self.last_data[device_id] = data
            
            # Format and display
            formatted_msg = self.format_device_data(topic, data)
            print(formatted_msg)
            
            # Show summary every 50 messages
            if self.message_count % 50 == 0:
                print()
                print(f"📈 Summary: {self.message_count} messages received from {len(self.devices_seen)} devices")
                print(f"🎯 Active devices: {', '.join(sorted(self.devices_seen))}")
                print("📊 Faculty Statistics:")
                for faculty, count in self.faculty_stats.items():
                    if count > 0:
                        faculty_emoji = {"engineering": "🔧", "institution": "🏛️", "liberal_arts": "📚", 
                                       "business_administration": "💼", "architecture": "🏗️", 
                                       "industrial_education": "⚙️"}.get(faculty, "🏢")
                        print(f"   {faculty_emoji} {faculty.replace('_', ' ').title()}: {count} messages")
                print("=" * 60)
            
        except Exception as e:
            print(f"❌ Error processing message: {e}")

    def show_status(self):
        """Show current monitoring status"""
        print(f"\n📊 Monitor Status:")
        print(f"   Messages received: {self.message_count}")
        print(f"   Devices seen: {len(self.devices_seen)}")
        print(f"   Active devices: {', '.join(sorted(self.devices_seen))}")
        
        print("\n📊 Faculty Message Statistics:")
        total_faculty_messages = sum(self.faculty_stats.values())
        for faculty, count in self.faculty_stats.items():
            if count > 0:
                faculty_emoji = {"engineering": "🔧", "institution": "🏛️", "liberal_arts": "📚", 
                               "business_administration": "💼", "architecture": "🏗️", 
                               "industrial_education": "⚙️"}.get(faculty, "🏢")
                percentage = (count / total_faculty_messages * 100) if total_faculty_messages > 0 else 0
                print(f"   {faculty_emoji} {faculty.replace('_', ' ').title()}: {count} messages ({percentage:.1f}%)")
        
        if self.last_data:
            print("\n📋 Last data from each device:")
            for device_id, data in self.last_data.items():
                timestamp = data.get("timestamp", "")
                faculty = data.get("faculty", "unknown")
                device_type = data.get("device_type", "unknown")
                if timestamp:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    time_str = dt.strftime("%H:%M:%S")
                else:
                    time_str = "Unknown"
                faculty_emoji = {"engineering": "🔧", "institution": "🏛️", "liberal_arts": "📚", 
                               "business_administration": "💼", "architecture": "🏗️", 
                               "industrial_education": "⚙️"}.get(faculty, "🏢")
                print(f"   {faculty_emoji} {device_id} ({device_type}): {time_str}")
        print()

    def run(self):
        """Start monitoring"""
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
            
            print("🎧 Monitoring MQTT data... (Press Ctrl+C to stop)")
            
            last_status_time = time.time()
            while True:
                time.sleep(1)
                
                # Show status every 30 seconds
                if time.time() - last_status_time > 30:
                    self.show_status()
                    last_status_time = time.time()
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping MQTT monitor...")
            self.show_status()
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()
            print("👋 Monitor stopped")

if __name__ == "__main__":
    monitor = MQTTDataMonitor()
    monitor.run()
