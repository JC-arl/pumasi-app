import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import type { CheckoutItem } from '../../types/checkout';
import { 
  Filter, 
  Download, 
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  Wrench,
  DollarSign,
  Calendar
} from 'lucide-react';

interface MonitoringItem extends CheckoutItem {
  daysRemaining: number;
  isOverdue: boolean;
  maintenanceRequired: boolean;
  insuranceStatus: 'ACTIVE' | 'EXPIRED' | 'EXPIRING';
}

export default function Monitoring() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [monitoringItems, setMonitoringItems] = useState<MonitoringItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MonitoringItem | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const loadCheckoutItems = () => {
      const checkouts: CheckoutItem[] = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      
      const inUseItems = checkouts
        .filter(item => item.status === 'CHECKED_OUT')
        .map(item => {
          const endDate = new Date(item.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysRemaining < 0;
          
          return {
            ...item,
            daysRemaining,
            isOverdue,
            maintenanceRequired: Math.random() > 0.8, // 임시로 20% 확률
            insuranceStatus: Math.random() > 0.9 ? 'EXPIRING' : 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'EXPIRING'
          };
        });
      
      setMonitoringItems(inUseItems);
    };

    loadCheckoutItems();
    const interval = setInterval(loadCheckoutItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusOptions = [
    { id: 'all', name: '전체' },
    { id: 'normal', name: '정상' },
    { id: 'overdue', name: '연체' },
    { id: 'maintenance', name: '정비 필요' },
    { id: 'insurance', name: '보험 만료 임박' },
  ];

  const filteredItems = useMemo(() => {
    return monitoringItems.filter(item => {
      if (selectedStatus === 'all') return true;
      if (selectedStatus === 'overdue') return item.isOverdue;
      if (selectedStatus === 'maintenance') return item.maintenanceRequired;
      if (selectedStatus === 'insurance') return item.insuranceStatus === 'EXPIRING';
      if (selectedStatus === 'normal') return !item.isOverdue && !item.maintenanceRequired && item.insuranceStatus === 'ACTIVE';
      return true;
    });
  }, [monitoringItems, selectedStatus]);

  const handleContact = (item: MonitoringItem) => {
    setSelectedItem(item);
    setShowContactModal(true);
  };

  const handleMaintenanceRequest = (itemId: string) => {
    console.log('정비 요청:', itemId);
    // 정비 요청 로직 구현
  };

  const columns: ColumnDef<MonitoringItem, any>[] = [
    {
      id: 'status',
      header: '상태',
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          {row.original.isOverdue && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
              <AlertTriangle className="h-3 w-3 mr-1" />
              연체
            </span>
          )}
          {row.original.maintenanceRequired && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded">
              <Wrench className="h-3 w-3 mr-1" />
              정비 필요
            </span>
          )}
          {row.original.insuranceStatus === 'EXPIRING' && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded">
              <DollarSign className="h-3 w-3 mr-1" />
              보험 만료 임박
            </span>
          )}
          {!row.original.isOverdue && !row.original.maintenanceRequired && row.original.insuranceStatus === 'ACTIVE' && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
              정상
            </span>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleContact(row.original)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="연락하기"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleContact(row.original)}
            className="text-green-600 hover:text-green-800 p-1"
            title="문자 발송"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          {row.original.maintenanceRequired && (
            <button
              onClick={() => handleMaintenanceRequest(row.original.id)}
              className="text-orange-600 hover:text-orange-800 p-1"
              title="정비 요청"
            >
              <Wrench className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'reservationId',
      header: '예약번호',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 text-sm">
          {row.original.reservationId}
        </div>
      ),
    },
    {
      accessorKey: 'assetName',
      header: '농기계',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {row.original.assetName}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.assetId}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'farmerName',
      header: '사용자',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.farmerName}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {row.original.farmerPhone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: '사용 기간',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {row.original.startDate}
          </div>
          <div className="text-gray-500">
            ~ {row.original.endDate}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'daysRemaining',
      header: '남은 일수',
      cell: ({ row }) => (
        <div className={`text-sm font-medium ${
          row.original.isOverdue 
            ? 'text-red-600' 
            : row.original.daysRemaining <= 3 
              ? 'text-orange-600' 
              : 'text-gray-900'
        }`}>
          {row.original.isOverdue 
            ? `${Math.abs(row.original.daysRemaining)}일 연체`
            : `${row.original.daysRemaining}일 남음`
          }
        </div>
      ),
    },
    {
      accessorKey: 'checkoutDate',
      header: '출고일시',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.checkoutDate 
            ? new Date(row.original.checkoutDate).toLocaleDateString('ko-KR')
            : '-'
          }
        </div>
      ),
    },
    {
      id: 'location',
      header: '현재 위치',
      cell: ({ row }) => (
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1" />
          추적 중
        </div>
      ),
    },
  ];

  const stats = {
    total: monitoringItems.length,
    overdue: monitoringItems.filter(item => item.isOverdue).length,
    maintenance: monitoringItems.filter(item => item.maintenanceRequired).length,
    expiring: monitoringItems.filter(item => item.insuranceStatus === 'EXPIRING').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">임대 중 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            현재 임대 중인 농기계 현황을 모니터링하고 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            필터
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 임대 중
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.total}건
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
                  연체
                </dt>
                <dd className="text-lg font-medium text-red-600">
                  {stats.overdue}건
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
                  정비 필요
                </dt>
                <dd className="text-lg font-medium text-orange-600">
                  {stats.maintenance}건
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
                  보험 만료 임박
                </dt>
                <dd className="text-lg font-medium text-yellow-600">
                  {stats.expiring}건
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                상태
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                농기계 유형
              </label>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="all">전체</option>
                <option value="tractor">트랙터</option>
                <option value="cultivator">경운기</option>
                <option value="combine">콤바인</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSelectedStatus('all')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 알림 카드 */}
      {(stats.overdue > 0 || stats.maintenance > 0 || stats.expiring > 0) && (
        <div className="space-y-4">
          {stats.overdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    연체 알림
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{stats.overdue}건의 농기계가 반납 예정일을 초과했습니다. 즉시 연락하여 반납을 독촉하세요.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {stats.maintenance > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Wrench className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    정비 알림
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>{stats.maintenance}건의 농기계에 정비가 필요합니다. 정비 일정을 조정하세요.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 테이블 */}
      <AdminTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="예약번호, 사용자명, 농기계명으로 검색..."
        pageSize={15}
      />

      {/* Contact Modal */}
      {showContactModal && selectedItem && (
        <ContactModal
          item={selectedItem}
          onClose={() => {
            setShowContactModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Contact Modal Component
function ContactModal({ item, onClose }: {
  item: MonitoringItem;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'call' | 'sms'>('sms');

  const defaultMessages = {
    overdue: `안녕하세요. ${item.farmerName}님의 ${item.assetName} 반납 예정일이 ${Math.abs(item.daysRemaining)}일 지났습니다. 빠른 시일 내에 반납해 주시기 바랍니다.`,
    reminder: `안녕하세요. ${item.farmerName}님의 ${item.assetName} 반납일이 ${item.daysRemaining}일 남았습니다. 반납 준비를 부탁드립니다.`,
    maintenance: `안녕하세요. 현재 이용 중인 ${item.assetName}의 정비가 필요합니다. 즉시 사용을 중단하고 연락 주시기 바랍니다.`,
  };

  const handleSend = () => {
    console.log(`${contactMethod} 발송:`, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">사용자 연락</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 사용자 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">연락 대상</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">성명:</span> {item.farmerName}</div>
                <div><span className="font-medium">연락처:</span> {item.farmerPhone}</div>
                <div><span className="font-medium">농기계:</span> {item.assetName}</div>
                <div><span className="font-medium">상태:</span> 
                  {item.isOverdue && <span className="text-red-600 ml-1">연체</span>}
                  {item.maintenanceRequired && <span className="text-orange-600 ml-1">정비 필요</span>}
                </div>
              </div>
            </div>

            {/* 연락 방법 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연락 방법</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={contactMethod === 'call'}
                    onChange={() => setContactMethod('call')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">전화 통화</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={contactMethod === 'sms'}
                    onChange={() => setContactMethod('sms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">문자 메시지</span>
                </label>
              </div>
            </div>

            {/* 메시지 템플릿 */}
            {contactMethod === 'sms' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메시지 템플릿</label>
                <div className="space-y-2">
                  {item.isOverdue && (
                    <button
                      onClick={() => setMessage(defaultMessages.overdue)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      연체 알림
                    </button>
                  )}
                  <button
                    onClick={() => setMessage(defaultMessages.reminder)}
                    className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    반납 알림
                  </button>
                  {item.maintenanceRequired && (
                    <button
                      onClick={() => setMessage(defaultMessages.maintenance)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      정비 알림
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 메시지 입력 */}
            {contactMethod === 'sms' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메시지 내용</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="메시지를 입력하세요..."
                />
                <div className="mt-1 text-xs text-gray-500">
                  {message.length}/90자
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSend}
              disabled={contactMethod === 'sms' && !message.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {contactMethod === 'call' ? '통화 시작' : '문자 발송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}