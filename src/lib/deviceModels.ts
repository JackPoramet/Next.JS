// Device Models - Database Table Interfaces
// รองรับโครงสร้างฐานข้อมูลแบบใหม่ที่แยกเป็น 4 ตาราง

// 1. devices_data - ข้อมูลการวัดค่าล่าสุด
export interface DeviceData {
  id: number;
  device_id: string;
  network_status: string;
  connection_quality: number;
  signal_strength: number;
  voltage: number;
  current_amperage: number;
  power_factor: number;
  frequency: number;
  // ฟิลด์สำหรับระบบไฟฟ้า 3 เฟส
  voltage_phase_b?: number;
  voltage_phase_c?: number;
  current_phase_b?: number;
  current_phase_c?: number;
  power_factor_phase_b?: number;
  power_factor_phase_c?: number;
  active_power_phase_a?: number;
  active_power_phase_b?: number;
  active_power_phase_c?: number;
  // ฟิลด์เดิม
  active_power: number;
  reactive_power: number;
  apparent_power: number;
  device_temperature: number;
  uptime_seconds: number;
  last_data_received: Date;
  data_collection_count: number;
  last_error_code: string;
  last_error_message: string;
  last_error_time: Date;
  error_count_today: number;
  created_at: Date;
  updated_at: Date;
}

// 2. devices_prop - ข้อมูลคุณสมบัติอุปกรณ์
export interface DeviceProp {
  id: number;
  device_id: string;
  device_name: string;
  meter_model_id: string;
  firmware_version: string;
  hardware_revision: string;
  faculty: string;
  building: string;
  floor: string;
  room: string;
  position: string;
  ip_address: string;
  mac_address: string;
  connection_type: string;
  install_date: Date;
  data_collection_interval: number;
  sampling_rate: number;
  responsible_person: string;
  contact_info: string;
  notes: string;
  status: string;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

// 3. meter_prop - ข้อมูลคุณสมบัติของรุ่นมิเตอร์
export interface MeterProp {
  meter_model_id: string;
  model_name: string;
  manufacturer: string;
  meter_type: string;
  power_phase: 'single' | 'three'; // เพิ่มประเภทระบบไฟฟ้า (1 เฟส, 3 เฟส)
  rated_voltage: number;
  rated_current: number;
  rated_power: number;
  accuracy_class: string;
  frequency: number;
  created_at: Date;
  updated_at: Date;
}

// 4. devices_history - ข้อมูลประวัติการวัดพลังงาน
export interface DeviceHistory {
  id: number;
  device_id: string;
  recorded_at: Date;
  voltage: number;
  current_amperage: number;
  power_factor: number;
  frequency: number;
  // ฟิลด์สำหรับระบบไฟฟ้า 3 เฟส
  voltage_phase_b?: number;
  voltage_phase_c?: number;
  current_phase_b?: number;
  current_phase_c?: number;
  power_factor_phase_b?: number;
  power_factor_phase_c?: number;
  active_power_phase_a?: number;
  active_power_phase_b?: number;
  active_power_phase_c?: number;
  // ฟิลด์เดิม
  active_power: number;
  reactive_power: number;
  apparent_power: number;
  total_energy_import: number;
  total_energy_export: number;
  device_temperature: number;
  connection_quality: number;
}

// Combined device info for UI display
export interface DeviceInfo {
  // ข้อมูลพื้นฐาน
  device_id: string;
  device_name: string;
  faculty: string;
  building?: string;
  floor?: string;
  room?: string;
  position?: string;

  // ข้อมูลมิเตอร์
  meter_model_id: string;
  model_name?: string;
  manufacturer?: string;
  meter_type?: string;
  
  // ข้อมูลสถานะล่าสุด
  status: string;
  network_status?: string;
  is_enabled: boolean;
  
  // ข้อมูลการวัดค่าล่าสุด
  voltage?: number;
  current_amperage?: number;
  power_factor?: number;
  frequency?: number;
  active_power?: number;
  device_temperature?: number;
  
  // ข้อมูลเวลา
  last_data_received?: Date;
  created_at: Date;
  updated_at: Date;
}

// สถิติอุปกรณ์สำหรับแสดงผล Dashboard
export interface DevicesStats {
  totalDevices: number;
  activeDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  devicesByFaculty: {[faculty: string]: number};
  devicesByType: {[meterType: string]: number};
}

// Faculty name mappings
export const FACULTY_NAMES = {
  'engineering': 'คณะวิศวกรรมศาสตร์',
  'liberal_arts': 'คณะศิลปศาสตร์',
  'science': 'คณะวิทยาศาสตร์',
  'business_administration': 'คณะบริหารธุรกิจ',
  'architecture': 'คณะสถาปัตยกรรมศาสตร์',
  'industrial_education': 'คณะครุศาสตร์อุตสาหกรรม',
  'information_technology': 'คณะเทคโนโลยีสารสนเทศ'
};

// Meter type name mappings
export const METER_TYPE_NAMES = {
  'digital': 'Digital Smart Meter',
  'analog': 'Analog Meter',
  'advanced': 'Advanced Power Meter',
  'basic': 'Basic Energy Meter'
};

// Device status mappings
export const STATUS_NAMES = {
  'active': 'ใช้งานอยู่',
  'inactive': 'ไม่ได้ใช้งาน',
  'maintenance': 'กำลังซ่อมบำรุง',
  'error': 'เกิดข้อผิดพลาด',
  'online': 'ออนไลน์',
  'offline': 'ออฟไลน์'
};
