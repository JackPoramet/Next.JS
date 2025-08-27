'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface ResponsiblePerson {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  faculty_id?: number;
  faculty_name?: string;
  faculty_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: number;
  faculty_name: string;
  faculty_code: string;
}

export default function ResponsiblePersons() {
  const [responsiblePersons, setResponsiblePersons] = useState<ResponsiblePerson[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ResponsiblePerson | null>(null);
  const [filterFaculty, setFilterFaculty] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    faculty_id: '',
    is_active: true
  });

  // Fetch responsible persons
  const fetchResponsiblePersons = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/admin/responsible-persons?';
      const params = new URLSearchParams();
      
      if (filterFaculty) params.append('faculty_id', filterFaculty);
      if (filterActive) params.append('is_active', filterActive);
      
      url += params.toString();
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setResponsiblePersons(data.data);
      }
    } catch (error) {
      console.error('Error fetching responsible persons:', error);
    } finally {
      setLoading(false);
    }
  }, [filterFaculty, filterActive]);

  // Fetch faculties
  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/admin/faculties');
      const data = await response.json();
      
      if (data.success) {
        setFaculties(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  useEffect(() => {
    fetchResponsiblePersons();
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchResponsiblePersons();
  }, [filterFaculty, filterActive]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/admin/responsible-persons';
      const method = editingPerson ? 'PUT' : 'POST';
      
      const payload: Record<string, number | string | boolean | null> = {
        ...formData,
        faculty_id: formData.faculty_id ? parseInt(formData.faculty_id) : null
      };

      if (editingPerson) {
        payload.id = editingPerson.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setShowForm(false);
        setEditingPerson(null);
        resetForm();
        fetchResponsiblePersons();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('คุณต้องการลบผู้รับผิดชอบนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/admin/responsible-persons?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchResponsiblePersons();
      } else {
        alert(data.message || 'เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error deleting responsible person:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  // Handle edit
  const handleEdit = (person: ResponsiblePerson) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      email: person.email,
      phone: person.phone || '',
      department: person.department || '',
      position: person.position || '',
      faculty_id: person.faculty_id?.toString() || '',
      is_active: person.is_active
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      faculty_id: '',
      is_active: true
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผู้รับผิดชอบ</h1>
          <p className="text-gray-600 mt-1">
            จัดการข้อมูลผู้รับผิดชอบสำหรับการอนุมัติอุปกรณ์
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingPerson(null);
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          เพิ่มผู้รับผิดชอบ
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คณะ
            </label>
            <select
              value={filterFaculty}
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id.toString()}>
                  {faculty.faculty_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะ
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="true">ใช้งาน</option>
              <option value="false">ไม่ใช้งาน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingPerson ? 'แก้ไขผู้รับผิดชอบ' : 'เพิ่มผู้รับผิดชอบใหม่'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  แผนก/หน่วยงาน
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำแหน่ง
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  คณะ
                </label>
                <select
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">เลือกคณะ</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id.toString()}>
                      {faculty.faculty_name}
                    </option>
                  ))}
                </select>
              </div>

              {editingPerson && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    ใช้งาน
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPerson(null);
                    resetForm();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingPerson ? 'อัพเดท' : 'เพิ่ม'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    แผนก/ตำแหน่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    คณะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responsiblePersons.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {person.name}
                        </div>
                        {person.phone && (
                          <div className="text-sm text-gray-500">
                            {person.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {person.department && (
                          <div className="text-sm text-gray-900">
                            {person.department}
                          </div>
                        )}
                        {person.position && (
                          <div className="text-sm text-gray-500">
                            {person.position}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {person.faculty_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={person.is_active ? 'success' : 'secondary'}>
                        {person.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(person)}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(person.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {responsiblePersons.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                ไม่พบข้อมูลผู้รับผิดชอบ
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
