# 🗂️ JSON to Database Field Mapping

## 📋 device_prop_example.json → Database Tables

### → devices_pending (Discovery Phase)
```json
{
  "device_id": "ESP32_ENGR_001",                    → device_id
  "device_name": "Computer Engineering Meter...",  → device_name  
  "device_prop.device_type": "esp32_energy_monitor", → device_type
  "device_prop.firmware_version": "1.2.3",        → firmware_version
  "device_prop.mac_address": "AA:BB:CC:DD:EE:01", → mac_address
  "device_prop.ip_address": "192.168.1.101",      → ip_address
  "device_prop.connection_type": "wifi",           → connection_type
  "timestamp": "2024-08-23T14:30:25.123Z",        → discovered_at
  // ทั้งไฟล์ JSON                                  → mqtt_data (JSONB)
}
```

### → manufacturers (Lookup Table)
```json
{
  "device_model.manufacturer": "Espressif Systems", → name
  "meter_info.suggested_manufacturer": "Schneider Electric" → name
}
```

### → power_specifications (Lookup Table) 
```json
{
  "power_specifications.rated_voltage": 380.0,       → rated_voltage (3-phase)
  "power_specifications.rated_current": 100.0,      → rated_current  
  "power_specifications.rated_power": 65000.0,      → rated_power (3-phase)
  "power_specifications.power_phase": "three",      → power_phase
  "power_specifications.frequency": 50.0,           → frequency
  "power_specifications.accuracy": "Class 1"        → accuracy
}
```

### → device_models (Lookup Table)
```json
{
  "device_model.model_name": "ESP32-S3-DevKitC",   → model_name
  "device_model.supported_connections": [...],     → supported_connections
  // manufacturer_id จาก manufacturers table      → manufacturer_id
}
```

### → faculties (Lookup Table)
```json
{
  "location_suggestion.faculty_code": "engineering", → faculty_code
  "location_suggestion.faculty_name": "คณะวิศว...",  → faculty_name
}
```

### → locations (Lookup Table)
```json
{
  // faculty_id จาก faculties table               → faculty_id
  "location_suggestion.building": "Computer...",    → building
  "location_suggestion.floor": "2",                 → floor  
  "location_suggestion.room": "Server Room A201"    → room
}
```

### → meter_prop (After Approval)
```json
{
  "meter_info.suggested_meter_model": "Schneider EM6400", → model_name
  // manufacturer_id จาก manufacturers table              → manufacturer_id
  // power_spec_id จาก power_specifications table        → power_spec_id
  "meter_info.meter_type": "digital",                     → meter_type
}
```

### → devices_prop (After Approval)
```json
{
  "device_id": "ESP32_ENGR_001",                    → device_id
  "device_name": "Computer Engineering Meter...",  → device_name
  // device_model_id จาก device_models table      → device_model_id  
  // meter_id จาก meter_prop table                → meter_id
  // location_id จาก locations table             → location_id
  "device_prop.install_date": "2024-08-23",        → install_date
  "device_prop.ip_address": "192.168.1.101",       → ip_address
  "device_prop.mac_address": "AA:BB:CC:DD:EE:01",  → mac_address
  "device_prop.connection_type": "wifi",            → connection_type
  "administrative.responsible_person": "อาจารย์...", → responsible_person
  "administrative.contact_info": "vitya.comp@...",  → contact_info
  "status": "online" → "active",                    → status
  // is_enabled = true (default)                   → is_enabled
}
```

## ⚡ device_data_example.json → Database Tables

### → devices_data (Real-time Data)
```json
{
  "device_id": "ESP32_ENGR_001",                           → device_id
  "network_status": "online",                              → network_status
  "connection_quality": 92,                                → connection_quality  
  "signal_strength": -45,                                  → signal_strength
  "electrical_measurements.voltage": 380.5,                → voltage (Phase A)
  "electrical_measurements.current_amperage": 45.8,        → current_amperage (Phase A)
  "electrical_measurements.power_factor": 0.88,            → power_factor (Phase A)
  "electrical_measurements.frequency": 50.1,               → frequency
  "three_phase_measurements.voltage_phase_b": 379.8,       → voltage_phase_b
  "three_phase_measurements.voltage_phase_c": 381.2,       → voltage_phase_c
  "three_phase_measurements.current_phase_b": 44.2,        → current_phase_b
  "three_phase_measurements.current_phase_c": 46.5,        → current_phase_c
  "three_phase_measurements.power_factor_phase_b": 0.85,   → power_factor_phase_b
  "three_phase_measurements.power_factor_phase_c": 0.90,   → power_factor_phase_c
  "electrical_measurements.active_power": 28450.5,         → active_power (Total)
  "electrical_measurements.reactive_power": 12250.2,       → reactive_power
  "electrical_measurements.apparent_power": 31038.9,       → apparent_power
  "three_phase_measurements.active_power_phase_a": 9480.5, → active_power_phase_a
  "three_phase_measurements.active_power_phase_b": 9120.8, → active_power_phase_b
  "three_phase_measurements.active_power_phase_c": 9849.2, → active_power_phase_c
  "environmental_monitoring.device_temperature": 42.8,     → device_temperature
  "electrical_measurements.total_energy": 856789.245,      → total_energy
  "electrical_measurements.daily_energy": 245.678,         → daily_energy
  "device_health.uptime_hours": 168,                       → uptime_hours
  "device_health.last_maintenance": null,                  → last_maintenance
  "timestamp": "2024-08-23T14:30:25.123Z",                → last_data_received
  "device_health.data_collection_count": 40320,            → data_collection_count
  "device_health.last_error_code": null,                   → last_error_code
  "device_health.last_error_message": null,                → last_error_message
  "device_health.last_error_time": null,                   → last_error_time
  "device_health.error_count_today": 0,                    → error_count_today
  "timestamp": "2024-08-23T14:30:25.123Z",                → updated_at
}
```

### → devices_history (Historical Archive)
```json
{
  "device_id": "ESP32_ENGR_001",                           → device_id
  "timestamp": "2024-08-23T14:30:25.123Z",                → recorded_at
  "electrical_measurements.voltage": 220.5,                → voltage
  "electrical_measurements.current_amperage": 12.8,        → current_amperage
  "electrical_measurements.power_factor": 0.85,            → power_factor
  "electrical_measurements.frequency": 50.1,               → frequency
  // ... (same mappings as devices_data for historical fields)
  "electrical_measurements.total_energy": 156789.245,      → total_energy
  "electrical_measurements.daily_energy": 45.678,          → daily_energy
  "energy_measurements.total_energy_import": 156789.245,   → total_energy_import
  "energy_measurements.total_energy_export": 0.0,          → total_energy_export
  "environmental_monitoring.device_temperature": 35.2,     → device_temperature
  "connection_quality": 85,                                → connection_quality
}
```

## 🔧 device_config_response.json → Device Configuration

### Response after approval (sent back to device)
```json
{
  "registration_status": "approved",                       → Device receives confirmation
  "device_configuration.enable_data_transmission": true,  → Device starts sending /data
  "device_configuration.data_collection_interval": 60,    → Update collection interval
  "device_configuration.mqtt_topics.data_topic": "...",   → Topic for data transmission
  // All assigned database IDs and configurations         → Device internal config
}
```

## 🔍 Key Points

1. **Discovery Phase**: JSON → `devices_pending` table with full JSON in `mqtt_data` field
2. **Approval Phase**: Admin maps JSON data → normalized lookup tables + `devices_prop`
3. **Operational Phase**: Device receives config → starts sending structured `/data`
4. **Data Collection**: `/data` JSON → `devices_data` + `devices_history`

## 📊 Data Flow Summary

```
JSON /prop → devices_pending → Admin Approval → Normalized Tables
                ↓
JSON /data → devices_data + devices_history (after approval)
```
