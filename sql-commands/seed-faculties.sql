-- Active: 1753566386905@@iot666.ddns.net@5432@energy_database
-- Seed Faculties Data
-- สร้างข้อมูลคณะเริ่มต้นพร้อมข้อมูลการติดต่อ

BEGIN;

-- เพิ่มข้อมูลคณะทั้งหมด
INSERT INTO faculties (faculty_code, faculty_name, contact_email, contact_phone)
VALUES 
    ('institution', 'สำนักงานอธิการบดี', 'admin@university.ac.th', '053-943-001'),
    ('engineering', 'คณะวิศวกรรมศาสตร์', 'eng@university.ac.th', '053-943-002'),
    ('liberal_arts', 'คณะศิลปศาสตร์', 'liberal@university.ac.th', '053-943-003'),
    ('business_administration', 'คณะบริหารธุรกิจ', 'business@university.ac.th', '053-943-004'),
    ('architecture', 'คณะสถาปัตยกรรมศาสตร์', 'arch@university.ac.th', '053-943-005'),
    ('industrial_education', 'คณะครุศาสตร์อุตสาหกรรม', 'industrial@university.ac.th', '053-943-006')
ON CONFLICT (faculty_code) DO UPDATE SET
    faculty_name = EXCLUDED.faculty_name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;

-- แสดงข้อมูลคณะที่ได้เพิ่มเข้าไป
SELECT 
    id,
    faculty_code,
    faculty_name,
    contact_email,
    contact_phone,
    created_at
FROM faculties 
ORDER BY faculty_code;
