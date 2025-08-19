#!/usr/bin/env python3
"""
Simple MQTT Test - Quick Test Script
สคริปต์ทดสอบเบื้องต้นสำหรับส่งข้อมูลทดสอบไปยัง MQTT broker
"""

import json
import time
from datetime import datetime
import paho.mqtt.client as mqtt
from config import MQTT_BROKER, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD

def test_mqtt_connection():
    """ทดสอบการเชื่อมต่อ MQTT broker"""
    
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("✅ Connected to MQTT Broker successfully!")
            
            # ส่งข้อมูลทดสอบ
            test_data = {
                "device_id": "TEST_DEVICE_001",
                "timestamp": datetime.now().isoformat(),
                "message": "Hello from Python MQTT test!",
                "test_values": {
                    "voltage": 230.5,
                    "current": 15.2,
                    "power": 3503.6,
                    "status": "online"
                }
            }
            
            topic = "devices/test/TEST_DEVICE_001"
            client.publish(topic, json.dumps(test_data))
            print(f"📤 Test message sent to topic: {topic}")
            print(f"📊 Data: {json.dumps(test_data, indent=2)}")
            
        else:
            print(f"❌ Failed to connect, return code {rc}")
    
    def on_publish(client, userdata, mid):
        print(f"✅ Message published successfully (ID: {mid})")
        client.disconnect()
    
    def on_disconnect(client, userdata, rc):
        print("🔌 Disconnected from MQTT Broker")
    
    # สร้าง MQTT client
    client = mqtt.Client()
    client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
    client.on_connect = on_connect
    client.on_publish = on_publish
    client.on_disconnect = on_disconnect
    
    try:
        print("🔗 Testing MQTT connection...")
        print(f"📡 Broker: {MQTT_BROKER}:{MQTT_PORT}")
        print(f"👤 Username: {MQTT_USERNAME}")
        
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
        
    except Exception as e:
        print(f"❌ Connection error: {e}")

if __name__ == "__main__":
    test_mqtt_connection()
