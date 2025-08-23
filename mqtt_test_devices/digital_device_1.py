#!/usr/bin/env python3
"""
Digital Device 1 - Smart Meter (Engineering Lab)
จำลองการทำงานของ Smart Meter ในห้องปฏิบัติการคณะวิศวกรรม
"""

import json
import time
import random
import math
from datetime import datetime
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, DIGITAL_DEVICE_1, SIMULATION_CONFIG

class SmartMeterDevice:
    def __init__(self):
        self.config = DIGITAL_DEVICE_1
        self.client = mqtt.Client()
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish
        
        # Device state
        self.is_online = True
        self.total_energy = 1250.75  # Starting energy reading
        self.last_power = 0
        self.maintenance_counter = 0
        self.error_count = 0
        self.base_values = {
            "voltage": 220.0,  # Phase voltage (line-to-neutral, 380V/√3)
            "current": 25.0,
            "power_factor": 0.92
        }
        
        print(f"🔌 Initializing {self.config['name']} (3-Phase System)")
        print(f"📍 Location: {self.config['building']}, {self.config['room']}")
        print(f"🏷️  Device ID: {self.config['device_id']}")
        print(f"📡 MQTT Topics: {self.config['topic_base']}/{{prop|datas}}")
        print(f"⚡ Power Type: 3-Phase")

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ Connected to MQTT Broker: {MQTT_BROKER}")
            self.send_device_registration()
        else:
            print(f"❌ Failed to connect, return code {rc}")

    def on_disconnect(self, client, userdata, rc):
        print(f"🔌 Disconnected from MQTT Broker")

    def on_publish(self, client, userdata, mid):
        if SIMULATION_CONFIG["debug_mode"]:
            print(f"📤 Message published (ID: {mid})")

    def send_device_registration(self):
        """ส่งข้อมูลการลงทะเบียนอุปกรณ์"""
        registration_data = {
            "device_id": self.config["device_id"],
            "name": self.config["name"],
            "faculty": self.config["faculty"],
            "building": self.config["building"],
            "floor": self.config["floor"],
            "room": self.config["room"],
            "device_type": "smart_meter",
            "meter_type": "digital",
            "power_phase": "three",  # เพิ่มข้อมูลระบบ 3 เฟส
            "manufacturer": "PowerTech",
            "model": "SM-3500-3P",  # รุ่น 3 เฟส
            "firmware_version": "1.2.3",
            "installation_date": "2024-01-15",
            "data_collection_interval": self.config["update_interval"],
            "status": "online",
            "timestamp": datetime.now().isoformat(),
            "location": {
                "faculty": self.config["faculty"],
                "building": self.config["building"],
                "floor": self.config["floor"],
                "room": self.config["room"]
            }
        }
        
        # ส่งข้อมูลการลงทะเบียนผ่าน topic prop
        self.client.publish(self.config["topic_prop"], json.dumps(registration_data))
        print(f"📋 Device registration sent to {self.config['topic_prop']}")

    def generate_realistic_data(self):
        """สร้างข้อมูลที่เหมือนจริง"""
        # สร้างความผันแปรตามเวลา (จำลองการใช้ไฟฟ้าตามเวลา)
        hour = datetime.now().hour
        time_factor = 1.0
        
        # เวลาทำงาน (8-18) ใช้ไฟเยอะ
        if 8 <= hour <= 18:
            time_factor = 1.2 + 0.3 * math.sin((hour - 8) * math.pi / 10)
        # เวลากลางคืน (22-6) ใช้ไฟน้อย
        elif hour >= 22 or hour <= 6:
            time_factor = 0.4 + 0.2 * random.random()
        # เวลาเย็น (19-21) ใช้ไฟปานกลาง
        else:
            time_factor = 0.8 + 0.2 * random.random()

        # เพิ่ม noise และ drift
        noise = random.uniform(-SIMULATION_CONFIG["noise_factor"], SIMULATION_CONFIG["noise_factor"])
        drift = random.uniform(-SIMULATION_CONFIG["drift_factor"], SIMULATION_CONFIG["drift_factor"])
        
        # คำนวณค่าพื้นฐาน
        voltage_range = self.config["data_ranges"]["voltage"]
        current_range = self.config["data_ranges"]["current"]
        pf_range = self.config["data_ranges"]["power_factor"]
        freq_range = self.config["data_ranges"]["frequency"]
        temp_range = self.config["data_ranges"]["temperature"]
        
        # สร้างข้อมูลสำหรับ 3 เฟส
        # Phase A (อ้างอิง)
        voltage_a = self.base_values["voltage"] * (1 + noise) * time_factor
        voltage_a = max(voltage_range[0], min(voltage_range[1], voltage_a))
        
        current_a = self.base_values["current"] * (1 + noise + drift) * time_factor
        current_a = max(current_range[0], min(current_range[1], current_a))
        
        power_factor_a = self.base_values["power_factor"] * (1 + noise * 0.1)
        power_factor_a = max(pf_range[0], min(pf_range[1], power_factor_a))
        
        # Phase B (เลื่อนเฟส 120 องศา + variation)
        phase_b_variation = random.uniform(0.95, 1.05)
        voltage_b = voltage_a * phase_b_variation * (1 + noise * 0.5)
        voltage_b = max(voltage_range[0], min(voltage_range[1], voltage_b))
        
        current_b = current_a * phase_b_variation * (1 + noise * 0.3)
        current_b = max(current_range[0], min(current_range[1], current_b))
        
        power_factor_b = power_factor_a * (1 + noise * 0.15)
        power_factor_b = max(pf_range[0], min(pf_range[1], power_factor_b))
        
        # Phase C (เลื่อนเฟส 240 องศา + variation)
        phase_c_variation = random.uniform(0.95, 1.05)
        voltage_c = voltage_a * phase_c_variation * (1 + noise * 0.5)
        voltage_c = max(voltage_range[0], min(voltage_range[1], voltage_c))
        
        current_c = current_a * phase_c_variation * (1 + noise * 0.3)
        current_c = max(current_range[0], min(current_range[1], current_c))
        
        power_factor_c = power_factor_a * (1 + noise * 0.15)
        power_factor_c = max(pf_range[0], min(pf_range[1], power_factor_c))
        
        frequency = random.uniform(freq_range[0], freq_range[1])
        temperature = random.uniform(temp_range[0], temp_range[1])
        
        # คำนวณ power สำหรับแต่ละเฟส
        active_power_a = voltage_a * current_a * power_factor_a
        reactive_power_a = voltage_a * current_a * math.sqrt(1 - power_factor_a**2)
        apparent_power_a = voltage_a * current_a
        
        active_power_b = voltage_b * current_b * power_factor_b
        reactive_power_b = voltage_b * current_b * math.sqrt(1 - power_factor_b**2)
        apparent_power_b = voltage_b * current_b
        
        active_power_c = voltage_c * current_c * power_factor_c
        reactive_power_c = voltage_c * current_c * math.sqrt(1 - power_factor_c**2)
        apparent_power_c = voltage_c * current_c
        
        # รวมพลังงานทั้ง 3 เฟส
        total_active_power = active_power_a + active_power_b + active_power_c
        total_reactive_power = reactive_power_a + reactive_power_b + reactive_power_c
        total_apparent_power = apparent_power_a + apparent_power_b + apparent_power_c
        
        # คำนวณ power factor รวม
        total_power_factor = total_active_power / total_apparent_power if total_apparent_power > 0 else 0
        
        # ใช้ค่าเฉลี่ยสำหรับ main readings
        voltage = (voltage_a + voltage_b + voltage_c) / 3
        current = (current_a + current_b + current_c) / 3
        power_factor = total_power_factor
        
        # อัปเดต total energy (kWh)
        if self.last_power > 0:
            time_diff = self.config["update_interval"] / 3600  # convert to hours
            energy_increment = total_active_power * time_diff / 1000  # convert to kWh
            self.total_energy += energy_increment
        
        self.last_power = total_active_power
        
        # จำลองสถานะต่างๆ
        status = "online"
        if random.random() < SIMULATION_CONFIG["offline_probability"]:
            status = "offline"
            self.is_online = False
        elif random.random() < 0.005:  # 0.5% chance
            status = "maintenance"
        elif voltage < 200 or voltage > 250:
            status = "error"
            self.error_count += 1
        
        return {
            "device_id": self.config["device_id"],
            "timestamp": datetime.now().isoformat(),
            "energy_data": {
                "voltage": round(voltage, 2),
                "current_amperage": round(current, 2),
                "active_power": round(total_active_power, 2),
                "reactive_power": round(total_reactive_power, 2),
                "apparent_power": round(total_apparent_power, 2),
                "power_factor": round(power_factor, 3),
                "frequency": round(frequency, 2),
                "total_energy": round(self.total_energy, 3),
                "daily_energy": round((self.total_energy % 24), 2),
                
                # 3-Phase specific data
                "voltage_phase_a": round(voltage_a, 2),
                "voltage_phase_b": round(voltage_b, 2),
                "voltage_phase_c": round(voltage_c, 2),
                "current_phase_a": round(current_a, 2),
                "current_phase_b": round(current_b, 2),
                "current_phase_c": round(current_c, 2),
                "power_factor_phase_a": round(power_factor_a, 3),
                "power_factor_phase_b": round(power_factor_b, 3),
                "power_factor_phase_c": round(power_factor_c, 3),
                "active_power_phase_a": round(active_power_a, 2),
                "active_power_phase_b": round(active_power_b, 2),
                "active_power_phase_c": round(active_power_c, 2),
                "reactive_power_phase_a": round(reactive_power_a, 2),
                "reactive_power_phase_b": round(reactive_power_b, 2),
                "reactive_power_phase_c": round(reactive_power_c, 2),
                "apparent_power_phase_a": round(apparent_power_a, 2),
                "apparent_power_phase_b": round(apparent_power_b, 2),
                "apparent_power_phase_c": round(apparent_power_c, 2)
            },
            "environmental": {
                "device_temperature": round(temperature, 1)
            },
            "device_status": {
                "status": status,
                "network_status": "online" if self.is_online else "offline",
                "signal_strength": random.randint(-60, -30),
                "last_maintenance": "2024-08-15T10:00:00Z",
                "error_count": self.error_count,
                "uptime_hours": random.randint(100, 8760)
            }
        }

    def send_data(self):
        """ส่งข้อมูลไปยัง MQTT broker"""
        if not self.is_online:
            # จำลองการกลับมา online
            if random.random() < 0.1:  # 10% chance
                self.is_online = True
                print("🔄 Device back online")
            else:
                return

        data = self.generate_realistic_data()
        
        # ส่งไปยัง topic datas
        self.client.publish(self.config["topic_data"], json.dumps(data))
        
        if SIMULATION_CONFIG["debug_mode"]:
            print(f"📊 [Digital-1] V:{data['energy_data']['voltage']}V, "
                  f"I:{data['energy_data']['current_amperage']}A, "
                  f"P:{data['energy_data']['active_power']}W, "
                  f"PF:{data['energy_data']['power_factor']}, "
                  f"Status:{data['device_status']['status']}")

    def run(self):
        """เริ่มการทำงานของอุปกรณ์"""
        try:
            print(f"🚀 Starting {self.config['name']}...")
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
            
            while True:
                self.send_data()
                self.maintenance_counter += 1
                
                # จำลอง maintenance ทุก 1 ชั่วโมง
                if self.maintenance_counter >= (SIMULATION_CONFIG["maintenance_interval"] / self.config["update_interval"]):
                    print("🔧 Performing routine maintenance check...")
                    self.maintenance_counter = 0
                
                time.sleep(self.config["update_interval"])
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping Smart Meter Device...")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()
            print("👋 Smart Meter Device stopped")

if __name__ == "__main__":
    device = SmartMeterDevice()
    device.run()
