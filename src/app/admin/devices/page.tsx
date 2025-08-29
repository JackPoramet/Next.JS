'use client';

import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// StatusBadge component moved outside
const StatusBadge = ({ status, networkStatus }: { status: string; networkStatus: string }) => {
  const getStatusColor = () => {
    if (networkStatus === 'offline') return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    if (networkStatus === 'offline') return <XCircleIcon className="w-4 h-4" />;
    
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'maintenance':
        return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'error':
        return <XCircleIcon className="w-4 h-4" />;
      case 'inactive':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    if (networkStatus === 'offline') return 'Offline';
    
    switch (status) {
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      case 'error':
        return 'Error';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-1">{getStatusText()}</span>
    </span>
  );
};

interface Device {
  device_id: string;
  device_name: string;
  device_type: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  faculty_name: string;
  building: string;
  floor: string;
  room: string;
  meter_model_name: string;
  manufacturer_name: string;
  ip_address: string;
  mac_address: string;
  firmware_version: string;
  network_status: 'online' | 'offline';
  last_data_received: string;
  created_at: string;
  is_enabled: boolean;
}

interface EditFormData {
  device_name: string;
  device_type: string;
  status: string;
  faculty_name: string;
  building: string;
  floor: string;
  room: string;
  ip_address: string;
  mac_address: string;
  firmware_version: string;
  is_enabled: boolean;
}

export default function DevicesManagementPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    device_name: '',
    device_type: '',
    status: 'active',
    faculty_name: '',
    building: '',
    floor: '',
    room: '',
    ip_address: '',
    mac_address: '',
    firmware_version: '',
    is_enabled: true
  });
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);

  // Fetch devices
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/devices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      
      const data = await response.json();
      setDevices(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Handle Edit
  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setEditFormData({
      device_name: device.device_name,
      device_type: device.device_type,
      status: device.status,
      faculty_name: device.faculty_name,
      building: device.building,
      floor: device.floor,
      room: device.room,
      ip_address: device.ip_address || '',
      mac_address: device.mac_address || '',
      firmware_version: device.firmware_version || '',
      is_enabled: device.is_enabled
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingDevice) return;

    try {
      const response = await fetch(`/api/admin/devices/${editingDevice.device_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update device');
      }

      await fetchDevices(); // Refresh the list
      setEditModalOpen(false);
      setEditingDevice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
    }
  };

  // Handle Delete
  const handleDelete = (device: Device) => {
    setDeletingDevice(device);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDevice) return;

    try {
      setDeleteLoading(true);
      setError(null); // Clear previous errors
      
      console.log('🗑️ Attempting to delete device:', {
        device_id: deletingDevice.device_id,
        device_name: deletingDevice.device_name
      });
      
      const deleteUrl = `/api/admin/devices/${encodeURIComponent(deletingDevice.device_id)}`;
      console.log('📡 DELETE URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseErr) {
          console.error('❌ Failed to parse error response:', parseErr);
          errorData = { 
            message: `HTTP ${response.status}: ${response.statusText}`,
            details: await response.text().catch(() => 'No response body')
          };
        }
        
        console.error('❌ Delete failed with error data:', errorData);
        throw new Error(errorData.message || `Failed to delete device (${response.status})`);
      }

      const result = await response.json();
      console.log('✅ Delete response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Delete operation failed');
      }

      // Success - refresh the list and close modal
      console.log('🔄 Refreshing device list...');
      await fetchDevices();
      setDeleteModalOpen(false);
      setDeletingDevice(null);
      
      console.log('🎉 Device deleted successfully:', result.message);
      
    } catch (err) {
      console.error('💥 Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete device';
      setError(`การลบอุปกรณ์ล้มเหลว: ${errorMessage}`);
      // Don't close modal on error so user can see the error and try again
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle View Details
  const handleView = (device: Device) => {
    setViewingDevice(device);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IoT Devices Management</h1>
          <p className="text-gray-600">จัดการอุปกรณ์ IoT ที่ได้รับการอนุมัติแล้ว</p>
        </div>
        <button
          onClick={fetchDevices}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 รีเฟรช
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อุปกรณ์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ตำแหน่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    มิเตอร์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ข้อมูลล่าสุด
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.device_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{device.device_name}</div>
                          <div className="text-sm text-gray-500">{device.device_id}</div>
                          <div className="text-xs text-gray-400">{device.device_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={device.status} networkStatus={device.network_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{device.faculty_name}</div>
                      <div className="text-gray-500">{device.building} ชั้น {device.floor} ห้อง {device.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{device.meter_model_name}</div>
                      <div className="text-gray-500">{device.manufacturer_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.last_data_received ? new Date(device.last_data_received).toLocaleString('th-TH') : 'ไม่มีข้อมูล'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleView(device)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(device)}
                          className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="แก้ไข"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(device)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="ลบ"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {devices.length === 0 && !loading && (
            <div className="text-center py-12">
              <WifiIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีอุปกรณ์</h3>
              <p className="mt-1 text-sm text-gray-500">ยังไม่มีอุปกรณ์ที่ได้รับการอนุมัติ</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">แก้ไขอุปกรณ์: {editingDevice?.device_id}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่ออุปกรณ์</label>
                  <input
                    type="text"
                    value={editFormData.device_name}
                    onChange={(e) => setEditFormData({ ...editFormData, device_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                  <input
                    type="text"
                    value={editFormData.device_type}
                    onChange={(e) => setEditFormData({ ...editFormData, device_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                    <option value="maintenance">บำรุงรักษา</option>
                    <option value="error">ข้อผิดพลาด</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เปิดใช้งาน</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editFormData.is_enabled}
                      onChange={(e) => setEditFormData({ ...editFormData, is_enabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">เปิดใช้งาน</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">คณะ</label>
                  <input
                    type="text"
                    value={editFormData.faculty_name}
                    onChange={(e) => setEditFormData({ ...editFormData, faculty_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อาคาร</label>
                  <input
                    type="text"
                    value={editFormData.building}
                    onChange={(e) => setEditFormData({ ...editFormData, building: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชั้น</label>
                  <input
                    type="text"
                    value={editFormData.floor}
                    onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={editFormData.room}
                    onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={editFormData.ip_address}
                    onChange={(e) => setEditFormData({ ...editFormData, ip_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                  <input
                    type="text"
                    value={editFormData.mac_address}
                    onChange={(e) => setEditFormData({ ...editFormData, mac_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firmware Version</label>
                  <input
                    type="text"
                    value={editFormData.firmware_version}
                    onChange={(e) => setEditFormData({ ...editFormData, firmware_version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <TrashIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">ยืนยันการลบอุปกรณ์</h3>
              <p className="text-sm text-gray-500 mt-2">
                คุณแน่ใจหรือไม่ที่จะลบอุปกรณ์ <strong>{deletingDevice?.device_name}</strong> ({deletingDevice?.device_id})?
              </p>
              <p className="text-xs text-red-600 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeletingDevice(null);
                  }}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังลบ...
                    </>
                  ) : (
                    'ลบอุปกรณ์'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && viewingDevice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">รายละเอียดอุปกรณ์</h3>
                <StatusBadge status={viewingDevice.status} networkStatus={viewingDevice.network_status} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">ข้อมูลพื้นฐาน</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Device ID:</span> {viewingDevice.device_id}</p>
                      <p><span className="font-medium">ชื่อ:</span> {viewingDevice.device_name}</p>
                      <p><span className="font-medium">ประเภท:</span> {viewingDevice.device_type}</p>
                      <p><span className="font-medium">สถานะ:</span> {viewingDevice.status}</p>
                      <p><span className="font-medium">เปิดใช้งาน:</span> {viewingDevice.is_enabled ? 'ใช่' : 'ไม่'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">ตำแหน่งที่ตั้ง</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">คณะ:</span> {viewingDevice.faculty_name}</p>
                      <p><span className="font-medium">อาคาร:</span> {viewingDevice.building}</p>
                      <p><span className="font-medium">ชั้น:</span> {viewingDevice.floor}</p>
                      <p><span className="font-medium">ห้อง:</span> {viewingDevice.room}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">ข้อมูลเทคนิค</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">IP Address:</span> {viewingDevice.ip_address || 'ไม่ระบุ'}</p>
                      <p><span className="font-medium">MAC Address:</span> {viewingDevice.mac_address || 'ไม่ระบุ'}</p>
                      <p><span className="font-medium">Firmware:</span> {viewingDevice.firmware_version || 'ไม่ระบุ'}</p>
                      <p><span className="font-medium">Network Status:</span> {viewingDevice.network_status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">ข้อมูลมิเตอร์</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">รุ่น:</span> {viewingDevice.meter_model_name}</p>
                      <p><span className="font-medium">ผู้ผลิต:</span> {viewingDevice.manufacturer_name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">ข้อมูลระบบ</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">วันที่สร้าง:</span> {new Date(viewingDevice.created_at).toLocaleString('th-TH')}</p>
                      <p><span className="font-medium">ข้อมูลล่าสุด:</span> {viewingDevice.last_data_received ? new Date(viewingDevice.last_data_received).toLocaleString('th-TH') : 'ไม่มีข้อมูล'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
