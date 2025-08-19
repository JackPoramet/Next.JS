# MQTT Topic Structure and Data Format

## Updated Topic Architecture (August 2025)

The system now uses a **dual-topic structure** for better data organization:

### Topic Structure
```
devices/{faculty}/{device_id}/datas  # Real-time sensor data
devices/{faculty}/{device_id}/prop   # Device properties/metadata
```

### Supported Faculties
1. **institution** - `devices/institution/+/{datas|prop}`
2. **engineering** - `devices/engineering/+/{datas|prop}`
3. **liberal_arts** - `devices/liberal_arts/+/{datas|prop}`
4. **business_administration** - `devices/business_administration/+/{datas|prop}`
5. **architecture** - `devices/architecture/+/{datas|prop}`
6. **industrial_education** - `devices/industrial_education/+/{datas|prop}`

## Example Topics
```
# Device Data Topics (Real-time sensor readings)
devices/institution/library_meter_001/datas
devices/engineering/lab_sensor_01/datas
devices/liberal_arts/classroom_a101/datas
devices/business_administration/office_b205/datas
devices/architecture/studio_c301/datas
devices/industrial_education/workshop_d101/datas

# Device Property Topics (Metadata and configuration)
devices/institution/library_meter_001/prop
devices/engineering/lab_sensor_01/prop
devices/liberal_arts/classroom_a101/prop
devices/business_administration/office_b205/prop
devices/architecture/studio_c301/prop
devices/industrial_education/workshop_d101/prop
```

## Data Format Specifications

### 1. Device Properties (/prop topic)
```json
{
  "device_id": "lab_sensor_01",
  "name": "Engineering Lab Smart Meter",
  "faculty": "engineering",
  "building": "Engineering Building A",
  "floor": "2",
  "room": "Lab 201",
  "device_type": "smart_meter",
  "manufacturer": "PowerTech",
  "model": "PM-4000",
  "installation_date": "2024-03-15",
  "timestamp": "2025-08-19T10:30:00Z"
}

### 2. Device Sensor Data (/datas topic)
```json
{
  "device_id": "lab_sensor_01",
  "timestamp": "2025-08-19T14:30:00Z",
  "voltage": 235.2,
  "current": 45.8,
  "power": 10760.5,
  "energy": 1248.75,
  "frequency": 50.1,
  "power_factor": 0.92,
  "temperature": 28.5,
  "status": "online"
}
```

## Simplified Status System

### Device Status (Online/Offline Detection)
- **online** - Device sent data within the last 60 seconds
- **offline** - No data received for more than 60 seconds

Status is automatically determined by the dashboard based on message timestamps, not device-reported status.

## Architecture Overview

### Data Flow
1. **Python MQTT Devices** → Publish to MQTT broker (iot666.ddns.net:1883)
2. **Next.js MQTT Service** → Subscribes to all faculty topics
3. **SSE Service** → Broadcasts received data to connected clients
4. **Dashboard Components** → Display real-time data with timeout-based status

## MQTT Connection Configuration

```env
MQTT_BROKER_URL=mqtt://iot666.ddns.net:1883
MQTT_USERNAME=electric_energy
MQTT_PASSWORD=energy666
```

## Testing MQTT Topics

### Using mosquitto_pub (Command Line)
```bash
# Send device properties to engineering department
mosquitto_pub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/engineering/lab_sensor_01/prop" \
  -m '{"device_id":"lab_sensor_01","name":"Engineering Lab Smart Meter","faculty":"engineering","building":"Engineering Building A","floor":"2","room":"Lab 201","timestamp":"2025-08-19T10:30:00Z"}'

# Send sensor data to engineering department
mosquitto_pub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/engineering/lab_sensor_01/datas" \
  -m '{"device_id":"lab_sensor_01","voltage":235.2,"current":45.8,"power":10760.5,"energy":1248.75,"temperature":28.5,"status":"online","timestamp":"2025-08-19T14:30:00Z"}'

# Send data to architecture department
mosquitto_pub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/architecture/studio_c301/datas" \
  -m '{"device_id":"studio_c301","voltage":220.5,"current":15.2,"power":3351.6,"energy":125.8,"temperature":35.2,"status":"online","timestamp":"2025-08-19T14:30:00Z"}'
```

### Using MQTT Explorer or Similar Tools
```
Host: iot666.ddns.net
Port: 1883
Username: electric_energy
Password: energy666

Subscribe to: devices/+/+/datas
Subscribe to: devices/+/+/prop
```

## Dashboard Integration

### Real-time Dashboard (/realtime)
- Displays only `/datas` topics
- Groups devices by faculty
- Shows online/offline status based on 60-second timeout
- Updates automatically via SSE connection

### System Check Dashboard (/dashboard)
- Monitors both `/datas` and `/prop` topics
- Provides detailed MQTT message inspection
- Shows connection status and message counts
- Debug-friendly interface for development
  -u electric_energy -P energy666 \
  -t "devices/architecture/studio_meter_01" \
  -m '{"device_id":"studio_meter_01","voltage":220.0,"current":12.8,"power":2816.0,"energy":98.5,"status":"online","timestamp":"2025-07-30T10:30:00Z"}'
```

### Using MQTT.js (Node.js)
```javascript
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://iot666.ddns.net:1883', {
  username: 'electric_energy',
  password: 'energy666'
});

client.on('connect', () => {
  // Send data to liberal arts department
  const data = {
    device_id: 'classroom_sensor_a101',
    voltage: 220.2,
    current: 8.5,
    power: 1871.7,
    energy: 75.3,
    status: 'online',
    timestamp: new Date().toISOString()
  };
  
  client.publish('devices/liberal_arts/classroom_sensor_a101', JSON.stringify(data));
});
```

## Dashboard Integration

The real-time dashboard automatically:
- Groups devices by department
- Displays department name in device cards
- Updates data in real-time as MQTT messages arrive
- Maintains connection status indicators

## Monitoring and Debugging

### Check SSE Connection
```javascript
// Browser console
const eventSource = new EventSource('/api/sse');
eventSource.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

### MQTT Subscription Verification
```bash
# Subscribe to all device topics
mosquitto_sub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/+/+"
```
