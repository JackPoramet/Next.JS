# MQTT Test Device Configuration
import os

# ================================
# MQTT BROKER SETTINGS
# ================================
MQTT_BROKER = "iot666.ddns.net"
MQTT_PORT = 1883
MQTT_USERNAME = "electric_energy"
MQTT_PASSWORD = "energy666"

# ================================
# DEVICE CONFIGURATIONS
# ================================

# Digital Device 1 - Smart Meter (Engineering Lab)
DIGITAL_DEVICE_1 = {
    "device_id": "ENG_SM_LAB_01",
    "name": "Smart Meter Engineering Lab 1",
    "faculty": "engineering",
    "building": "Engineering Building A",
    "floor": "2",
    "room": "Lab 201",
    "topic_base": "devices/engineering/ENG_SM_LAB_01",
    "topic_data": "devices/engineering/ENG_SM_LAB_01/datas",
    "topic_prop": "devices/engineering/ENG_SM_LAB_01/prop",
    "update_interval": 5,  # seconds
    "data_ranges": {
        "voltage": (200.0, 240.0),  # Phase voltage (line-to-neutral)
        "current": (10.0, 50.0),
        "power_factor": (0.85, 0.98),
        "frequency": (49.5, 50.5),
        "temperature": (25.0, 45.0)
    }
}

# Digital Device 2 - Power Monitor (Library)
DIGITAL_DEVICE_2 = {
    "device_id": "LIB_PM_MAIN_01",
    "name": "Power Monitor Library Main",
    "faculty": "institution",
    "building": "Library Building",
    "floor": "1",
    "room": "Main Panel",
    "topic_base": "devices/institution/LIB_PM_MAIN_01",
    "topic_data": "devices/institution/LIB_PM_MAIN_01/datas",
    "topic_prop": "devices/institution/LIB_PM_MAIN_01/prop",
    "update_interval": 3,  # seconds
    "data_ranges": {
        "voltage": (200.0, 240.0),  # Phase voltage (line-to-neutral)
        "current": (15.0, 80.0),
        "power_factor": (0.80, 0.95),
        "frequency": (49.8, 50.2),
        "temperature": (28.0, 40.0)
    }
}

# Analog Device - Environmental Sensor (Architecture Studio)
ANALOG_DEVICE = {
    "device_id": "ARC_ENV_STUDIO_01",
    "name": "Environmental Sensor Architecture Studio",
    "faculty": "architecture",
    "building": "Architecture Building C",
    "floor": "3",
    "room": "Studio 301",
    "topic_base": "devices/architecture/ARC_ENV_STUDIO_01",
    "topic_data": "devices/architecture/ARC_ENV_STUDIO_01/datas",
    "topic_prop": "devices/architecture/ARC_ENV_STUDIO_01/prop",
    "update_interval": 10,  # seconds
    "data_ranges": {
        "temperature": (20.0, 35.0),
        "voltage": (12.0, 24.0),  # DC voltage for sensors
        "current": (0.1, 2.0)     # Low current for sensors
    }
}

# ================================
# SIMULATION SETTINGS
# ================================
SIMULATION_CONFIG = {
    "noise_factor": 0.1,        # 10% noise in readings
    "drift_factor": 0.05,       # 5% gradual drift
    "spike_probability": 0.02,  # 2% chance of data spike
    "offline_probability": 0.01, # 1% chance of going offline
    "maintenance_interval": 3600, # Maintenance every hour (simulated)
    "debug_mode": True,         # Print debug messages
    "save_to_file": False       # Save data to CSV files
}

# ================================
# ALERT THRESHOLDS (3-Phase System)
# ================================
ALERT_THRESHOLDS = {
    "voltage_min": 190.0,  # Phase voltage minimum
    "voltage_max": 250.0,  # Phase voltage maximum
    "current_max": 100.0,
    "power_factor_min": 0.7,
    "temperature_max": 50.0,
    "frequency_min": 49.0,
    "frequency_max": 51.0,
    "voltage_unbalance_max": 3.0,  # % unbalance between phases
    "current_unbalance_max": 5.0   # % unbalance between phases
}
