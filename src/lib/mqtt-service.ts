import mqtt from 'mqtt';
import { broadcastToSSE } from './sse-service';

export interface IoTDeviceData {
  device_id: string;
  timestamp: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  power_factor: number;
  temperature?: number;
  status: 'online' | 'offline' | 'maintenance' | 'error';
}

export interface MeterReading {
  meter_id: string;
  timestamp: string;
  total_energy: number;
  daily_energy: number;
  monthly_energy: number;
  peak_demand: number;
  meter_status: 'active' | 'inactive' | 'error';
}

class MQTTService {
  private mqttClient: mqtt.MqttClient | null = null;
  private isInitialized = false;
  private subscribedTopics: string[] = [];
  private messageCount = 0;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const clientId = `nextjs-dashboard-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  // log removed
      
      // Initialize MQTT Client - เชื่อมต่อ IoT Server จริง
      this.mqttClient = mqtt.connect('mqtt://iot666.ddns.net:1883', {
        clientId,
        clean: true,
        connectTimeout: 10000,
        username: 'electric_energy',
        password: 'energy666',
        reconnectPeriod: 5000,
        keepalive: 60
      });

      this.setupMQTTListeners();

      this.isInitialized = true;
  // log removed
    } catch (error) {
      console.error('❌ Failed to initialize MQTT service:', error);
    }
  }

  private setupMQTTListeners() {
    if (!this.mqttClient) return;

    this.mqttClient.on('connect', () => {
  // log removed
      
      // Define topics to subscribe
      const topicsToSubscribe = [
        'devices/institution/+',          // Institution department devices
        'devices/engineering/+',          // Engineering department devices  
        'devices/liberal_arts/+',         // Liberal Arts department devices
        'devices/business_administration/+', // Business Administration department devices
        'devices/architecture/+',         // Architecture department devices
        'devices/industrial_education/+', // Industrial Education department devices
        'iot/alerts/+',                   // System alerts
        'iot/system/status'               // System-wide status
      ];
      
  // log removed
      
      // Subscribe to IoT device topics
      this.mqttClient?.subscribe(topicsToSubscribe, { qos: 1 }, (err, granted) => {
        if (err) {
          console.error('❌ MQTT subscription error:', err);
        } else {
          // log removed
          granted?.forEach(grant => {
            // log removed
            this.subscribedTopics.push(grant.topic);
          });
          // log removed
        }
      });
    });

    this.mqttClient.on('message', (topic, message) => {
      try {
        this.messageCount++;
        const data = JSON.parse(message.toString());
        // Debug logs removed for cleaner console output
        // console.log(`🎯 MQTT Message #${this.messageCount} received on ${topic}`);
        // console.log(`📊 Raw message: ${message.toString()}`);
        // console.log(`📋 Parsed data:`, JSON.stringify(data, null, 2));
        
        // Add timestamp if not present
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        // Broadcast to all SSE clients
        // console.log(`🚀 Broadcasting to SSE clients...`);
        broadcastToSSE(topic, data);
        // console.log(`✅ Broadcast completed for topic: ${topic}`);
        
      } catch (error) {
        console.error('❌ Error processing MQTT message:', error);
        console.error('❌ Raw message:', message.toString());
      }
    });

    this.mqttClient.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.mqttClient.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
    });
  }

  // Method to publish test data (for development)
  public publishTestData() {
    if (!this.mqttClient) return;

    // Simulate device data
    const deviceData: IoTDeviceData = {
      device_id: 'DEV001',
      timestamp: new Date().toISOString(),
      voltage: 220 + Math.random() * 10,
      current: 5 + Math.random() * 2,
      power: 1100 + Math.random() * 200,
      energy: Math.random() * 1000,
      frequency: 50 + Math.random() * 0.5,
      power_factor: 0.8 + Math.random() * 0.2,
      temperature: 25 + Math.random() * 10,
      status: 'online'
    };

    // Simulate meter reading
    const meterData: MeterReading = {
      meter_id: 'MTR001',
      timestamp: new Date().toISOString(),
      total_energy: 15000 + Math.random() * 1000,
      daily_energy: 50 + Math.random() * 20,
      monthly_energy: 1500 + Math.random() * 200,
      peak_demand: 2.5 + Math.random() * 0.5,
      meter_status: 'active'
    };

    this.mqttClient?.publish('devices/DEV001/data', JSON.stringify(deviceData));
    this.mqttClient?.publish('meters/MTR001/reading', JSON.stringify(meterData));
  }

  public getConnectionStatus() {
    return {
      mqtt: this.mqttClient?.connected || false,
      initialized: this.isInitialized
    };
  }

  public async disconnect() {
    if (this.mqttClient) {
      await this.mqttClient.endAsync();
    }
  }
}

// Singleton instance
let mqttService: MQTTService | null = null;

export function getMQTTService(): MQTTService {
  if (!mqttService) {
    mqttService = new MQTTService();
  }
  return mqttService;
}

export default MQTTService;
