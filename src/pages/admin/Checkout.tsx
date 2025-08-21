import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import type { CheckoutItem } from '../../types/checkout';
import type { ReservationRequest } from '../../types/reservation';
import { 
  Plus, 
  Filter, 
  Download, 
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  User
} from 'lucide-react';

export default function Checkout() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // 승인된 예약 요청을 출고 대기 목록으로 변환
  useEffect(() => {
    const loadApprovedReservations = () => {
      const reservations: ReservationRequest[] = JSON.parse(
        localStorage.getItem('reservationRequests') || '[]'
      );
      
      const approvedReservations = reservations.filter(r => r.status === 'APPROVED');
      const existingCheckouts = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      
      const newCheckouts = approvedReservations
        .filter(reservation => !existingCheckouts.find((item: CheckoutItem) => item.reservationId === reservation.id))
        .map(reservation => ({
          id: `checkout-${reservation.id}`,
          reservationId: reservation.id,
          assetId: reservation.form.machineryId,
          assetName: reservation.form.machineryName,
          farmerName: reservation.form.farmerName,
          farmerPhone: reservation.form.farmerPhone,
          startDate: reservation.form.startDate,
          endDate: reservation.form.endDate,
          status: 'PENDING_CHECKOUT' as const,
          condition: {}
        }));

      if (newCheckouts.length > 0) {
        const allCheckouts = [...existingCheckouts, ...newCheckouts];
        localStorage.setItem('checkoutItems', JSON.stringify(allCheckouts));
        setCheckoutItems(allCheckouts);
      } else {
        setCheckoutItems(existingCheckouts);
      }
    };

    loadApprovedReservations();
    const interval = setInterval(loadApprovedReservations, 2000);
    return () => clearInterval(interval);
  }, []);

  const statusOptions = [
    { id: 'all', name: '전체 상태' },
    { id: 'PENDING_CHECKOUT', name: '출고 대기' },
    { id: 'CHECKED_OUT', name: '출고됨' },
    { id: 'PENDING_RETURN', name: '반납 대기' },
    { id: 'RETURNED', name: '반납됨' },
  ];

  const filteredItems = useMemo(() => {
    return checkoutItems.filter(item => {
      const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
      return statusMatch;
    });
  }, [checkoutItems, selectedStatus]);

  const handleCheckout = (item: CheckoutItem) => {
    setSelectedItem(item);
    setShowCheckoutModal(true);
  };

  const handleReturn = (item: CheckoutItem) => {
    setSelectedItem(item);
    setShowReturnModal(true);
  };

  const completeCheckout = (itemId: string, checkoutData: any) => {
    const updatedItems = checkoutItems.map(item => 
      item.id === itemId 
        ? {
            ...item,
            status: 'CHECKED_OUT' as const,
            checkoutDate: new Date().toISOString(),
            checkoutBy: '관리자',
            checkoutNotes: checkoutData.notes,
            condition: { checkout: checkoutData.condition },
            contract: checkoutData.contract
          }
        : item
    );
    setCheckoutItems(updatedItems);
    localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
    setShowCheckoutModal(false);
    setSelectedItem(null);
  };

  const completeReturn = (itemId: string, returnData: any) => {
    const updatedItems = checkoutItems.map(item => 
      item.id === itemId 
        ? {
            ...item,
            status: 'RETURNED' as const,
            returnDate: new Date().toISOString(),
            returnBy: '관리자',
            returnNotes: returnData.notes,
            condition: { ...item.condition, return: returnData.condition }
          }
        : item
    );
    setCheckoutItems(updatedItems);
    localStorage.setItem('checkoutItems', JSON.stringify(updatedItems));
    setShowReturnModal(false);
    setSelectedItem(null);
  };

  const columns: ColumnDef<CheckoutItem, any>[] = [
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.status === 'PENDING_CHECKOUT' && (
            <button
              onClick={() => handleCheckout(row.original)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
            >
              <ArrowUpRight className="h-3 w-3 mr-1" />
              출고
            </button>
          )}
          {row.original.status === 'CHECKED_OUT' && (
            <button
              onClick={() => handleReturn(row.original)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
            >
              <ArrowDownLeft className="h-3 w-3 mr-1" />
              반납
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600">
            <FileText className="h-4 w-4" />
          </button>
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
          <div className="text-sm text-gray-500">
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
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const statusMap = {
          PENDING_CHECKOUT: { label: '출고 대기', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
          CHECKED_OUT: { label: '출고됨', color: 'bg-blue-100 text-blue-800', icon: ArrowUpRight },
          PENDING_RETURN: { label: '반납 대기', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
          RETURNED: { label: '반납됨', color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };
        const status = statusMap[row.original.status as keyof typeof statusMap];
        const Icon = status.icon;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {status.label}
          </span>
        );
      },
    },
    {
      accessorKey: 'checkoutDate',
      header: '출고일시',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.checkoutDate 
            ? new Date(row.original.checkoutDate).toLocaleString('ko-KR')
            : '-'
          }
        </div>
      ),
    },
    {
      accessorKey: 'returnDate',
      header: '반납일시',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.returnDate 
            ? new Date(row.original.returnDate).toLocaleString('ko-KR')
            : '-'
          }
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">출고·반납 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 출고와 반납을 처리하고 상태를 관리하세요
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
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            수동 출고
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statusOptions.slice(1).map((status) => {
          const count = checkoutItems.filter(item => item.status === status.id).length;
          const colors = {
            PENDING_CHECKOUT: 'text-yellow-600',
            CHECKED_OUT: 'text-blue-600',
            PENDING_RETURN: 'text-orange-600',
            RETURNED: 'text-green-600',
          };
          return (
            <div key={status.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {status.name}
                    </dt>
                    <dd className={`text-lg font-medium ${colors[status.id as keyof typeof colors]}`}>
                      {count}건
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
                기간
              </label>
              <input
                type="date"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
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

      {/* 중요 알림 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              출고·반납 처리 안내
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>출고 시 농기계 상태 점검과 계약서 작성이 필요하며, 반납 시 손상 여부와 연료량을 확인해주세요.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <AdminTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="예약번호, 사용자명, 농기계명으로 검색..."
        pageSize={15}
      />

      {/* Checkout Modal */}
      {showCheckoutModal && selectedItem && (
        <CheckoutModal
          item={selectedItem}
          onComplete={completeCheckout}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Return Modal */}
      {showReturnModal && selectedItem && (
        <ReturnModal
          item={selectedItem}
          onComplete={completeReturn}
          onClose={() => {
            setShowReturnModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Checkout Modal Component
function CheckoutModal({ item, onComplete, onClose }: {
  item: CheckoutItem;
  onComplete: (id: string, data: any) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState({
    overall: 'GOOD',
    engine: 'GOOD',
    hydraulics: 'GOOD',
    transmission: 'GOOD',
    tires: 'GOOD',
    exterior: 'GOOD',
    interior: 'GOOD',
    attachments: 'COMPLETE',
    fuelLevel: 100,
    notes: ''
  });

  const handleSubmit = () => {
    onComplete(item.id, {
      notes,
      condition,
      contract: {
        id: `contract-${Date.now()}`,
        signedDate: new Date().toISOString(),
        terms: ['임대 기간 준수', '정상 사용', '손상 시 배상'],
        deposit: { amount: 100000, method: 'CASH', refundable: true }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">농기계 출고 처리</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">출고 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">농기계:</span> {item.assetName}</div>
                <div><span className="font-medium">사용자:</span> {item.farmerName}</div>
                <div><span className="font-medium">연락처:</span> {item.farmerPhone}</div>
                <div><span className="font-medium">사용 기간:</span> {item.startDate} ~ {item.endDate}</div>
              </div>
            </div>

            {/* 상태 점검 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">농기계 상태 점검</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">엔진 상태</label>
                  <select
                    value={condition.engine}
                    onChange={(e) => setCondition({...condition, engine: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="GOOD">양호</option>
                    <option value="MINOR_ISSUES">경미한 문제</option>
                    <option value="MAJOR_ISSUES">심각한 문제</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연료량 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={condition.fuelLevel}
                    onChange={(e) => setCondition({...condition, fuelLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">타이어 상태</label>
                  <select
                    value={condition.tires}
                    onChange={(e) => setCondition({...condition, tires: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="GOOD">양호</option>
                    <option value="WORN">마모됨</option>
                    <option value="NEEDS_REPLACEMENT">교체 필요</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">외관 상태</label>
                  <select
                    value={condition.exterior}
                    onChange={(e) => setCondition({...condition, exterior: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="EXCELLENT">우수</option>
                    <option value="GOOD">양호</option>
                    <option value="DAMAGED">손상됨</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 특이사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출고 시 특이사항</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="출고 시 주의사항이나 특이사항을 입력하세요..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              출고 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Return Modal Component
function ReturnModal({ item, onComplete, onClose }: {
  item: CheckoutItem;
  onComplete: (id: string, data: any) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState({
    overall: 'GOOD',
    engine: 'GOOD',
    hydraulics: 'GOOD',
    transmission: 'GOOD',
    tires: 'GOOD',
    exterior: 'GOOD',
    interior: 'GOOD',
    attachments: 'COMPLETE',
    fuelLevel: 80,
    notes: ''
  });

  const handleSubmit = () => {
    onComplete(item.id, { notes, condition });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">농기계 반납 처리</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">반납 정보</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">농기계:</span> {item.assetName}</div>
                <div><span className="font-medium">사용자:</span> {item.farmerName}</div>
                <div><span className="font-medium">출고일:</span> {item.checkoutDate && new Date(item.checkoutDate).toLocaleDateString('ko-KR')}</div>
                <div><span className="font-medium">예정 반납일:</span> {item.endDate}</div>
              </div>
            </div>

            {/* 상태 점검 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">농기계 상태 점검</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전체 상태</label>
                  <select
                    value={condition.overall}
                    onChange={(e) => setCondition({...condition, overall: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="EXCELLENT">우수</option>
                    <option value="GOOD">양호</option>
                    <option value="FAIR">보통</option>
                    <option value="POOR">불량</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연료량 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={condition.fuelLevel}
                    onChange={(e) => setCondition({...condition, fuelLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">손상 여부</label>
                  <select
                    value={condition.exterior}
                    onChange={(e) => setCondition({...condition, exterior: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="EXCELLENT">손상 없음</option>
                    <option value="GOOD">경미한 손상</option>
                    <option value="DAMAGED">심각한 손상</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">부착물 상태</label>
                  <select
                    value={condition.attachments}
                    onChange={(e) => setCondition({...condition, attachments: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="COMPLETE">완전</option>
                    <option value="MISSING">누락</option>
                    <option value="DAMAGED">손상</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 특이사항 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">반납 시 특이사항</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="반납 시 발견된 손상이나 특이사항을 입력하세요..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              반납 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}