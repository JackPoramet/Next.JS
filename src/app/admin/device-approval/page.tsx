'use client';

import React, { useState, useEffect } from 'react';

interface NewDeviceNotification {
  device_id: string;
  device_name?: string;
  device_type?: string;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  connection_type?: string;
  approval_status_id?: number;
  mqtt_data?: unknown;
  discovered_at?: string;
  last_seen_at?: string;
  discovery_source?: string;
}

interface Faculty {
  id: number;
  faculty_code: string;
  faculty_name: string;
  contact_email: string;
  contact_phone: string;
}

interface ResponsiblePerson {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  faculty_id: number;
  faculty_name: string;
  faculty_code: string;
  is_active: boolean;
}

interface MeterOption {
  meter_id: number;
  model_name: string;
  manufacturer_name: string;
  rated_voltage: number;
  rated_current: number;
  rated_power: number;
  power_phase: 'single' | 'three';
  frequency: number;
  accuracy?: string;
  meter_type: 'digital' | 'analog';
}

interface DeviceFormData {
  // Meter Information - Changed to meter selection
  meter_id: number | '';
  
  // Location Information  
  faculty_name: string;
  building: string;
  floor: string;
  room: string;
  
  // Administrative Information
  responsible_person_id: string;
  admin_notes: string;
}

export default function DeviceApprovalPage() {
  const [notifications, setNotifications] = useState<NewDeviceNotification[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<NewDeviceNotification | null>(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<ResponsiblePerson[]>([]);
  const [availableMeters, setAvailableMeters] = useState<MeterOption[]>([]);
  
  const [formData, setFormData] = useState<DeviceFormData>({
    meter_id: '',
    faculty_name: '',
    building: '',
    floor: '',
    room: '',
    responsible_person_id: '',
    admin_notes: ''
  });

  // Fetch pending devices from database
  const fetchPendingDevices = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch('/api/admin/pending-devices');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.devices || []);
      } else {
        console.error('Failed to fetch pending devices:', data.message);
      }
    } catch (error) {
      console.error('Error fetching pending devices:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch faculties data
  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/admin/faculties');
      const data = await response.json();
      
      if (data.success) {
        setFaculties(data.data || []); // เปลี่ยนจาก data.faculties เป็น data.data
      } else {
        console.error('Failed to fetch faculties:', data.message);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  // Fetch responsible persons data
  const fetchResponsiblePersons = async () => {
    try {
      const response = await fetch('/api/admin/responsible-persons?is_active=true');
      const data = await response.json();
      
      if (data.success) {
        setResponsiblePersons(data.data || []);
      } else {
        console.error('Failed to fetch responsible persons:', data.message);
      }
    } catch (error) {
      console.error('Error fetching responsible persons:', error);
    }
  };

  // Fetch available meters data
  const fetchAvailableMeters = async () => {
    try {
      const response = await fetch('/api/admin/meters');
      const data = await response.json();
      
      if (data.success) {
        setAvailableMeters(data.data || []);
      } else {
        console.error('Failed to fetch meters:', data.message);
      }
    } catch (error) {
      console.error('Error fetching meters:', error);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchPendingDevices();
    fetchFaculties();
    fetchResponsiblePersons();
    fetchAvailableMeters();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  // URL parameter handling for direct device selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('deviceId');
    
    if (deviceId && notifications.length > 0) {
      const device = notifications.find(n => n.device_id === deviceId);
      if (device) {
        handleDeviceSelect(device);
      }
    }
  }, [notifications]);

  const handleDeviceSelect = (notification: NewDeviceNotification) => {
    setSelectedDevice(notification);
    setShowApprovalForm(false);
    
    // Pre-fill form with default values
    setFormData({
      meter_id: '',
      faculty_name: '',
      building: '',
      floor: '',
      room: '',
      responsible_person_id: '',
      admin_notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rated_voltage' || name === 'rated_current' || name === 'rated_power' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/approve-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: selectedDevice.device_id,
          device_name: selectedDevice.device_name || `Device ${selectedDevice.device_id}`,
          device_prop: selectedDevice,
          ...formData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('อุปกรณ์ได้รับการอนุมัติเรียบร้อยแล้ว');
        // Remove approved device from list
        setNotifications(prev => prev.filter(n => n.device_id !== selectedDevice.device_id));
        setSelectedDevice(null);
        setShowApprovalForm(false);
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (error) {
      console.error('Error approving device:', error);
      alert('เกิดข้อผิดพลาดในการอนุมัติอุปกรณ์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          การอนุมัติอุปกรณ์ใหม่
        </h1>
        <p className="text-gray-600">
          จัดการและอนุมัติอุปกรณ์ IoT ที่ตรวจพบใหม่ในระบบ (ข้อมูลจากฐานข้อมูล)
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            <span className="w-2 h-2 rounded-full mr-1 bg-blue-400"></span>
            การเชื่อมต่อฐานข้อมูล
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                อุปกรณ์ที่รอการอนุมัติ ({notifications.length})
              </h2>
              {fetchLoading && (
                <div className="mt-2 text-sm text-blue-600">กำลังโหลดข้อมูลจากฐานข้อมูล...</div>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {fetchLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  ไม่มีอุปกรณ์ที่รอการอนุมัติ
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.device_id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedDevice?.device_id === notification.device_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handleDeviceSelect(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm5 2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.device_name || notification.device_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          ประเภท: {notification.device_type || 'ไม่ระบุ'}
                        </p>
                        <p className="text-sm text-gray-500">
                          IP: {notification.ip_address || 'ไม่ทราบ'}
                        </p>
                        <p className="text-xs text-gray-400">
                          ตรวจพบเมื่อ: {notification.discovered_at ? new Date(notification.discovered_at).toLocaleString('th-TH') : 'ไม่ทราบ'}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          รอดำเนินการ
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Approval Form */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDevice ? `อนุมัติอุปกรณ์: ${selectedDevice.device_name || selectedDevice.device_id}` : 'เลือกอุปกรณ์เพื่อดำเนินการ'}
              </h2>
            </div>

            {!selectedDevice ? (
              <div className="p-6 text-center text-gray-500">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p>กรุณาเลือกอุปกรณ์จากรายการด้านซ้าย</p>
              </div>
            ) : !showApprovalForm ? (
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">ข้อมูลอุปกรณ์ที่ตรวจพบ</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-gray-500">Device ID</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.device_id}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">ชื่ออุปกรณ์</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.device_name || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">ประเภท</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.device_type || 'ไม่ระบุ'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">IP Address</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.ip_address || 'ไม่ทราบ'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">MAC Address</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.mac_address || 'ไม่ทราบ'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Firmware</dt>
                      <dd className="text-sm text-gray-900">{selectedDevice.firmware_version || 'ไม่ทราบ'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowApprovalForm(true)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    อนุมัติอุปกรณ์
                  </button>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApprovalSubmit} className="p-6 space-y-6">
                {/* Meter Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลมิเตอร์</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        เลือกมิเตอร์
                      </label>
                      <select
                        name="meter_id"
                        value={formData.meter_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">เลือกมิเตอร์</option>
                        {availableMeters.map((meter) => (
                          <option key={meter.meter_id} value={meter.meter_id}>
                            {meter.model_name} - {meter.manufacturer_name} 
                            ({meter.rated_voltage}V / {meter.rated_current}A / {meter.rated_power}W / {meter.power_phase === 'three' ? '3 เฟส' : '1 เฟส'})
                          </option>
                        ))}
                      </select>
                      {formData.meter_id && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>รายละเอียดมิเตอร์:</strong>
                            {(() => {
                              const selectedMeter = availableMeters.find(m => m.meter_id === parseInt(formData.meter_id.toString()));
                              return selectedMeter ? (
                                <span>
                                  <br />รุ่น: {selectedMeter.model_name}
                                  <br />ผู้ผลิต: {selectedMeter.manufacturer_name}
                                  <br />สเปค: {selectedMeter.rated_voltage}V / {selectedMeter.rated_current}A / {selectedMeter.rated_power}W
                                  <br />ระบบไฟฟ้า: {selectedMeter.power_phase === 'three' ? '3 เฟส' : '1 เฟส'}
                                  <br />ความถี่: {selectedMeter.frequency}Hz
                                  {selectedMeter.accuracy && <><br />ความแม่นยำ: {selectedMeter.accuracy}</>}
                                </span>
                              ) : null;
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลตำแหน่ง</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คณะ
                      </label>
                      <select
                        name="faculty_name"
                        value={formData.faculty_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- เลือกคณะ --</option>
                        {faculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.faculty_name}>
                            {faculty.faculty_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        อาคาร
                      </label>
                      <input
                        type="text"
                        name="building"
                        value={formData.building}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เช่น อาคาร 1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชั้น
                      </label>
                      <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เช่น 2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ห้อง
                      </label>
                      <input
                        type="text"
                        name="room"
                        value={formData.room}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="เช่น 201"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Administrative Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลผู้รับผิดชอบ</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ผู้รับผิดชอบ
                      </label>
                      <select
                        name="responsible_person_id"
                        value={formData.responsible_person_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">เลือกผู้รับผิดชอบ</option>
                        {responsiblePersons.map((person) => (
                          <option key={person.id} value={person.id.toString()}>
                            {person.name} - {person.position} ({person.faculty_name})
                          </option>
                        ))}
                      </select>
                      {formData.responsible_person_id && (
                        <div className="mt-2 text-xs text-gray-600">
                          {(() => {
                            const selectedPerson = responsiblePersons.find(p => p.id.toString() === formData.responsible_person_id);
                            return selectedPerson ? (
                              <div>
                                <p>อีเมล: {selectedPerson.email}</p>
                                <p>โทรศัพท์: {selectedPerson.phone}</p>
                                <p>ภาควิชา: {selectedPerson.department}</p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมายเหตุเพิ่มเติม
                    </label>
                    <textarea
                      name="admin_notes"
                      value={formData.admin_notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="หมายเหตุหรือข้อมูลเพิ่มเติม"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'กำลังดำเนินการ...' : 'อนุมัติอุปกรณ์'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApprovalForm(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🔄 ขั้นตอนการทำงานของระบบ (Database-Driven)
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>1. MQTT /prop →</strong> <code>devices_pending</code> table</div>
            <div><strong>2. Admin approval →</strong> <code>devices_prop</code> + <code>faculties</code> + <code>buildings</code> + ...</div>
            <div><strong>3. Device config ←</strong> MQTT /config response</div>
            <div><strong>4. MQTT /data →</strong> <code>devices_data</code> table</div>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded">
          <p className="text-yellow-800 text-sm">
            <strong>💡 หลักการใหม่:</strong> MQTT /prop → <code>devices_pending</code> table → แสดงในหน้าอนุมัติ → Admin กรอกข้อมูลครบ → Transaction ย้ายข้อมูลไปตาราง normalized ต่างๆ → ส่ง /config กลับ
          </p>
        </div>
      </div>
    </div>
  );
}
