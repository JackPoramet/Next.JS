-- ================================
-- MIGRATION: UPDATE DEVICEMODELS.TS FOR 3-PHASE SUPPORT
-- ================================

/*
การอัปเดต TypeScript Interface สำหรับไฟฟ้า 3 เฟส

เพิ่มการรองรับสำหรับไฟฟ้า 3 เฟสในไฟล์ deviceModels.ts โดยเพิ่มฟิลด์ดังนี้:

1. เพิ่มประเภทของระบบไฟฟ้า (1 เฟส หรือ 3 เฟส) ใน MeterProp
2. เพิ่มฟิลด์สำหรับแรงดันไฟฟ้า, กระแสไฟฟ้า และตัวประกอบกำลังสำหรับแต่ละเฟส
3. เพิ่มฟิลด์สำหรับกำลังไฟฟ้าในแต่ละเฟส

// ตัวอย่างการแก้ไข MeterProp

export interface MeterProp {
  meter_model_id: string;
  model_name: string;
  manufacturer: string;
  meter_type: string;
  power_phase: 'single' | 'three'; // เพิ่มประเภทระบบไฟฟ้า
  rated_voltage: number;
  rated_current: number;
  rated_power: number;
  accuracy_class: string;
  frequency: number;
  created_at: Date;
  updated_at: Date;
}

// ตัวอย่างการแก้ไข DeviceData

export interface DeviceData {
  id: number;
  device_id: string;
  network_status: string;
  connection_quality: number;
  signal_strength: number;
  
  // ข้อมูลทางไฟฟ้า
  voltage: number; // เฟส A หรือค่าเฉลี่ย
  current_amperage: number; // เฟส A หรือค่าเฉลี่ย
  power_factor: number; // เฟส A หรือค่าเฉลี่ย
  frequency: number;
  
  // ข้อมูลเฉพาะระบบ 3 เฟส
  voltage_phase_b?: number;
  voltage_phase_c?: number;
  current_phase_b?: number;
  current_phase_c?: number;
  power_factor_phase_b?: number;
  power_factor_phase_c?: number;
  
  // ข้อมูลกำลังไฟฟ้า
  active_power: number; // รวมทั้ง 3 เฟส
  reactive_power: number; // รวมทั้ง 3 เฟส
  apparent_power: number; // รวมทั้ง 3 เฟส
  
  // ข้อมูลกำลังไฟฟ้าแยกเฟส
  active_power_phase_a?: number;
  active_power_phase_b?: number;
  active_power_phase_c?: number;
  
  // ข้อมูลอื่นๆ คงเดิม
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

// ตัวอย่างการแก้ไข DeviceHistory
// ทำการเพิ่มฟิลด์เช่นเดียวกับ DeviceData
*/
