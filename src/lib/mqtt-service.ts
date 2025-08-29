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

      // ตรวจสอบว่า device_id นี้มีในอุปกรณ์ที่อนุมัติแล้วหรือไม่
      const existingApproved = await pool.query(
        'SELECT device_id FROM devices_prop WHERE device_id = $1',
        [device_id]
      );

      if (existingApproved.rows.length > 0) {
        console.log(`📋 Device ${device_id} already approved - updating device data`);
        
        // อัปเดตข้อมูลอุปกรณ์ที่อนุมัติแล้ว
        await this.updateDeviceData(device_id, data);
        return; // อุปกรณ์อนุมัติแล้ว ไม่ต้องแจ้งเตือน
      }

      // ตรวจสอบว่า device_id นี้มีใน pending list แล้วหรือไม่
      const existingPending = await pool.query(
        'SELECT device_id FROM devices_pending WHERE device_id = $1',
        [device_id]
      );

      if (existingPending.rows.length > 0) {
        console.log(`📋 Device ${device_id} already in pending list - skipping notification`);
        return; // อุปกรณ์อยู่ใน pending list แล้ว
      }

      // ส่งการแจ้งเตือนเกี่ยวกับ device ใหม่ที่ยังไม่เคยเห็น
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

      // Check if device already exists in approved devices (devices_prop)
      const existingApproved = await pool.query(
        'SELECT device_id FROM devices_prop WHERE device_id = $1',
        [deviceInfo.device_id]
      );

      if (existingApproved.rows.length > 0) {
        console.log(`📋 Device ${deviceInfo.device_id} already approved - sending config automatically`);
        await this.sendConfigToApprovedDevice(deviceInfo.device_id);
        return; // อุปกรณ์อนุมัติแล้ว ส่ง config และไม่ต้องแจ้งเตือน
      }

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
        // Double-check: ตรวจสอบอีกครั้งว่าไม่มีใน devices_prop ก่อนเพิ่มใน devices_pending
        const doubleCheck = await pool.query(
          'SELECT device_id FROM devices_prop WHERE device_id = $1',
          [deviceInfo.device_id]
        );

        if (doubleCheck.rows.length > 0) {
          console.log(`⚠️ Device ${deviceInfo.device_id} found in devices_prop during double-check - sending config`);
          await this.sendConfigToApprovedDevice(deviceInfo.device_id);
          return;
        }

        // Insert new pending device (with database trigger protection)
        try {
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
          
        } catch (insertError: any) {
          // หาก database trigger ป้องกันการเพิ่มข้อมูลซ้ำ
          if (insertError.message?.includes('already exists in approved devices')) {
            console.log(`🔄 Device ${deviceInfo.device_id} approved during insertion - sending config`);
            await this.sendConfigToApprovedDevice(deviceInfo.device_id);
          } else {
            throw insertError; // re-throw หาก error อื่น
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error handling device properties message:', error);
    }
  }

  private async updateDeviceData(device_id: string, data: any) {
    try {
      console.log(`🔄 Updating devices_data for device: ${device_id}`);
      console.log(`📊 Data structure:`, JSON.stringify(data, null, 2));

      // Extract data from the new format structure
      const electrical = data.electrical_measurements || {};
      const threephase = data.three_phase_measurements || {};
      const environmental = data.environmental_monitoring || {};
      const health = data.device_health || {};
      const energy = data.energy_measurements || {};

      // อัปเดตข้อมูลในตาราง devices_data
      const updateQuery = `
        UPDATE devices_data 
        SET 
          -- Network Status
          network_status = COALESCE($1::network_status_enum, 'online'::network_status_enum),
          connection_quality = COALESCE($2, connection_quality),
          signal_strength = COALESCE($3, signal_strength),
          
          -- Basic Electrical Measurements
          voltage = COALESCE($4, voltage),
          current_amperage = COALESCE($5, current_amperage),
          power_factor = COALESCE($6, power_factor),
          frequency = COALESCE($7, frequency),
          
          -- Power Measurements
          active_power = COALESCE($8, active_power),
          reactive_power = COALESCE($9, reactive_power),
          apparent_power = COALESCE($10, apparent_power),
          
          -- 3-Phase Measurements
          voltage_phase_b = COALESCE($11, voltage_phase_b),
          voltage_phase_c = COALESCE($12, voltage_phase_c),
          current_phase_b = COALESCE($13, current_phase_b),
          current_phase_c = COALESCE($14, current_phase_c),
          power_factor_phase_b = COALESCE($15, power_factor_phase_b),
          power_factor_phase_c = COALESCE($16, power_factor_phase_c),
          active_power_phase_a = COALESCE($17, active_power_phase_a),
          active_power_phase_b = COALESCE($18, active_power_phase_b),
          active_power_phase_c = COALESCE($19, active_power_phase_c),
          
          -- Environmental & Health
          device_temperature = COALESCE($20, device_temperature),
          uptime_hours = COALESCE($21, uptime_hours),
          
          -- Energy Measurements
          total_energy = COALESCE($22, total_energy),
          daily_energy = COALESCE($23, daily_energy),
          
          -- System Updates
          last_data_received = CURRENT_TIMESTAMP,
          data_collection_count = COALESCE($24, data_collection_count + 1),
          updated_at = CURRENT_TIMESTAMP
        WHERE device_id = $25
      `;
      
      const values = [
        // Network Status
        data.network_status || 'online',                    // $1
        data.connection_quality,                            // $2  
        data.signal_strength,                               // $3
        
        // Basic Electrical Measurements
        electrical.voltage,                                 // $4
        electrical.current_amperage,                        // $5
        electrical.power_factor,                            // $6
        electrical.frequency,                               // $7
        
        // Power Measurements  
        electrical.active_power,                            // $8
        electrical.reactive_power,                          // $9
        electrical.apparent_power,                          // $10
        
        // 3-Phase Measurements
        threephase.voltage_phase_b,                         // $11
        threephase.voltage_phase_c,                         // $12
        threephase.current_phase_b,                         // $13
        threephase.current_phase_c,                         // $14
        threephase.power_factor_phase_b,                    // $15
        threephase.power_factor_phase_c,                    // $16
        threephase.active_power_phase_a,                    // $17
        threephase.active_power_phase_b,                    // $18
        threephase.active_power_phase_c,                    // $19
        
        // Environmental & Health
        environmental.device_temperature,                   // $20
        health.uptime_hours,                               // $21
        
        // Energy Measurements
        electrical.total_energy || energy.total_energy_import, // $22
        electrical.daily_energy || energy.daily_energy_import, // $23
        
        // System
        health.data_collection_count,                       // $24
        device_id                                          // $25
      ];
      
      const result = await pool.query(updateQuery, values);
      
      if (result.rowCount === 0) {
        console.log(`⚠️ No rows updated for device ${device_id}, device might not exist in devices_data`);
      } else {
        console.log(`✅ Successfully updated devices_data for ${device_id}`);
        const powerKW = electrical.active_power ? (electrical.active_power / 1000).toFixed(1) : 'N/A';
        const voltage = electrical.voltage ? electrical.voltage.toFixed(1) : 'N/A';
        const current = electrical.current_amperage ? electrical.current_amperage.toFixed(1) : 'N/A';
        console.log(`📊 Power: ${powerKW}kW | Voltage: ${voltage}V | Current: ${current}A`);
      }
      
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

  private async sendConfigToApprovedDevice(device_id: string) {
    try {
      console.log(`📤 Sending config to approved device: ${device_id}`);
      
      // Get device details from devices_prop
      const deviceQuery = `
        SELECT 
          dp.*,
          f.faculty_name,
          f.faculty_code
        FROM devices_prop dp
        LEFT JOIN faculties f ON dp.faculty_id = f.id
        WHERE dp.device_id = $1
      `;
      
      const result = await pool.query(deviceQuery, [device_id]);
      
      if (result.rows.length === 0) {
        console.error(`❌ Device ${device_id} not found in devices_prop`);
        return;
      }
      
      const device = result.rows[0];
      
      // Create config message
      const configMessage = {
        device_id: device.device_id,
        device_name: device.device_name || device.device_id,
        faculty: device.faculty_code || 'general',
        faculty_name: device.faculty_name || 'ทั่วไป',
        location: {
          building: device.building || 'N/A',
          floor: device.floor || 'N/A',
          room: device.room || 'N/A'
        },
        power_limit: device.power_limit || 3000,
        data_interval: 15,
        approved: true,
        config_sent_at: new Date().toISOString(),
        message: "Device already approved - Configuration sent automatically"
      };
      
      // Determine faculty for topic
      let faculty = device.faculty_code;
      
      // If no faculty_code, try to determine from device_id pattern
      if (!faculty) {
        if (device_id.includes('ENGR') || device_id.includes('ENG')) {
          faculty = 'engineering';
        } else if (device_id.includes('MED')) {
          faculty = 'medicine';
        } else if (device_id.includes('SCI')) {
          faculty = 'science';
        } else if (device_id.includes('BUS')) {
          faculty = 'business';
        } else {
          faculty = 'general';
        }
        console.log(`🔍 Determined faculty from device_id: ${faculty}`);
      }
      
      const configTopic = `devices/${faculty}/${device_id}/config`;
      
      // Send config via MQTT
      await this.publish(configTopic, JSON.stringify(configMessage, null, 2));
      
      console.log(`✅ Config sent to ${device_id} via topic: ${configTopic}`);
      
    } catch (error) {
      console.error(`❌ Error sending config to ${device_id}:`, error);
    }
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
