import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  MapPin,
  Calendar,
  Bell,
  User,
  HelpCircle,
  Menu,
  X,
  Settings,
  Eye,
} from 'lucide-react';
import SettingsModal from './SettingsModal';
import AccessibilityModal from './AccessibilityModal';
import { getUnreadCount } from '../../utils/notificationUtils';
import { initializeAccessibility } from '../../utils/accessibilityUtils';

const navigation = [
  { name: '홈', href: '/', icon: Home },
  { name: '지도', href: '/map', icon: MapPin },
  { name: '내 예약', href: '/my/reservations', icon: Calendar },
  { name: '알림', href: '/my/alerts', icon: Bell },
  { name: '프로필', href: '/profile', icon: User },
  { name: '도움말', href: '/help', icon: HelpCircle },
];

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // 접근성 설정 초기화
    initializeAccessibility();
    
    const updateUnreadCount = () => {
      setUnreadCount(getUnreadCount());
    };
    
    // 초기 로드
    updateUnreadCount();
    
    // 1초마다 확인 (실시간 업데이트)
    const interval = setInterval(updateUnreadCount, 1000);
    
    // 페이지 포커스 시에도 확인
    const handleFocus = () => updateUnreadCount();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <h1 className="text-xl font-bold text-brand-navy">품앗이 - Pumasi</h1>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8">
              <ul role="list" className="flex flex-1 flex-col gap-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold ${
                          isActive
                            ? 'hover:bg-gray-50'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        style={isActive ? {
                          backgroundColor: '#CBDCEB',
                          color: '#133E87'
                        } : {}}
                        onMouseEnter={(e) => {
                          if (!isActive) e.target.style.color = '#133E87'
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.target.style.color = '#374151'
                        }}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <div className="relative">
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name === '알림' && unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                
                {/* 모바일 전용 접근성 설정 */}
                <li className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setAccessibilityModalOpen(true);
                      setSidebarOpen(false);
                    }}
                    className="group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-700 hover:bg-gray-50 w-full transition-colors"
                    onMouseEnter={(e) => e.target.style.color = '#133E87'}
                    onMouseLeave={(e) => e.target.style.color = '#374151'}
                  >
                    <Eye className="h-6 w-6 shrink-0" />
                    접근성 설정
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:static lg:overflow-y-visible">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between xl:grid xl:grid-cols-12 lg:gap-8">
            <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/">
                  <h1 className="text-2xl font-bold text-brand-navy">품앗이 - Pumasi</h1>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
              <button
                type="button"
                className="-mx-2 -my-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:items-center lg:justify-center xl:col-span-8">
              <nav className="flex space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      style={isActive ? {
                        borderBottomColor: '#133E87',
                        color: '#133E87'
                      } : {}}
                    >
                      <div className="relative mr-2">
                        <item.icon className="h-5 w-5" />
                        {item.name === '알림' && unreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side */}
            <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-2 space-x-2">
              <button
                onClick={() => setAccessibilityModalOpen(true)}
                className="flex-shrink-0 rounded-full bg-white p-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                style={{'--tw-ring-color': '#133E87'} as React.CSSProperties}
                onMouseEnter={(e) => e.target.style.color = '#133E87'}
                onMouseLeave={(e) => e.target.style.color = '#9CA3AF'}
                title="접근성 설정"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSettingsModalOpen(true)}
                className="flex-shrink-0 rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{'--tw-ring-color': '#133E87'} as React.CSSProperties}
                title="설정"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      {/* Accessibility Modal */}
      <AccessibilityModal 
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <nav className="flex justify-around">
          {navigation.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                  isActive
                    ? ''
                    : 'text-gray-500'
                }`}
                style={isActive ? {
                  color: '#133E87',
                  backgroundColor: '#CBDCEB'
                } : {}}
              >
                <div className="relative">
                  <item.icon className="h-6 w-6" />
                  {item.name === '알림' && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}