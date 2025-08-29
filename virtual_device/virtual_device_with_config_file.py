#!/usr/bin/env python3
"""
Virtual IoT Device Simulator with Config File Management
จำลองอุปกรณ์ IoT ที่ส่งข้อมูลผ่าน MQTT ในรูปแบบจริง และเก็บ config ในไฟล์

Workflow:
1. โหลด config จากไฟล์ (ถ้ามี)
2. ส่ง /prop (ข้อมูลอุปกรณ์) -> ยังไม่ลงทะเบียน
3. รอรับ /config (ข้อมูลการลงทะเบียนจากเว็บ)
4. บันทึก config ลงไฟล์
5. ส่ง /data (ข้อมูลการใช้ไฟฟ้าจริง) -> ลงทะเบียนแล้ว
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
        self.prop_file = f"{self.device_id}_prop.json"
        
        # Threads
        self.running = True
        self.prop_thread = None
        self.data_thread = None
        
        # MQTT Client
        self.client = mqtt.Client()
        self.client.username_pw_set(self.username, self.password)
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        # Load existing files (prop first to check approval status)
        self.load_prop_from_file()
        self.load_config_from_file()

    def save_config_to_file(self, config):
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
                
                # ถ้ายังไม่ได้ตั้งค่า is_registered จาก prop file
                if not self.is_registered and self.device_config and self.device_config.get('registration_status') == 'approved':
                    self.is_registered = True
                    print(f"📂 โหลด config จากไฟล์: {self.config_file}")
                    print(f"💾 บันทึกเมื่อ: {config_data.get('saved_timestamp')}")
                    print("✅ อุปกรณ์ถูกลงทะเบียนแล้ว จากไฟล์ config")
                    return True
                elif self.is_registered:
                    print(f"� โหลด config จากไฟล์: {self.config_file}")
                    print(f"💾 บันทึกเมื่อ: {config_data.get('saved_timestamp')}")
                    print("✅ ใช้สถานะการอนุมัติจากไฟล์ prop")
                    return True
            
            return False
            
        except Exception as e:
            print(f"❌ ไม่สามารถโหลด config: {e}")
            return False

    def save_prop_to_file(self, prop_data):
        """บันทึก prop data ลงไฟล์"""
        try:
            prop_file_data = {
                "saved_timestamp": datetime.now(timezone.utc).isoformat(),
                "device_id": self.device_id,
                "status": "pending",  # pending, approved, rejected
                "prop_data": prop_data,
                "submission_count": 1
            }
            
            # ถ้าไฟล์มีอยู่แล้ว อัปเดต submission_count
            if os.path.exists(self.prop_file):
                with open(self.prop_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                    prop_file_data["submission_count"] = existing_data.get("submission_count", 0) + 1
            
            with open(self.prop_file, 'w', encoding='utf-8') as f:
                json.dump(prop_file_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Prop data บันทึกแล้ว: {self.prop_file}")
            
        except Exception as e:
            print(f"❌ ไม่สามารถบันทึก prop data: {e}")

    def load_prop_from_file(self):
        """โหลด prop data จากไฟล์ (ถ้ามี)"""
        try:
            if os.path.exists(self.prop_file):
                with open(self.prop_file, 'r', encoding='utf-8') as f:
                    prop_data = json.load(f)
                
                print(f"📂 โหลด prop data จากไฟล์: {self.prop_file}")
                print(f"📊 Status: {prop_data.get('status')}")
                print(f"📝 Submission count: {prop_data.get('submission_count')}")
                print(f"💾 บันทึกเมื่อ: {prop_data.get('saved_timestamp')}")
                
                # ถ้าสถานะเป็น approved ให้ตั้งค่าเป็น registered
                if prop_data.get('status') == 'approved':
                    self.is_registered = True
                    print("✅ อุปกรณ์ได้รับการอนุมัติแล้ว - จะข้าม prop phase และส่ง /data เลย")
                
                return prop_data
            
            print("📝 ไม่พบไฟล์ prop data - จะสร้างใหม่")
            return None
            
        except Exception as e:
            print(f"❌ ไม่สามารถโหลด prop data: {e}")
            return None

    def update_prop_status(self, status):
        """อัปเดตสถานะ prop"""
        try:
            if os.path.exists(self.prop_file):
                with open(self.prop_file, 'r', encoding='utf-8') as f:
                    prop_data = json.load(f)
                
                prop_data["status"] = status
                prop_data["status_updated_at"] = datetime.now(timezone.utc).isoformat()
                
                with open(self.prop_file, 'w', encoding='utf-8') as f:
                    json.dump(prop_data, f, indent=2, ensure_ascii=False)
                
                print(f"✅ อัปเดตสถานะ prop เป็น: {status}")
                
        except Exception as e:
            print(f"❌ ไม่สามารถอัปเดตสถานะ prop: {e}")

    def on_connect(self, client, userdata, flags, rc):
        """Callback เมื่อเชื่อมต่อ MQTT สำเร็จ"""
        if rc == 0:
            print("✅ เชื่อมต่อ MQTT สำเร็จ")
            
            # Subscribe to config topic
            client.subscribe(self.config_topic)
            print(f"📡 Subscribe: {self.config_topic}")
            
            # Start appropriate phase
            if self.is_registered:
                print("🔄 เริ่ม Data Phase (อุปกรณ์ลงทะเบียนแล้ว)")
                self.start_data_phase()
            else:
                print("🔄 เริ่ม Prop Phase (รอการอนุมัติ)")
                self.start_prop_phase()
                
        else:
            print(f"❌ การเชื่อมต่อ MQTT ล้มเหลว: {rc}")

    def on_message(self, client, userdata, msg):
        """Callback เมื่อได้รับข้อความ MQTT"""
        try:
            if msg.topic == self.config_topic:
                payload = json.loads(msg.payload.decode())
                
                print(f"\n📨 ได้รับ Config:")
                print(f"📄 Config: {json.dumps(payload, indent=2, ensure_ascii=False)}")
                
                self.handle_config_message(payload)
                
        except Exception as e:
            print(f"❌ Error processing message: {e}")

    def handle_config_message(self, config):
        """รับข้อมูลการลงทะเบียนจากเว็บ"""
        self.device_config = config
        self.is_registered = True
        
        # Save config to file
        self.save_config_to_file(config)
        
        # Update prop status to approved
        self.update_prop_status("approved")
        
        print("\n🎉 อุปกรณ์ได้รับการอนุมัติแล้ว!")
        
        # Extract info from config structure
        location = config.get('assigned_location', {})
        meter = config.get('assigned_meter', {})
        power_specs = meter.get('power_specifications', {})
        
        print(f"📍 ตำแหน่ง: {location.get('building', 'N/A')} ชั้น {location.get('floor', 'N/A')}")
        print(f"🏢 ห้อง: {location.get('room', 'N/A')}")
        print(f"⚡ กำลังไฟ: {power_specs.get('rated_power', 0)/1000:.1f} kW")
        print(f"🔧 มิเตอร์: {meter.get('meter_model', 'N/A')}")
        print(f"💾 Config ถูกบันทึกในไฟล์: {self.config_file}")
        
        # Update data interval from config
        device_config = config.get('device_configuration', {})
        if device_config.get('data_collection_interval'):
            self.data_interval = device_config.get('data_collection_interval')
            print(f"⏱️ อัปเดตช่วงเวลาส่งข้อมูล: {self.data_interval} วินาที")
        
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
                
                # บันทึก prop data ลงไฟล์
                self.save_prop_to_file(prop_data)
                
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
        """หยุด prop phase"""
        print("⏹️ หยุด Prop Phase")

    def start_data_phase(self):
        """Phase 2: ส่งข้อมูลการใช้ไฟฟ้าจริง (ลงทะเบียนแล้ว)"""
        print(f"\n🔄 เริ่ม Phase 2: ส่งข้อมูลไฟฟ้าจริง")
        print(f"📡 Topic: {self.data_topic}")
        print(f"⏱️ ทุก {self.data_interval} วินาที")
        
        def send_data():
            while self.is_registered and self.running:
                data = self.generate_data()
                
                self.client.publish(
                    self.data_topic,
                    json.dumps(data, ensure_ascii=False),
                    qos=1
                )
                
                # แสดงข้อมูลสำคัญที่ส่ง
                total_power = data['electrical_measurements']['active_power']
                voltage = data['electrical_measurements']['voltage']
                current = data['electrical_measurements']['current_amperage']
                
                print(f"📊 ส่ง /data: {total_power/1000:.1f}kW | {voltage:.1f}V | {current:.1f}A ({datetime.now().strftime('%H:%M:%S')})")
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
        }

    def generate_data(self):
        """สร้างข้อมูลการใช้ไฟฟ้าตามมาตรฐาน device_data_example.json แบบเป๊ะ"""
        variation = random.uniform(0.9, 1.1)
        
        return {
            "device_id": self.device_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "measurement_interval": self.data_interval,
            "sequence_number": random.randint(1000, 9999),
            
            "network_status": "online",
            "connection_quality": random.randint(75, 95),
            "signal_strength": random.randint(-70, -45),
            
            "electrical_measurements": {
                "voltage": round(random.uniform(375, 385) * variation, 1),
                "current_amperage": round(random.uniform(40, 50) * variation, 1),
                "power_factor": round(random.uniform(0.85, 0.95), 2),
                "frequency": round(random.uniform(49.8, 50.2), 1),
                
                "active_power": round(random.uniform(25000, 30000) * variation, 1),
                "reactive_power": round(random.uniform(10000, 15000) * variation, 1),
                "apparent_power": round(random.uniform(28000, 33000) * variation, 1),
                
                "total_energy": round(random.uniform(800000, 900000), 3),
                "daily_energy": round(random.uniform(200, 300), 3)
            },
            
            "three_phase_measurements": {
                "is_three_phase": True,
                "voltage_phase_b": round(random.uniform(375, 385) * variation, 1),
                "voltage_phase_c": round(random.uniform(375, 385) * variation, 1),
                "current_phase_b": round(random.uniform(40, 50) * variation, 1),
                "current_phase_c": round(random.uniform(40, 50) * variation, 1),
                "power_factor_phase_b": round(random.uniform(0.80, 0.90), 2),
                "power_factor_phase_c": round(random.uniform(0.85, 0.95), 2),
                "active_power_phase_a": round(random.uniform(8000, 10000) * variation, 1),
                "active_power_phase_b": round(random.uniform(8000, 10000) * variation, 1),
                "active_power_phase_c": round(random.uniform(8000, 10000) * variation, 1)
            },
            
            "environmental_monitoring": {
                "device_temperature": round(random.uniform(25, 40), 1)
            },
            
            "device_health": {
                "uptime_hours": random.randint(1, 720),  # 1-720 hours (30 days)
                "last_maintenance": None,
                "last_data_received": datetime.now(timezone.utc).isoformat(),
                "data_collection_count": random.randint(1000, 10000),
                "last_error_code": None,
                "last_error_message": None,
                "last_error_time": None,
                "error_count_today": 0
            },
            
            "meter_communication": {
                "modbus_status": "ok",
                "last_successful_read": datetime.now(timezone.utc).isoformat(),
                "read_attempts": 1,
                "read_errors": 0,
                "response_time_ms": random.randint(200, 400),
                "communication_errors": 0
            },
            
            "energy_measurements": {
                "total_energy_import": round(random.uniform(800000, 900000), 3),
                "total_energy_export": round(random.uniform(100, 200), 1),
                "daily_energy_import": round(random.uniform(200, 300), 3),
                "daily_energy_export": round(random.uniform(10, 20), 1),
                "monthly_energy": round(random.uniform(6000, 8000), 3),
                "peak_demand": round(random.uniform(30000, 40000) * variation, 1)
            },
            
            "data_quality": {
                "measurement_confidence": random.randint(95, 99),
                "calibration_status": "valid",
                "last_calibration": "2024-01-15T00:00:00.000Z",
                "anomaly_detected": False,
                "data_validation_passed": True
            }
        }

    def run(self):
        """รันอุปกรณ์จำลอง"""
        try:
            print("🚀 เริ่มต้น Virtual Device")
            print(f"📱 Device ID: {self.device_id}")
            print(f"🌐 MQTT Broker: {self.broker_host}:{self.broker_port}")
            print(f"💾 Config File: {self.config_file}")
            print(f"📋 Prop File: {self.prop_file}")
            
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            
            print("\n📋 Workflow:")
            if self.is_registered:
                print("✅ อุปกรณ์ลงทะเบียนแล้ว - ส่งข้อมูลไฟฟ้าทันที")
            else:
                print("1. ส่ง /prop (Device Properties) ทุก 30 วินาที")
                print("2. รอรับ /config (การอนุมัติจากเว็บ)")
                print("3. เมื่อได้รับอนุมัติ -> ส่ง /data (ข้อมูลจริง)")
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
