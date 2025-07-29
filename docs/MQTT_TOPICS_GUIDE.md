# MQTT Topic Structure and Data Format

## Department-based Device Topics

The system subscribes to the following MQTT topics for department-specific IoT devices:

### Topic Structure
```
devices/{department}/{device_id}
```

### Supported Departments
1. **institution** - `devices/institution/+`
2. **engineering** - `devices/engineering/+`
3. **liberal_arts** - `devices/liberal_arts/+`
4. **business_administration** - `devices/business_administration/+`
5. **architecture** - `devices/architecture/+`
6. **industrial_education** - `devices/industrial_education/+`

## Example Topics
```
devices/institution/meter_001
devices/engineering/sensor_lab_01
devices/liberal_arts/classroom_a101
devices/business_administration/office_b205
devices/architecture/studio_c301
devices/industrial_education/workshop_d101
```

## Expected Data Format

### IoT Device Data
```json
{
  "device_id": "meter_001",
  "timestamp": "2025-07-30T10:30:00Z",
  "voltage": 220.5,
  "current": 15.2,
  "power": 3351.6,
  "energy": 125.8,
  "frequency": 50.1,
  "power_factor": 0.98,
  "temperature": 35.2,
  "status": "online"
}
```

### Meter Reading Data
```json
{
  "meter_id": "meter_001",
  "timestamp": "2025-07-30T10:30:00Z",
  "total_energy": 1250.8,
  "daily_energy": 45.2,
  "monthly_energy": 890.5,
  "peak_demand": 120.5,
  "meter_status": "active"
}
```

## Status Values

### Device Status
- `online` - Device is operational and sending data
- `offline` - Device is not responding
- `maintenance` - Device is under maintenance
- `error` - Device has encountered an error

### Meter Status
- `active` - Meter is recording data normally
- `inactive` - Meter is not recording data
- `error` - Meter has a fault or error

## Real-time Data Flow

1. **MQTT Publisher** → Sends data to topic `devices/{department}/{device_id}`
2. **MQTT Service** → Receives data and forwards to WebSocket
3. **WebSocket Server** → Broadcasts to connected clients
4. **Frontend Dashboard** → Displays real-time data by department

## MQTT Connection Configuration

```env
MQTT_BROKER_URL=mqtt://iot666.ddns.net:1883
MQTT_USERNAME=electric_energy
MQTT_PASSWORD=energy666
```

## Testing MQTT Topics

### Using mosquitto_pub (Command Line)
```bash
# Send test data to engineering department
mosquitto_pub -h iot666.ddns.net -p 1883 \
  -u electric_energy -P energy666 \
  -t "devices/engineering/lab_sensor_01" \
  -m '{"device_id":"lab_sensor_01","voltage":220.5,"current":15.2,"power":3351.6,"energy":125.8,"status":"online","timestamp":"2025-07-30T10:30:00Z"}'

# Send test data to architecture department
mosquitto_pub -h iot666.ddns.net -p 1883 \
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

### Check WebSocket Connection
```javascript
// Browser console
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
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
