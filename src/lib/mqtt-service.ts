import mqtt from 'mqtt';
import { broadcastToSSE } from './sse-service';
import pool from './database';
import { getCleanupService } from './cleanup-service';

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
      console.log(`🔗 Initializing MQTT connection to iot666.ddns.net:1883`);
      
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

      // Start cleanup service
      const cleanupService = getCleanupService();
      console.log('🧹 Cleanup service status:', cleanupService.getStatus());

      this.isInitialized = true;
      console.log('✅ MQTT Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MQTT service:', error);
    }
  }

  private setupMQTTListeners() {
    if (!this.mqttClient) return;

    this.mqttClient.on('connect', () => {
      console.log('✅ Connected to MQTT broker successfully');
      
      // Define topics to subscribe
      const topicsToSubscribe = [
        'devices/institution/+/datas',   // Institution department device data
        'devices/institution/+/prop',    // Institution department device properties
        'devices/engineering/+/datas',   // Engineering department device data
        'devices/engineering/+/prop',    // Engineering department device properties
        'devices/engineering/+/data',    // Engineering department device data (single)
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
      
      console.log('📡 Subscribing to MQTT topics:', topicsToSubscribe);
      
      // Subscribe to IoT device topics
      this.mqttClient?.subscribe(topicsToSubscribe, { qos: 1 }, (err, granted) => {
        if (err) {
          console.error('❌ MQTT subscription error:', err);
        } else {
          console.log('✅ Successfully subscribed to topics:');
          granted?.forEach(grant => {
            console.log(`   - ${grant.topic} (QoS: ${grant.qos})`);
            this.subscribedTopics.push(grant.topic);
          });
          console.log(`📊 Total subscribed topics: ${this.subscribedTopics.length}`);
        }
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      try {
        this.messageCount++;
        const data = JSON.parse(message.toString());
        
        console.log(`📨 Received MQTT message:`, {
          topic,
          messageCount: this.messageCount,
          dataPreview: {
            device_id: data.device_id,
            timestamp: data.timestamp
          }
        });
        
        // Add timestamp if not present
        if (!data.timestamp) {
          data.timestamp = new Date().toISOString();
        }

        // Handle /prop messages - บันทึกลง devices_pending table
        if (topic.includes('/prop')) {
          console.log(`🔧 Processing /prop message for device: ${data.device_id}`);
          await this.handleDevicePropertiesMessage(data, topic);
        }

        // ตรวจสอบ device_id ใหม่สำหรับ data topics
        if (topic.includes('/datas') || topic.includes('/data')) {
          console.log(`📊 Processing /data message for device: ${data.device_id}`);
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

  private async handleDevicePropertiesMessage(data: any, topic: string) {
    try {
      console.log('📨 Device Properties Message:', { topic, device_id: data.device_id });
      
      if (!data.device_id) {
        console.error('❌ Missing device_id in prop message');
        return;
      }

      // Extract device properties from nested structure or root level
      const deviceProp = data.device_prop || {};
      const deviceInfo = {
        device_id: data.device_id,
        device_name: data.device_name || deviceProp.device_name,
        device_type: data.device_type || deviceProp.device_type || 'IoT Device',
        ip_address: data.ip_address || deviceProp.ip_address,
        mac_address: data.mac_address || deviceProp.mac_address,
        firmware_version: data.firmware_version || deviceProp.firmware_version,
        connection_type: data.connection_type || deviceProp.connection_type || 'wifi'
      };

      console.log('🔍 Extracted device info:', deviceInfo);

      // Check if device already in pending list
      const existingPending = await pool.query(
        'SELECT device_id FROM devices_pending WHERE device_id = $1',
        [deviceInfo.device_id]
      );

      if (existingPending.rows.length > 0) {
        // Update existing pending device
        await pool.query(`
          UPDATE devices_pending 
          SET 
            device_name = COALESCE($1, device_name),
            device_type = COALESCE($2, device_type),
            ip_address = COALESCE($3, ip_address),
            mac_address = COALESCE($4, mac_address),
            firmware_version = COALESCE($5, firmware_version),
            connection_type = COALESCE($6, connection_type),
            mqtt_data = $7,
            last_seen_at = CURRENT_TIMESTAMP,
            discovery_source = 'mqtt'
          WHERE device_id = $8
        `, [
          deviceInfo.device_name,
          deviceInfo.device_type,
          deviceInfo.ip_address,
          deviceInfo.mac_address,
          deviceInfo.firmware_version,
          deviceInfo.connection_type,
          JSON.stringify(data),
          deviceInfo.device_id
        ]);
        
        console.log(`🔄 Updated pending device: ${deviceInfo.device_id}`);
      } else {
        // Insert new pending device
        await pool.query(`
          INSERT INTO devices_pending (
            device_id, device_name, device_type, ip_address, 
            mac_address, firmware_version, connection_type,
            approval_status_id, mqtt_data, discovered_at,
            last_seen_at, discovery_source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'mqtt')
        `, [
          deviceInfo.device_id,
          deviceInfo.device_name || `Device ${deviceInfo.device_id}`,
          deviceInfo.device_type,
          deviceInfo.ip_address,
          deviceInfo.mac_address,
          deviceInfo.firmware_version,
          deviceInfo.connection_type,
          JSON.stringify(data)
        ]);
        
        console.log(`✅ Added new pending device: ${deviceInfo.device_id}`);
        
        // Send notification to admin
        const notificationData = {
          type: 'new_device_pending',
          device_id: deviceInfo.device_id,
          device_name: deviceInfo.device_name || `Device ${deviceInfo.device_id}`,
          topic: topic,
          timestamp: new Date().toISOString(),
          message: `อุปกรณ์ใหม่รอการอนุมัติ: ${deviceInfo.device_id}`
        };
        
        broadcastToSSE('admin/device-pending-notification', notificationData);
      }
      
    } catch (error) {
      console.error('❌ Error handling device properties message:', error);
    }
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

  public async publish(topic: string, message: string, options: { qos?: 0 | 1 | 2, retain?: boolean } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.mqttClient || !this.mqttClient.connected) {
        reject(new Error('MQTT client not connected'));
        return;
      }

      this.mqttClient.publish(topic, message, {
        qos: options.qos || 1,
        retain: options.retain || false
      }, (error) => {
        if (error) {
          console.error('MQTT publish error:', error);
          reject(error);
        } else {
          console.log(`Published to ${topic}:`, message);
          resolve();
        }
      });
    });
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
    console.log('🚀 Creating new MQTT Service instance...');
    mqttService = new MQTTService();
  }
  return mqttService;
}

// Auto-start MQTT service when this module is imported
if (typeof window === 'undefined') { // Server-side only
  console.log('🔄 Auto-starting MQTT Service...');
  getMQTTService();
}

export default MQTTService;
