#!/usr/bin/env python3
"""
Analog Device - Environmental Sensor (Architecture Studio)
จำลองการทำงานของเซ็นเซอร์สิ่งแวดล้อมแบบอนาล็อกในสตูดิโอสถาปัตยกรรม
"""

import json
import time
import random
import math
from datetime import datetime
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, ANALOG_DEVICE, SIMULATION_CONFIG

class AnalogEnvironmentalSensor:
    def __init__(self):
        self.config = ANALOG_DEVICE
        self.client = mqtt.Client()
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish
        
        # Device state
        self.is_online = True
        self.calibration_offset = {
            "temperature": random.uniform(-0.5, 0.5)
        }
        
        # Analog sensor characteristics
        self.sensor_drift = {
            "temperature": 0
        }
        
        self.measurement_count = 0
        self.last_calibration = datetime.now()
        
        print(f"🌡️ Initializing {self.config['name']}")
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
            "device_type": "environmental_sensor",
            "sensor_type": "analog",
            "manufacturer": "Sensirion",
            "model": "SHT40-ENV-Multi",
            "firmware_version": "3.0.1",
            "installation_date": "2024-03-10",
            "data_collection_interval": self.config["update_interval"],
            "sensors": [
                {"type": "temperature", "unit": "°C", "range": "0-50", "accuracy": "±0.2"}
            ],
            "power_supply": "12V DC",
            "communication": "RS485/MQTT",
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
        print(f"📋 Environmental sensor registration sent to {self.config['topic_prop']}")

    def simulate_studio_environment(self):
        """จำลองสภาพแวดล้อมในสตูดิโอสถาปัตยกรรม"""
        hour = datetime.now().hour
        day_of_week = datetime.now().weekday()  # 0=Monday, 6=Sunday
        
        # รูปแบบการใช้งานสตูดิโอ
        is_weekend = day_of_week >= 5
        is_class_time = 8 <= hour <= 18 and not is_weekend
        is_night_work = 19 <= hour <= 22 and not is_weekend
        
        # Activity factor
        if is_class_time:
            activity_factor = 0.8 + 0.3 * math.sin((hour - 8) * math.pi / 10)
        elif is_night_work:
            activity_factor = 0.5 + 0.2 * random.random()
        elif is_weekend and 10 <= hour <= 16:
            activity_factor = 0.3 + 0.2 * random.random()
        else:
            activity_factor = 0.1 + 0.1 * random.random()
            
        # Occupancy (number of people)
        max_occupancy = 25
        current_occupancy = int(max_occupancy * activity_factor * random.uniform(0.7, 1.3))
        current_occupancy = max(0, min(max_occupancy, current_occupancy))
        
        return {
            "activity_factor": activity_factor,
            "occupancy": current_occupancy,
            "is_class_time": is_class_time,
            "is_weekend": is_weekend
        }

    def apply_analog_characteristics(self, value, sensor_type, true_range):
        """ใส่ลักษณะเฉพาะของเซ็นเซอร์อนาล็อก"""
        # ADC noise (12-bit ADC = 4096 levels)
        adc_noise = random.uniform(-0.1, 0.1)
        
        # Sensor drift (เพิ่มขึ้นเรื่อยๆ ตามเวลา)
        drift_rate = 0.001  # 0.1% per measurement
        self.sensor_drift[sensor_type] += random.uniform(-drift_rate, drift_rate)
        
        # Temperature compensation (analog sensors sensitive to temperature)
        temp_coefficient = random.uniform(-0.002, 0.002)
        temp_effect = temp_coefficient * (25 - 20)  # assume 20°C reference
        
        # Apply all effects
        final_value = value * (1 + adc_noise + self.sensor_drift[sensor_type] + temp_effect)
        final_value += self.calibration_offset[sensor_type]
        
        # Clamp to sensor range
        final_value = max(true_range[0], min(true_range[1], final_value))
        
        return final_value

    def generate_realistic_data(self):
        """สร้างข้อมูลสิ่งแวดล้อมที่เหมือนจริง"""
        studio_info = self.simulate_studio_environment()
        
        # Base environmental conditions
        outdoor_temp = 28 + 5 * math.sin(datetime.now().hour * math.pi / 12)  # Daily cycle
        
        # Indoor conditions affected by occupancy and activity
        occupancy_effect = studio_info["occupancy"] / 25.0
        
        # Temperature (affected by people, equipment, AC)
        temp_range = self.config["data_ranges"]["temperature"]
        indoor_temp = outdoor_temp - 3  # AC effect
        indoor_temp += occupancy_effect * 2  # People heat
        indoor_temp += random.uniform(-1, 1)  # Natural variation
        if studio_info["is_class_time"]:
            indoor_temp += 1  # Equipment heat
        temperature = self.apply_analog_characteristics(indoor_temp, "temperature", temp_range)
        
        # Power consumption (analog sensors + data transmission)
        voltage_range = self.config["data_ranges"]["voltage"]
        current_range = self.config["data_ranges"]["current"]
        
        # DC power for sensors (more stable than AC)
        supply_voltage = 12.0 + random.uniform(-0.2, 0.2)
        sensor_current = 0.5 + occupancy_effect * 0.1  # More current when active
        supply_voltage = max(voltage_range[0], min(voltage_range[1], supply_voltage))
        sensor_current = max(current_range[0], min(current_range[1], sensor_current))
        
        # Calibration and maintenance info
        days_since_calibration = (datetime.now() - self.last_calibration).days
        calibration_due = days_since_calibration > 30
        
        # Status determination (เหลือแค่ online/offline)
        status = "online"
        alerts = []
        
        if temperature > 35:
            alerts.append("high_temperature")
        if calibration_due:
            alerts.append("calibration_due")
            
        if random.random() < SIMULATION_CONFIG["offline_probability"]:
            status = "offline"
            self.is_online = False
            
        self.measurement_count += 1
        
        return {
            "device_id": self.config["device_id"],
            "timestamp": datetime.now().isoformat(),
            "environmental_data": {
                "temperature": round(temperature, 2)
            },
            "analog_sensor_info": {
                "measurement_count": self.measurement_count,
                "sensor_drift": {k: round(v, 4) for k, v in self.sensor_drift.items()},
                "days_since_calibration": days_since_calibration,
                "adc_resolution": "12-bit",
                "sampling_rate": "1 Hz"
            },
            "power_status": {
                "supply_voltage": round(supply_voltage, 2),
                "sensor_current": round(sensor_current, 3),
                "power_consumption": round(supply_voltage * sensor_current, 2)
            },
            "studio_context": {
                "estimated_occupancy": studio_info["occupancy"],
                "activity_factor": round(studio_info["activity_factor"], 2),
                "is_class_time": studio_info["is_class_time"],
                "is_weekend": studio_info["is_weekend"]
            },
            "device_status": {
                "status": status,
                "network_status": "online" if self.is_online else "offline",
                "signal_strength": random.randint(-70, -40),
                "alerts": alerts,
                "calibration_due": calibration_due,
                "last_calibration": self.last_calibration.isoformat(),
                "next_maintenance": "2024-09-20T14:00:00Z"
            }
        }

    def send_data(self):
        """ส่งข้อมูลไปยัง MQTT broker"""
        if not self.is_online:
            if random.random() < 0.08:  # 8% chance to come back online
                self.is_online = True
                print("🔄 Environmental sensor back online")
            else:
                return

        data = self.generate_realistic_data()
        
        # ส่งไปยัง topic datas
        self.client.publish(self.config["topic_data"], json.dumps(data))
        
        if SIMULATION_CONFIG["debug_mode"]:
            status_indicator = "🟢" if data["device_status"]["status"] == "online" else "🟡"
            alerts_info = f" ⚠️{len(data['device_status']['alerts'])}" if data['device_status']['alerts'] else ""
            occupancy_info = f" 👥{data['studio_context']['estimated_occupancy']}"
            print(f"🌡️ [Analog] {status_indicator} T:{data['environmental_data']['temperature']}°C{occupancy_info}{alerts_info}")

    def perform_auto_calibration(self):
        """จำลองการ calibrate อัตโนมัติ"""
        print("🔧 Performing auto-calibration...")
        for sensor_type in self.calibration_offset:
            # รีเซ็ต drift และ offset
            self.sensor_drift[sensor_type] *= 0.1  # ลด drift 90%
            self.calibration_offset[sensor_type] = random.uniform(-0.1, 0.1)
        
        self.last_calibration = datetime.now()
        print("✅ Auto-calibration completed")

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
                
                # Auto-calibration ทุก 500 cycles
                if cycle_count % 500 == 0:
                    self.perform_auto_calibration()
                
                # รายงานสถานะทุก 50 cycles
                if cycle_count % 50 == 0:
                    print(f"📊 Environmental Sensor Status - Measurements: {self.measurement_count}, "
                          f"Days since calibration: {(datetime.now() - self.last_calibration).days}")
                
                time.sleep(self.config["update_interval"])
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping Environmental Sensor...")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            self.client.loop_stop()
            self.client.disconnect()
            print("👋 Environmental Sensor stopped")

if __name__ == "__main__":
    sensor = AnalogEnvironmentalSensor()
    sensor.run()
