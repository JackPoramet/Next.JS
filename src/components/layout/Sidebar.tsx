interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  userEmail: string;
  userRole: string;
  onLogout: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeMenu, 
  onMenuClick, 
  userEmail, 
  userRole, 
  onLogout 
}: SidebarProps) {
  const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
  { id: 'realtime', name: 'Real-time Monitor', icon: '📡' },
  { id: 'energy', name: 'Energy Monitor', icon: '⚡' },
  { id: 'devices', name: 'IoT Devices', icon: '📱' },
  { id: 'users', name: 'Users', icon: '👥' },
  { id: 'project-details', name: 'Project Details', icon: '📄' },
  { id: 'system-check', name: 'System Check', icon: '🔧' },
  { id: 'analytics', name: 'Analytics', icon: '📊' },
  { id: 'reports', name: 'Reports', icon: '📈' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  const handleMenuClick = (menuId: string) => {
    onMenuClick(menuId);
    onClose(); // ปิด sidebar หลังเลือกเมนู
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">เมนูหลัก</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeMenu === item.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {userEmail?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              <p className="text-xs text-gray-500">Role: {userRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
