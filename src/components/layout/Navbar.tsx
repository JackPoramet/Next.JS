interface NavbarProps {
  userEmail: string;
  onToggleSidebar: () => void;
}

export default function Navbar({ userEmail, onToggleSidebar }: NavbarProps) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">IoT Electric Energy Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">สวัสดี, {userEmail}</span>
            
            {/* Menu Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
