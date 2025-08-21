import { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalReservations: number;
}

const mockUsers: UserData[] = [
  {
    id: 'U-001',
    name: '김농부',
    email: 'farmer1@example.com',
    phone: '010-1234-5678',
    address: '강원도 춘천시 농장길 123',
    joinDate: '2023-03-15',
    status: 'ACTIVE',
    totalReservations: 25,
  },
  {
    id: 'U-002',
    name: '이농장',
    email: 'farmer2@example.com',
    phone: '010-2345-6789',
    address: '강원도 원주시 밭골로 456',
    joinDate: '2023-05-20',
    status: 'ACTIVE',
    totalReservations: 18,
  },
  {
    id: 'U-003',
    name: '박농민',
    email: 'farmer3@example.com',
    phone: '010-3456-7890',
    address: '강원도 강릉시 논밭길 789',
    joinDate: '2023-07-10',
    status: 'INACTIVE',
    totalReservations: 12,
  },
  {
    id: 'U-004',
    name: '최농장주',
    email: 'farmer4@example.com',
    phone: '010-4567-8901',
    address: '강원도 춘천시 농협길 321',
    joinDate: '2024-01-08',
    status: 'ACTIVE',
    totalReservations: 5,
  },
];

export default function Users() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setShowAddModal(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
        : user
    ));
  };

  const handleSave = (formData: UserData) => {
    if (selectedUser) {
      // 수정
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...formData, id: selectedUser.id } : user
      ));
    } else {
      // 추가
      const newUser = {
        ...formData,
        id: `U-${String(users.length + 1).padStart(3, '0')}`,
        joinDate: new Date().toISOString().split('T')[0],
        totalReservations: 0
      };
      setUsers([...users, newUser]);
    }
    setShowAddModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 임대 서비스 사용자를 관리하세요
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white"
          style={{ backgroundColor: '#133E87' }}
        >
          <Plus className="h-4 w-4 mr-2" />
          사용자 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 사용자
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {users.length}명
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
                  활성 사용자
                </dt>
                <dd className="text-lg font-medium text-green-600">
                  {users.filter(u => u.status === 'ACTIVE').length}명
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
                  비활성 사용자
                </dt>
                <dd className="text-lg font-medium text-red-600">
                  {users.filter(u => u.status === 'INACTIVE').length}명
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
                  총 예약 건수
                </dt>
                <dd className="text-lg font-medium text-blue-600">
                  {users.reduce((sum, user) => sum + user.totalReservations, 0)}건
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center mr-4"
                          style={{ backgroundColor: '#CBDCEB' }}
                        >
                          <User className="h-5 w-5" style={{ color: '#133E87' }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">가입일: {user.joinDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'ACTIVE' ? '활성' : '비활성'}
                        </span>
                        
                        <button
                          onClick={() => setShowDetails(showDetails === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showDetails === user.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          {user.status === 'ACTIVE' ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {showDetails === user.id && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="flex-shrink-0 mr-2 h-4 w-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="flex-shrink-0 mr-2 h-4 w-4" />
                            {user.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="flex-shrink-0 mr-2 h-4 w-4" />
                            {user.address}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="flex-shrink-0 mr-2 h-4 w-4" />
                            총 예약: {user.totalReservations}건
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 추가/수정 모달 */}
      {showAddModal && (
        <UserModal
          user={selectedUser}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// 사용자 추가/수정 모달 컴포넌트
function UserModal({ 
  user, 
  onSave, 
  onCancel 
}: { 
  user: UserData | null;
  onSave: (user: UserData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserData>(
    user || {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      joinDate: '',
      status: 'ACTIVE',
      totalReservations: 0
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
                  {user ? '사용자 수정' : '사용자 추가'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="INACTIVE">비활성</option>
                  </select>
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