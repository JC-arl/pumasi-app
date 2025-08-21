import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  Calendar,
  Wrench,
  Users,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
  Shield,
  ArrowUpDown,
  Monitor,
} from 'lucide-react';
import RegionSelector from './RegionSelector';

const navigation = [
  { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: '장비·자산', href: '/admin/assets', icon: Package },
  { name: '예약·배정', href: '/admin/reservations', icon: Calendar },
  { name: '출고·반납', href: '/admin/checkout', icon: ArrowUpDown },
  { name: '임대 중 관리', href: '/admin/monitoring', icon: Monitor },
  { name: '임대사업소', href: '/admin/offices', icon: Building2 },
  { name: '정비·점검', href: '/admin/maintenance', icon: Wrench },
  { name: '사용자 관리', href: '/admin/users', icon: Users },
  { name: '통계·분석', href: '/admin/reports', icon: BarChart3 },
  { name: '시스템 설정', href: '/admin/settings', icon: Settings },
  { name: '작업 로그', href: '/admin/logs', icon: FileText },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                  style={{backgroundColor: '#133E87'}}
                >
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">품앗이</h1>
                  <p className="text-xs text-gray-500">관리 시스템</p>
                </div>
              </div>
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
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-700 hover:text-white hover:bg-blue-600'
                        }`}
                        style={{
                          backgroundColor: isActive ? '#133E87' : undefined
                        }}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{backgroundColor: '#133E87'}}
              >
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">품앗이</h1>
                <p className="text-xs text-gray-500">관리 시스템</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-700 hover:text-white hover:bg-blue-600'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#133E87' : undefined
                      }}
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <RegionSelector 
                selectedRegion={selectedRegion} 
                onRegionChange={setSelectedRegion} 
              />
              <div className="text-sm text-gray-500">
                관리자 페이지
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}