#!/usr/bin/env python3
"""
Virtual IoT Device Simulator
จำลองอุปกรณ์ IoT ที่ส่งข้อมูลผ่าน MQTT ในรูปแบบจริง

Workflow:
1. ส่ง /prop (ข้อมูลอุปกรณ์) -> ยังไม่ลงทะเบียน
2. รอรับ /config (ข้อมูลการลงทะเบียนจากเว็บ)
3. ส่ง /data (ข้อมูลการใช้ไฟฟ้าจริง) -> ลงทะเบียนแล้ว
"""

import json
import time
import random
import threading
import os
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VirtualDevice:
        """บันทึก config ลงไฟล์"""
        try:
            config_data = {
                "saved_timestamp": datetime.now(timezone.utc).isoformat(),
                "device_id": self.device_id,
                "config": config
            }
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Config บันทึกแล้ว: {self.config_file}")
            
        except Exception as e:
            print(f"❌ ไม่สามารถบันทึก config: {e}")

    def load_config_from_file(self):
        """โหลด config จากไฟล์ (ถ้ามี)"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                
                self.device_config = config_data.get('config')
                if self.device_config:
                    self.is_registered = True
                    print(f"📂 โหลด config จากไฟล์: {self.config_file}")
                    print(f"💾 บันทึกเมื่อ: {config_data.get('saved_timestamp')}")
                    return True
            
            return False
            
        except Exception as e:
            print(f"❌ ไม่สามารถโหลด config: {e}")
            return False

if __name__ == "__main__": json
import time
import random
import threading
import os
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class VirtualDevice:
    def __init__(self):
        # Device Configuration
        self.device_id = os.getenv("DEVICE_ID", "ESP32_ENGR_LAB_001")
        self.faculty = os.getenv("FACULTY", "engineering")
        
        # MQTT Configuration
        self.broker_host = os.getenv("MQTT_BROKER_HOST", "iot666.ddns.net")
        self.broker_port = int(os.getenv("MQTT_BROKER_PORT", "1883"))
        self.username = os.getenv("MQTT_USERNAME", "electric_energy")
        self.password = os.getenv("MQTT_PASSWORD", "electric_energy")
        
        # Topics
        self.prop_topic = f"devices/{self.faculty}/{self.device_id}/prop"
        self.config_topic = f"devices/{self.faculty}/{self.device_id}/config"
        self.data_topic = f"devices/{self.faculty}/{self.device_id}/data"
        
        # Device State
        self.is_registered = False
        self.device_config = None
        self.data_interval = int(os.getenv("DATA_INTERVAL", "15"))  # seconds
        
        # Config file path
        self.config_file = f"{self.device_id}_config.json"
        
        # MQTT Client
        self.client = mqtt.Client()
        self.client.username_pw_set(self.username, self.password)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        # Load existing config if available
        self.load_config_from_file()
        
        # Threads
        self.prop_thread = None
        self.data_thread = None
        self.running = True

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ เชื่อมต่อ MQTT สำเร็จ: {self.broker_host}:{self.broker_port}")
            
            # Subscribe to config topic
            client.subscribe(self.config_topic)
            print(f"📡 Subscribe: {self.config_topic}")
            
            # Start sending prop messages
            self.start_prop_phase()
            
        else:
            print(f"❌ เชื่อมต่อ MQTT ไม่สำเร็จ: {rc}")

    def on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            print(f"📨 รับข้อมูล config จาก: {topic}")
            print(f"📄 Config: {json.dumps(payload, indent=2, ensure_ascii=False)}")
            
            if topic == self.config_topic:
                self.handle_config_message(payload)
                
        except Exception as e:
            print(f"❌ Error processing message: {e}")

    def handle_config_message(self, config):
        """รับข้อมูลการลงทะเบียนจากเว็บ"""
        self.device_config = config
        self.is_registered = True
        
        # Save config to file
        self.save_config_to_file(config)
        
        print("\n🎉 อุปกรณ์ได้รับการอนุมัติแล้ว!")
        print(f"📍 ตำแหน่ง: {config.get('assigned_location', {}).get('building', 'N/A')} ชั้น {config.get('assigned_location', {}).get('floor', 'N/A')}")
        print(f"⚡ กำลังไฟ: {config.get('assigned_meter', {}).get('power_specifications', {}).get('rated_power', 0)/1000:.1f} kW")
        print(f"🔧 มิเตอร์: {config.get('assigned_meter', {}).get('meter_model', 'N/A')}")
        print(f"💾 Config ถูกบันทึกในไฟล์: {self.config_file}")
        
        # Stop prop phase, start data phase
        self.stop_prop_phase()
        self.start_data_phase()

    def start_prop_phase(self):
        """Phase 1: ส่งข้อมูล device properties (ยังไม่ลงทะเบียน)"""
        print("\n🔄 เริ่ม Phase 1: ส่ง Device Properties")
        print(f"📡 Topic: {self.prop_topic}")
        
        def send_prop():
            while not self.is_registered and self.running:
                prop_data = self.generate_prop_data()
                
                self.client.publish(
                    self.prop_topic,
                    json.dumps(prop_data, ensure_ascii=False),
                    qos=1
                )
                
                print(f"📤 ส่ง /prop: {prop_data['device_id']} (รอการอนุมัติ...)")
                time.sleep(30)  # ส่งทุก 30 วินาที
        
        self.prop_thread = threading.Thread(target=send_prop)
        self.prop_thread.daemon = True
        self.prop_thread.start()

    def stop_prop_phase(self):
        """หยุดการส่ง prop messages"""
        print("🛑 หยุดการส่ง Device Properties")
        # prop_thread จะหยุดเองเมื่อ is_registered = True

    def start_data_phase(self):
        """Phase 2: ส่งข้อมูลการใช้ไฟฟ้าจริง (ลงทะเบียนแล้ว)"""
        print("\n🔄 เริ่ม Phase 2: ส่ง Data จริง")
        print(f"📡 Topic: {self.data_topic}")
        
        def send_data():
            while self.is_registered and self.running:
                data = self.generate_measurement_data()
                
                self.client.publish(
                    self.data_topic,
                    json.dumps(data, ensure_ascii=False),
                    qos=1
                )
                
                power_total = sum([
                    data['electrical_measurements']['power']['active_power_l1'],
                    data['electrical_measurements']['power']['active_power_l2'], 
                    data['electrical_measurements']['power']['active_power_l3']
                ])
                
                print(f"📊 ส่ง /data: {power_total/1000:.1f}kW ({datetime.now().strftime('%H:%M:%S')})")
                time.sleep(self.data_interval)
        
        self.data_thread = threading.Thread(target=send_data)
        self.data_thread.daemon = True
        self.data_thread.start()

    def generate_prop_data(self):
        """สร้างข้อมูล Device Properties (เฉพาะข้อมูลที่ device รู้เอง)"""
        return {
            "device_id": self.device_id,
            "device_name": "Computer Engineering Lab Meter", 
            "data_collection_interval": self.data_interval,
            "status": "online",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            
            # เฉพาะข้อมูลที่ device รู้จริง
            "device_prop": {
                "device_type": "digital_meter",
                "installation_date": "2024-01-15",
                "connection_type": "wifi",
                "ip_address": "192.168.100.205",
                "mac_address": "AA:BB:CC:DD:EE:FF",
                "firmware_version": "2.1.3"
            }
            
            # ไม่ส่ง location_suggestion และ power_specifications
            # เพราะเป็นข้อมูลที่ admin ต้องกรอกเองในเว็บ
        }

    def generate_measurement_data(self):
        """สร้างข้อมูลการวัดไฟฟ้าจริง (3 เฟส)"""
        base_voltage = 220
        base_current = random.uniform(30, 80)
        base_power_factor = random.uniform(0.85, 0.95)
        
        return {
            "device_id": self.device_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            
            "electrical_measurements": {
                "voltage": {
                    "voltage_l1": base_voltage + random.uniform(-5, 5),
                    "voltage_l2": base_voltage + random.uniform(-5, 5),
                    "voltage_l3": base_voltage + random.uniform(-5, 5),
                    "voltage_l1_l2": 380 + random.uniform(-8, 8),
                    "voltage_l2_l3": 380 + random.uniform(-8, 8),
                    "voltage_l3_l1": 380 + random.uniform(-8, 8)
                },
                
                "current": {
                    "current_l1": base_current + random.uniform(-5, 5),
                    "current_l2": base_current + random.uniform(-5, 5), 
                    "current_l3": base_current + random.uniform(-5, 5),
                    "current_neutral": random.uniform(0.1, 2.0)
                },
                
                "power": {
                    "active_power_l1": (base_voltage * base_current * base_power_factor) + random.uniform(-500, 500),
                    "active_power_l2": (base_voltage * base_current * base_power_factor) + random.uniform(-500, 500),
                    "active_power_l3": (base_voltage * base_current * base_power_factor) + random.uniform(-500, 500),
                    "reactive_power_l1": random.uniform(800, 1200),
                    "reactive_power_l2": random.uniform(800, 1200),
                    "reactive_power_l3": random.uniform(800, 1200),
                    "apparent_power_l1": random.uniform(18000, 22000),
                    "apparent_power_l2": random.uniform(18000, 22000),
                    "apparent_power_l3": random.uniform(18000, 22000)
                },
                
                "power_quality": {
                    "power_factor_l1": base_power_factor,
                    "power_factor_l2": base_power_factor + random.uniform(-0.02, 0.02),
                    "power_factor_l3": base_power_factor + random.uniform(-0.02, 0.02),
                    "frequency": 50.0 + random.uniform(-0.1, 0.1),
                    "thd_voltage_l1": random.uniform(1.5, 3.0),
                    "thd_voltage_l2": random.uniform(1.5, 3.0),
                    "thd_voltage_l3": random.uniform(1.5, 3.0),
                    "thd_current_l1": random.uniform(2.0, 4.5),
                    "thd_current_l2": random.uniform(2.0, 4.5),
                    "thd_current_l3": random.uniform(2.0, 4.5)
                }
            },
            
            "energy_consumption": {
                "active_energy_import": random.uniform(15000, 25000),
                "active_energy_export": 0,
                "reactive_energy_import": random.uniform(2000, 4000),
                "reactive_energy_export": 0
            },
            
            "environmental": {
                "temperature": random.uniform(25, 35),
                "humidity": random.uniform(45, 65)
            },
            
            "device_status": {
                "signal_strength": random.randint(-70, -45),
                "uptime_seconds": random.randint(86400, 2592000),
                "memory_usage": random.uniform(45, 75),
                "cpu_usage": random.uniform(15, 45)
            }
        }

    def run(self):
        """รันอุปกรณ์จำลอง"""
        try:
            print("🚀 เริ่มต้น Virtual Device")
            print(f"📱 Device ID: {self.device_id}")
            print(f"🌐 MQTT Broker: {self.broker_host}:{self.broker_port}")
            
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            
            print("\n📋 Workflow:")
            print("1. ส่ง /prop (Device Properties) ทุก 30 วินาที")
            print("2. รอรับ /config (การอนุมัติจากเว็บ)")
            print("3. เมื่อได้รับอนุมัติ -> ส่ง /data (ข้อมูลจริง) ทุก 15 วินาที")
            print("\nกด Ctrl+C เพื่อหยุด\n")
            
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n\n🛑 หยุดการทำงาน...")
            self.running = False
            self.client.loop_stop()
            self.client.disconnect()
            
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    device = VirtualDevice()
    device.run()