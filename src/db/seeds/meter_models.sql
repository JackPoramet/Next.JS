-- ================================
-- SEED DATA: METER MODELS
-- ================================
-- ข้อมูลตัวอย่างสำหรับ meter_prop (แยกระหว่าง 1 เฟส และ 3 เฟส)
-- เพื่อใช้ในการทดสอบระบบ

INSERT INTO meter_prop (meter_model_id, model_name, manufacturer, meter_type, power_phase, rated_voltage, rated_current, rated_power, accuracy_class, frequency) VALUES
-- 1-Phase Meters (ระบบไฟฟ้า 1 เฟส)
('SM-100-1P', 'SmartMeter 100 (1-Phase)', 'PowerTech', 'digital', 'single', 230.00, 60.00, 13800.00, '1.0', 50.00),
('AM-50-1P', 'AnalogMeter 50 (1-Phase)', 'MetricPower', 'analog', 'single', 230.00, 40.00, 9200.00, '2.0', 50.00),
('DM-200-1P', 'DigitalMax 200 (1-Phase)', 'Schneider', 'digital', 'single', 230.00, 80.00, 18400.00, '0.5S', 50.00),

-- 3-Phase Meters (ระบบไฟฟ้า 3 เฟส)
('SM-300-3P', 'SmartMeter 300 (3-Phase)', 'PowerTech', 'digital', 'three', 400.00, 100.00, 69300.00, '0.5S', 50.00),
('DM-500-3P', 'DigitalMax 500 (3-Phase)', 'Schneider', 'digital', 'three', 400.00, 150.00, 103900.00, '0.2S', 50.00),
('IM-100-3P', 'IndustrialMeter 100 (3-Phase)', 'ABB', 'digital', 'three', 400.00, 80.00, 55400.00, '0.5S', 50.00);
