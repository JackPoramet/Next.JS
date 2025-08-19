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
            "voltage": 230.0,
            "current": 25.0,
            "power_factor": 0.92
        }
        
        print(f"🔌 Initializing {self.config['name']}")
        print(f"📍 Location: {self.config['building']}, {self.config['room']}")
        print(f"🏷️  Device ID: {self.config['device_id']}")
        print(f"📡 MQTT Topics: {self.config['topic_base']}/{{prop|datas}}")

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
            "manufacturer": "PowerTech",
            "model": "SM-3500",
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
        
        # สร้างข้อมูล
        voltage = self.base_values["voltage"] * (1 + noise) * time_factor
        voltage = max(voltage_range[0], min(voltage_range[1], voltage))
        
        current = self.base_values["current"] * (1 + noise + drift) * time_factor
        current = max(current_range[0], min(current_range[1], current))
        
        power_factor = self.base_values["power_factor"] * (1 + noise * 0.1)
        power_factor = max(pf_range[0], min(pf_range[1], power_factor))
        
        frequency = random.uniform(freq_range[0], freq_range[1])
        temperature = random.uniform(temp_range[0], temp_range[1])
        
        # คำนวณ power และ energy
        active_power = voltage * current * power_factor
        reactive_power = voltage * current * math.sqrt(1 - power_factor**2)
        apparent_power = voltage * current
        
        # อัปเดต total energy (kWh)
        if self.last_power > 0:
            time_diff = self.config["update_interval"] / 3600  # convert to hours
            energy_increment = active_power * time_diff / 1000  # convert to kWh
            self.total_energy += energy_increment
        
        self.last_power = active_power
        
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
                "active_power": round(active_power, 2),
                "reactive_power": round(reactive_power, 2),
                "apparent_power": round(apparent_power, 2),
                "power_factor": round(power_factor, 3),
                "frequency": round(frequency, 2),
                "total_energy": round(self.total_energy, 3),
                "daily_energy": round((self.total_energy % 24), 2)
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
