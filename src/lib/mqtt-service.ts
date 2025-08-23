import mqtt from 'mqtt';
import { broadcastToSSE } from './sse-service';
import pool from './database';

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
        'devices/institution/+/datas',   // Institution department device data
        'devices/institution/+/prop',    // Institution department device properties
        'devices/engineering/+/datas',   // Engineering department device data
        'devices/engineering/+/prop',    // Engineering department device properties
        'devices/liberal_arts/+/datas',  // Liberal Arts department device data
        'devices/liberal_arts/+/prop',   // Liberal Arts department device properties
        'devices/business_administration/+/datas', // Business Administration device data
        'devices/business_administration/+/prop',  // Business Administration device properties
        'devices/architecture/+/datas',  // Architecture department device data
        'devices/architecture/+/prop',   // Architecture department device properties
        'devices/industrial_education/+/datas', // Industrial Education device data
        'devices/industrial_education/+/prop',  // Industrial Education device properties
        'iot/alerts/+',                  // System alerts
        'iot/system/status'              // System-wide status
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

    this.mqttClient.on('message', async (topic, message) => {
      try {
        this.messageCount++;
        const data = JSON.parse(message.toString());
        
        // Add timestamp if not present
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        // ตรวจสอบ device_id ใหม่สำหรับ data topics
        if (topic.includes('/datas') || topic.includes('/data')) {
          await this.checkNewDevice(data, topic);
        }

        // Broadcast to all SSE clients
        broadcastToSSE(topic, data);
        
      } catch (error) {
        console.error('❌ Error processing MQTT message:', error);
      }
    });

    this.mqttClient.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    this.mqttClient.on('disconnect', () => {
      console.log('Disconnected from MQTT broker');
    });
  }

  private async checkNewDevice(data: any, topic: string) {
    try {
      // ดึง device_id จาก data หรือ topic
      const device_id = this.extractDeviceId(data, topic);
      if (!device_id) {
        return;
      }

      // ตรวจสอบว่า device_id นี้มีในฐานข้อมูลแล้วหรือไม่
      const existingDevice = await pool.query(
        'SELECT device_id FROM devices_prop WHERE device_id = $1',
        [device_id]
      );

      if (existingDevice.rows.length === 0) {
        // ส่งการแจ้งเตือนเกี่ยวกับ device ใหม่
        const notificationData = {
          type: 'new_device_detected',
          device_id: device_id,
          topic: topic,
          sample_data: {
            voltage: data.voltage,
            current: data.current || data.current_amperage,
            power: data.power || data.active_power,
            frequency: data.frequency,
            temperature: data.temperature || data.device_temperature
          },
          timestamp: new Date().toISOString(),
          message: `ตรวจพบอุปกรณ์ใหม่: ${device_id} จาก topic: ${topic}`
        };

        // ส่งการแจ้งเตือนผ่าน SSE ไปยัง admin dashboard
        broadcastToSSE('admin/new-device-notification', notificationData);
      } else {
        // อุปกรณ์มีอยู่แล้ว ให้อัปเดตข้อมูล
        await this.updateDeviceData(device_id, data);
      }
    } catch (error) {
      console.error('❌ Error checking new device:', error);
    }
  }

  private extractDeviceId(data: any, topic: string): string | null {
    // Method 1: จาก payload
    if (data.device_id) {
      return data.device_id;
    }
    
    if (data.meter_id) {
      return data.meter_id;
    }
    
    // Method 2: จาก topic pattern - devices/faculty/device_id/type
    const topicParts = topic.split('/');
    if (topicParts.length >= 3 && topicParts[0] === 'devices') {
      return topicParts[2]; // devices/faculty/[device_id]/type
    }
    
    return null;
  }

  private async updateDeviceData(device_id: string, data: any) {
    try {
      // อัปเดตข้อมูลในตาราง devices_data
      const updateQuery = `
        UPDATE devices_data 
        SET 
          voltage = COALESCE($1, voltage),
          current_amperage = COALESCE($2, current_amperage),
          power_factor = COALESCE($3, power_factor),
          frequency = COALESCE($4, frequency),
          active_power = COALESCE($5, active_power),
          reactive_power = COALESCE($6, reactive_power),
          apparent_power = COALESCE($7, apparent_power),
          device_temperature = COALESCE($8, device_temperature),
          network_status = 'online',
          last_data_received = CURRENT_TIMESTAMP,
          data_collection_count = data_collection_count + 1,
          updated_at = CURRENT_TIMESTAMP
        WHERE device_id = $9
      `;
      
      const values = [
        data.voltage,
        data.current || data.current_amperage,
        data.power_factor,
        data.frequency,
        data.power || data.active_power,
        data.reactive_power,
        data.apparent_power,
        data.temperature || data.device_temperature,
        device_id
      ];
      
      await pool.query(updateQuery, values);
      
    } catch (error) {
      console.error(`❌ Error updating device data for ${device_id}:`, error);
    }
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
