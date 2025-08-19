#!/usr/bin/env python3
"""
Digital Device 2 - Power Monitor (Library)
จำลองการทำงานของ Power Monitor ในห้องสมุด
"""

import json
import time
import random
import math
from datetime import datetime
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, DIGITAL_DEVICE_2, SIMULATION_CONFIG

class PowerMonitorDevice:
    def __init__(self):
        self.config = DIGITAL_DEVICE_2
        self.client = mqtt.Client()
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish
        
        # Device state
        self.is_online = True
        self.total_energy = 2150.25  # Starting energy reading
        self.peak_demand = 0
        self.daily_peak = 0
        self.load_profile = []
        self.alert_count = 0
        
        # Base values for more realistic variation
        self.base_values = {
            "voltage": 235.0,
            "current": 45.0,
            "power_factor": 0.88
        }
        
        print(f"📊 Initializing {self.config['name']}")
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
            "device_type": "power_monitor",
            "meter_type": "digital",
            "manufacturer": "Schneider Electric",
            "model": "PM-5560",
            "firmware_version": "2.1.4",
            "installation_date": "2024-02-20",
            "data_collection_interval": self.config["update_interval"],
            "capabilities": ["power_quality", "harmonics", "demand_monitoring"],
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

    def generate_library_usage_pattern(self):
        """สร้างรูปแบบการใช้ไฟฟ้าของห้องสมุด"""
        hour = datetime.now().hour
        minute = datetime.now().minute
        
        # รูปแบบการใช้ไฟของห้องสมุด
        if 6 <= hour <= 8:  # เปิดห้องสมุด
            usage_factor = 0.6 + (hour - 6) * 0.2
        elif 8 <= hour <= 12:  # ช่วงเช้า คนใช้เยอะ
            usage_factor = 0.9 + 0.2 * math.sin((hour - 8) * math.pi / 4)
        elif 12 <= hour <= 14:  # ช่วงพักเที่ยง
            usage_factor = 0.7 + 0.1 * math.sin((minute) * math.pi / 30)
        elif 14 <= hour <= 18:  # ช่วงบ่าย คนใช้เยอะสุด
            usage_factor = 1.0 + 0.15 * math.sin((hour - 14) * math.pi / 4)
        elif 18 <= hour <= 22:  # ช่วงเย็น ลดลง
            usage_factor = 0.8 - (hour - 18) * 0.15
        else:  # ปิดห้องสมุด (22-6)
            usage_factor = 0.2 + 0.1 * random.random()
            
        return usage_factor

    def generate_realistic_data(self):
        """สร้างข้อมูลที่เหมือนจริงสำหรับ Power Monitor"""
        usage_factor = self.generate_library_usage_pattern()
        
        # เพิ่ม noise และ variations
        noise = random.uniform(-SIMULATION_CONFIG["noise_factor"], SIMULATION_CONFIG["noise_factor"])
        seasonal_factor = 1.0 + 0.1 * math.sin(datetime.now().timetuple().tm_yday * 2 * math.pi / 365)
        
        # Data ranges
        voltage_range = self.config["data_ranges"]["voltage"]
        current_range = self.config["data_ranges"]["current"]
        pf_range = self.config["data_ranges"]["power_factor"]
        freq_range = self.config["data_ranges"]["frequency"]
        temp_range = self.config["data_ranges"]["temperature"]
        
        # สร้างข้อมูลไฟฟ้า
        voltage = self.base_values["voltage"] * (1 + noise * 0.02) * seasonal_factor
        voltage = max(voltage_range[0], min(voltage_range[1], voltage))
        
        current = self.base_values["current"] * usage_factor * (1 + noise)
        current = max(current_range[0], min(current_range[1], current))
        
        power_factor = self.base_values["power_factor"] * (1 + noise * 0.05)
        power_factor = max(pf_range[0], min(pf_range[1], power_factor))
        
        frequency = random.uniform(freq_range[0], freq_range[1])
        temperature = random.uniform(temp_range[0], temp_range[1])
        
        # คำนวณค่า power ต่างๆ
        active_power = voltage * current * power_factor
        reactive_power = voltage * current * math.sqrt(1 - power_factor**2)
        apparent_power = voltage * current
        
        # ติดตาม peak demand
        if active_power > self.peak_demand:
            self.peak_demand = active_power
        if active_power > self.daily_peak:
            self.daily_peak = active_power
            
        # อัปเดต total energy
        time_diff = self.config["update_interval"] / 3600
        energy_increment = active_power * time_diff / 1000
        self.total_energy += energy_increment
        
        # จำลอง power quality issues
        thd_voltage = random.uniform(1.0, 5.0)  # Total Harmonic Distortion
        thd_current = random.uniform(2.0, 8.0)
        
        # ตรวจสอบ alerts
        alerts = []
        if voltage < 220 or voltage > 245:
            alerts.append("voltage_out_of_range")
            self.alert_count += 1
        if power_factor < 0.8:
            alerts.append("low_power_factor")
        if thd_voltage > 4.0:
            alerts.append("high_voltage_distortion")
            
        # สถานะอุปกรณ์ (เหลือแค่ online/offline)
        status = "online"
        if random.random() < SIMULATION_CONFIG["offline_probability"]:
            status = "offline"
            self.is_online = False
            
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
                "peak_demand": round(self.peak_demand, 2),
                "daily_peak": round(self.daily_peak, 2)
            },
            "power_quality": {
                "thd_voltage": round(thd_voltage, 2),
                "thd_current": round(thd_current, 2),
                "voltage_unbalance": round(random.uniform(0.5, 2.0), 2),
                "current_unbalance": round(random.uniform(1.0, 3.0), 2)
            },
            "environmental": {
                "device_temperature": round(temperature, 1),
                "cabinet_humidity": round(random.uniform(40, 70), 1)
            },
            "device_status": {
                "status": status,
                "network_status": "online" if self.is_online else "offline",
                "connection_quality": random.randint(85, 99),
                "alerts": alerts,
                "alert_count": self.alert_count,
                "last_calibration": "2024-07-01T09:00:00Z",
                "next_maintenance": "2024-09-15T10:00:00Z"
            },
            "usage_pattern": {
                "current_usage_factor": round(usage_factor, 2),
                "peak_hours": "14:00-18:00",
                "off_hours": "22:00-06:00"
            }
        }

    def send_data(self):
        """ส่งข้อมูลไปยัง MQTT broker"""
        if not self.is_online:
            if random.random() < 0.15:  # 15% chance to come back online
                self.is_online = True
                print("🔄 Power Monitor back online")
            else:
                return

        data = self.generate_realistic_data()
        
        # ส่งไปยัง topic datas
        self.client.publish(self.config["topic_data"], json.dumps(data))
        
        if SIMULATION_CONFIG["debug_mode"]:
            status_indicator = "🟢" if data["device_status"]["status"] == "online" else "🟡"
            alerts_info = f" ⚠️{len(data['device_status']['alerts'])}" if data['device_status']['alerts'] else ""
            print(f"📊 [Digital-2] {status_indicator} V:{data['energy_data']['voltage']}V, "
                  f"I:{data['energy_data']['current_amperage']}A, "
                  f"P:{data['energy_data']['active_power']}W, "
                  f"PF:{data['energy_data']['power_factor']}, "
                  f"THD-V:{data['power_quality']['thd_voltage']}%{alerts_info}")

    def run(self):
        """เริ่มการทำงานของอุปกรณ์"""
        try:
            print(f"🚀 Starting {self.config['name']}...")
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
            
            cycle_count = 0
            while True:
                self.send_data()
                cycle_count += 1
                
                # รีเซ็ต daily peak ทุกเที่ยงคืน
                if datetime.now().hour == 0 and datetime.now().minute < 5:
                    self.daily_peak = 0
                    print("🔄 Daily peak demand reset")
                
                # รายงานสถานะทุก 100 cycles
                if cycle_count % 100 == 0:
                    print(f"📈 Power Monitor Status - Total Energy: {self.total_energy:.2f} kWh, "
                          f"Peak Demand: {self.peak_demand:.2f} W, Alerts: {self.alert_count}")
                
                time.sleep(self.config["update_interval"])
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping Power Monitor Device...")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()
            print("👋 Power Monitor Device stopped")

if __name__ == "__main__":
    device = PowerMonitorDevice()
    device.run()
