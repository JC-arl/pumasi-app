import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { UserRole } from '../../types/user';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                사용자 설정
              </h3>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  사용자 권한 선택
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userRole"
                      value="USER"
                      checked={selectedRole === 'USER'}
                      onChange={() => handleRoleChange('USER')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm">
                      <span className="font-medium text-gray-900">일반 사용자</span>
                      <span className="block text-gray-500">농기계 임대 및 예약 기능을 사용할 수 있습니다.</span>
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userRole"
                      value="ADMIN"
                      checked={selectedRole === 'ADMIN'}
                      onChange={() => handleRoleChange('ADMIN')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-3 text-sm">
                      <span className="font-medium text-gray-900">관리자</span>
                      <span className="block text-gray-500">농기계 관리 및 예약 현황을 관리할 수 있습니다.</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-600">
                  <strong>현재 선택된 권한:</strong> {selectedRole === 'USER' ? '일반 사용자' : '관리자'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}