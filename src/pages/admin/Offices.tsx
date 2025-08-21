import { useState } from 'react';
import { MapPin, Phone, Clock, Users, Plus, Edit, Trash2 } from 'lucide-react';

interface Office {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  operatingHours: string;
  totalAssets: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const mockOffices: Office[] = [
  {
    id: 'OF-001',
    name: '춘천지점',
    address: '강원도 춘천시 중앙로 123',
    manager: '김관리',
    phone: '033-123-4567',
    operatingHours: '08:00-18:00',
    totalAssets: 15,
    status: 'ACTIVE',
  },
  {
    id: 'OF-002',
    name: '원주지점',
    address: '강원도 원주시 중앙시장길 45',
    manager: '이담당',
    phone: '033-234-5678',
    operatingHours: '08:30-17:30',
    totalAssets: 12,
    status: 'ACTIVE',
  },
  {
    id: 'OF-003',
    name: '강릉지점',
    address: '강원도 강릉시 경강로 67',
    manager: '박지점장',
    phone: '033-345-6789',
    operatingHours: '09:00-17:00',
    totalAssets: 8,
    status: 'ACTIVE',
  },
];

export default function Offices() {
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const handleEdit = (office: Office) => {
    setSelectedOffice(office);
    setShowAddModal(true);
  };

  const handleDelete = (officeId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setOffices(offices.filter(office => office.id !== officeId));
    }
  };

  const handleSave = (formData: Office) => {
    if (selectedOffice) {
      // 수정
      setOffices(offices.map(office => 
        office.id === selectedOffice.id ? { ...formData, id: selectedOffice.id } : office
      ));
    } else {
      // 추가
      const newOffice = {
        ...formData,
        id: `OF-${String(offices.length + 1).padStart(3, '0')}`
      };
      setOffices([...offices, newOffice]);
    }
    setShowAddModal(false);
    setSelectedOffice(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">임대사업소 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 임대사업소를 관리하고 정보를 업데이트하세요
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedOffice(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white"
          style={{ backgroundColor: '#133E87' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          사업소 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 사업소
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {offices.filter(o => o.status === 'ACTIVE').length}개
                </dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 보유 장비
                </dt>
                <dd className="text-lg font-medium text-blue-600">
                  {offices.reduce((sum, office) => sum + office.totalAssets, 0)}대
                </dd>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  평균 보유량
                </dt>
                <dd className="text-lg font-medium text-green-600">
                  {Math.round(offices.reduce((sum, office) => sum + office.totalAssets, 0) / offices.length)}대
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사업소 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {offices.map((office) => (
            <li key={office.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{office.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(office)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(office.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex space-y-2 sm:space-y-0 sm:space-x-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {office.address}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {office.manager}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {office.phone}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 sm:mt-0">
                        <div className="flex items-center">
                          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {office.operatingHours}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          장비 {office.totalAssets}대
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <OfficeModal
          office={selectedOffice}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedOffice(null);
          }}
        />
      )}
    </div>
  );
}

// 사업소 추가/수정 모달 컴포넌트
function OfficeModal({ 
  office, 
  onSave, 
  onCancel 
}: { 
  office: Office | null;
  onSave: (office: Office) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Office>(
    office || {
      id: '',
      name: '',
      address: '',
      manager: '',
      phone: '',
      operatingHours: '09:00-18:00',
      totalAssets: 0,
      status: 'ACTIVE'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onCancel}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {office ? '사업소 수정' : '사업소 추가'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">사업소명</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">주소</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">운영시간</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({...formData, operatingHours: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">보유 장비 수</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalAssets}
                    onChange={(e) => setFormData({...formData, totalAssets: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm"
                style={{ backgroundColor: '#133E87' }}
              >
                저장
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}