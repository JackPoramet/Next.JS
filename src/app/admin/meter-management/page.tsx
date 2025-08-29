'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Manufacturer {
  id: number;
  name: string;
  country?: string;
}

interface PowerSpecification {
  id: number;
  rated_voltage: number;
  rated_current: number;
  rated_power: number;
  power_phase: 'single' | 'three';
  frequency: number;
  accuracy?: string;
}

interface MeterProp {
  meter_id: number;
  model_name: string;
  manufacturer_id: number;
  manufacturer_name: string;
  power_spec_id: number;
  rated_voltage: number;
  rated_current: number;
  rated_power: number;
  power_phase: 'single' | 'three';
  frequency: number;
  accuracy?: string;
  meter_type: 'digital' | 'analog';
  manufacture_date?: string;
  created_at: string;
}

interface MeterFormData {
  model_name: string;
  manufacturer_id: number | '';
  power_spec_id: number | '';
  meter_type: 'digital' | 'analog';
  manufacture_date: string;
  // Power specification data for new specs
  rated_voltage: number | '';
  rated_current: number | '';
  rated_power: number | '';
  power_phase: 'single' | 'three';
  frequency: number | '';
  accuracy: string;
}

export default function MeterManagementPage() {
  const [meters, setMeters] = useState<MeterProp[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [powerSpecs, setPowerSpecs] = useState<PowerSpecification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeter, setEditingMeter] = useState<MeterProp | null>(null);
  const [createNewPowerSpec, setCreateNewPowerSpec] = useState(false);

  const [formData, setFormData] = useState<MeterFormData>({
    model_name: '',
    manufacturer_id: '',
    power_spec_id: '',
    meter_type: 'digital',
    manufacture_date: '',
    rated_voltage: '',
    rated_current: '',
    rated_power: '',
    power_phase: 'single',
    frequency: 50,
    accuracy: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metersRes, manufacturersRes, powerSpecsRes] = await Promise.all([
        fetch('/api/admin/meters'),
        fetch('/api/admin/manufacturers'),
        fetch('/api/admin/power-specifications')
      ]);

      if (metersRes.ok) {
        const metersData = await metersRes.json();
        setMeters(metersData.data || []);
      }

      if (manufacturersRes.ok) {
        const manufacturersData = await manufacturersRes.json();
        setManufacturers(manufacturersData.data || []);
      }

      if (powerSpecsRes.ok) {
        const powerSpecsData = await powerSpecsRes.json();
        setPowerSpecs(powerSpecsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingMeter 
        ? `/api/admin/meters/${editingMeter.meter_id}`
        : '/api/admin/meters';
      
      const method = editingMeter ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createNewPowerSpec
        }),
      });

      if (response.ok) {
        fetchData();
        handleCloseForm();
      } else {
        const error = await response.json();
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving meter:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEdit = (meter: MeterProp) => {
    setEditingMeter(meter);
    setFormData({
      model_name: meter.model_name,
      manufacturer_id: meter.manufacturer_id,
      power_spec_id: meter.power_spec_id,
      meter_type: meter.meter_type,
      manufacture_date: meter.manufacture_date || '',
      rated_voltage: meter.rated_voltage,
      rated_current: meter.rated_current,
      rated_power: meter.rated_power,
      power_phase: meter.power_phase,
      frequency: meter.frequency,
      accuracy: meter.accuracy || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (meterId: number) => {
    if (confirm('คุณต้องการลบมิเตอร์นี้หรือไม่?')) {
      try {
        const response = await fetch(`/api/admin/meters/${meterId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
        } else {
          const error = await response.json();
          alert('เกิดข้อผิดพลาด: ' + error.message);
        }
      } catch (error) {
        console.error('Error deleting meter:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMeter(null);
    setCreateNewPowerSpec(false);
    setFormData({
      model_name: '',
      manufacturer_id: '',
      power_spec_id: '',
      meter_type: 'digital',
      manufacture_date: '',
      rated_voltage: '',
      rated_current: '',
      rated_power: '',
      power_phase: 'single',
      frequency: 50,
      accuracy: ''
    });
  };

  const handleInputChange = (field: keyof MeterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการมิเตอร์</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          เพิ่มมิเตอร์ใหม่
        </Button>
      </div>

      {/* Meters List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                รุ่น
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ผู้ผลิต
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สเปคไฟฟ้า
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                วันที่สร้าง
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meters.map((meter) => (
              <tr key={meter.meter_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{meter.model_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{meter.manufacturer_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {meter.rated_voltage}V / {meter.rated_current}A / {meter.rated_power}W
                    <br />
                    <Badge variant={meter.power_phase === 'three' ? 'default' : 'secondary'}>
                      {meter.power_phase === 'three' ? '3 เฟส' : '1 เฟส'}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={meter.meter_type === 'digital' ? 'default' : 'secondary'}>
                    {meter.meter_type === 'digital' ? 'ดิจิทัล' : 'อะนาล็อก'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(meter.created_at).toLocaleDateString('th-TH')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleEdit(meter)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    แก้ไข
                  </Button>
                  <Button
                    onClick={() => handleDelete(meter.meter_id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    ลบ
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่มีข้อมูลมิเตอร์</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingMeter ? 'แก้ไขมิเตอร์' : 'เพิ่มมิเตอร์ใหม่'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รุ่นมิเตอร์
                </label>
                <input
                  type="text"
                  value={formData.model_name}
                  onChange={(e) => handleInputChange('model_name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ผู้ผลิต
                </label>
                <select
                  value={formData.manufacturer_id || ''}
                  onChange={(e) => handleInputChange('manufacturer_id', e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">เลือกผู้ผลิต</option>
                  {manufacturers.map((mfg) => (
                    <option key={mfg.id} value={mfg.id}>
                      {mfg.name} {mfg.country && `(${mfg.country})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทมิเตอร์
                </label>
                <select
                  value={formData.meter_type}
                  onChange={(e) => handleInputChange('meter_type', e.target.value as 'digital' | 'analog')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="digital">ดิจิทัล</option>
                  <option value="analog">อะนาล็อก</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่ผลิต
                </label>
                <input
                  type="date"
                  value={formData.manufacture_date}
                  onChange={(e) => handleInputChange('manufacture_date', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              {/* Power Specification Selection */}
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    สเปคไฟฟ้า
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={createNewPowerSpec}
                      onChange={(e) => setCreateNewPowerSpec(e.target.checked)}
                      className="mr-2"
                    />
                    สร้างสเปคใหม่
                  </label>
                </div>

                {!createNewPowerSpec ? (
                  <select
                    value={formData.power_spec_id || ''}
                    onChange={(e) => handleInputChange('power_spec_id', e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">เลือกสเปคไฟฟ้า</option>
                    {powerSpecs.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.rated_voltage}V / {spec.rated_current}A / {spec.rated_power}W ({spec.power_phase === 'three' ? '3 เฟส' : '1 เฟส'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-3 p-4 border border-gray-200 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">แรงดัน (V)</label>
                        <input
                          type="number"
                          value={formData.rated_voltage || ''}
                          onChange={(e) => handleInputChange('rated_voltage', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">กระแส (A)</label>
                        <input
                          type="number"
                          value={formData.rated_current || ''}
                          onChange={(e) => handleInputChange('rated_current', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">กำลัง (W)</label>
                        <input
                          type="number"
                          value={formData.rated_power || ''}
                          onChange={(e) => handleInputChange('rated_power', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">เฟส</label>
                        <select
                          value={formData.power_phase}
                          onChange={(e) => handleInputChange('power_phase', e.target.value as 'single' | 'three')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="single">1 เฟส</option>
                          <option value="three">3 เฟส</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">ความถี่ (Hz)</label>
                        <input
                          type="number"
                          value={formData.frequency || ''}
                          onChange={(e) => handleInputChange('frequency', e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">ความแม่นยำ</label>
                        <input
                          type="text"
                          value={formData.accuracy}
                          onChange={(e) => handleInputChange('accuracy', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          placeholder="เช่น ±1%"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingMeter ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มมิเตอร์'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
