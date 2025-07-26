'use client';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userEmail: string;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName, 
  userEmail, 
  isLoading = false 
}: ConfirmDeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - เบลอพร้อมสีขาวโปร่งใสเล็กน้อย */}
      <div 
        className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-red-200">
        <div className="px-4 sm:px-6 py-4 border-b border-red-100">
          <h3 className="text-base sm:text-lg font-semibold text-red-900 flex items-center">
            <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            ⚠️ ยืนยันการลบผู้ใช้
          </h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การดำเนินการนี้<strong className="text-red-600">ไม่สามารถย้อนกลับได้</strong>
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium text-sm">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-red-900">{userName}</p>
                  <p className="text-sm text-red-700">{userEmail}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>คำเตือน:</strong> การลบผู้ใช้จะส่งผลให้:
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                    <li>ผู้ใช้ไม่สามารถเข้าสู่ระบบได้</li>
                    <li>ข้อมูลที่เกี่ยวข้องอาจถูกลบ</li>
                    <li>ประวัติการใช้งานจะหายไป</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-3 text-base font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังลบ...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบผู้ใช้
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
