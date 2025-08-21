import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ReservationDetailModal from '../../components/admin/ReservationDetailModal';
import ManualReservationModal from '../../components/admin/ManualReservationModal';
import type { Reservation } from '../../types/admin';
import type { ReservationRequest } from '../../types/reservation';
import type { CheckoutItem } from '../../types/checkout';
import { RESERVATION_STATUS_MAP, type ReservationStatusType } from '../../types/reservationStatus';
import { createStatusChangeNotification } from '../../utils/notificationUtils';
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Download, 
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Eye,
  Phone,
  Truck,
  X
} from 'lucide-react';

// 임시 데이터
const mockReservations: Reservation[] = [
  {
    id: 'R-20240819-001',
    assetId: 'A-STD-001',
    assetName: '대형트랙터 (John Deere 8345R)',
    farmerId: 'U-1001',
    farmerName: '김농부',
    farmerPhone: '010-1234-5678',
    startDate: '2024-08-20T09:00:00+09:00',
    endDate: '2024-08-20T17:00:00+09:00',
    status: 'REQUESTED',
    channel: 'WEB',
    notes: '벼농사 작업용, 비올 시 일정 변경 가능',
    createdBy: 'SYSTEM',
    createdAt: '2024-08-19T10:30:00+09:00',
    officeId: 'OF-001',
  },
  {
    id: 'R-20240819-002',
    assetId: 'A-STD-002',
    assetName: '중형경운기 (Kubota L3901)',
    farmerId: 'U-1002',
    farmerName: '이농부',
    farmerPhone: '010-2345-6789',
    startDate: '2024-08-21T08:00:00+09:00',
    endDate: '2024-08-21T16:00:00+09:00',
    status: 'CONFIRMED',
    channel: 'PHONE',
    notes: '밭갈이 작업',
    createdBy: 'OPERATOR:U-9001',
    createdAt: '2024-08-19T11:15:00+09:00',
    officeId: 'OF-001',
  },
  {
    id: 'R-20240819-003',
    assetId: 'A-STD-003',
    assetName: '콤바인 (New Holland CR8.90)',
    farmerId: 'U-1003',
    farmerName: '박농부',
    farmerPhone: '010-3456-7890',
    startDate: '2024-08-19T14:00:00+09:00',
    endDate: '2024-08-19T18:00:00+09:00',
    status: 'IN_USE',
    channel: 'WEB',
    createdBy: 'OPERATOR:U-9002',
    createdAt: '2024-08-18T16:20:00+09:00',
    officeId: 'OF-002',
  },
];

const statusOptions = [
  { id: 'all', name: '전체 상태' },
  { id: 'REQUESTED', name: '요청' },
  { id: 'CONFIRMED', name: '확정' },
  { id: 'IN_USE', name: '사용중' },
  { id: 'RETURNED', name: '반납' },
  { id: 'COMPLETED', name: '완료' },
  { id: 'CANCELLED', name: '취소' },
];

const channelOptions = [
  { id: 'all', name: '전체 채널' },
  { id: 'WEB', name: '웹' },
  { id: 'PHONE', name: '전화' },
];

export default function Reservations() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [userReservations, setUserReservations] = useState<ReservationRequest[]>([]);
  const [, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [combinedReservations, setCombinedReservations] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ReservationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showManualReservationModal, setShowManualReservationModal] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const requests = JSON.parse(localStorage.getItem('reservationRequests') || '[]');
      const checkouts = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      
      setUserReservations(requests);
      setCheckoutItems(checkouts);

      // 통합된 예약 데이터 생성 (관리자용)
      const combined = requests.map((req: ReservationRequest) => {
        let status: ReservationStatusType = req.status as ReservationStatusType;
        
        // 승인된 예약이 출고되었는지 확인
        const checkoutItem = checkouts.find((item: CheckoutItem) => item.reservationId === req.id);
        if (checkoutItem) {
          switch (checkoutItem.status) {
            case 'CHECKED_OUT':
              // 반납 예정일 확인
              const endDate = new Date(checkoutItem.endDate);
              const now = new Date();
              const daysUntilReturn = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysUntilReturn <= 1 && daysUntilReturn > 0) {
                status = 'PENDING_RETURN';
              } else if (daysUntilReturn < 0) {
                status = 'PENDING_RETURN';
              } else {
                status = 'CHECKED_OUT';
              }
              break;
            case 'RETURNED':
              status = 'RETURNED';
              break;
            case 'PENDING_CHECKOUT':
              status = 'APPROVED';
              break;
          }
        }

        return {
          ...req,
          currentStatus: status,
          checkoutItem,
          daysUntilReturn: checkoutItem ? Math.ceil((new Date(checkoutItem.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
        } as any;
      });

      setCombinedReservations(combined);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 필터링된 데이터
  const filteredReservations = useMemo(() => {
    return mockReservations.filter(reservation => {
      const statusMatch = selectedStatus === 'all' || reservation.status === selectedStatus;
      const channelMatch = selectedChannel === 'all' || reservation.channel === selectedChannel;
      return statusMatch && channelMatch;
    });
  }, [selectedStatus, selectedChannel]);

  // 액션 핸들러
  const handleApprove = (reservationId: string) => {
    const reservation = userReservations.find(req => req.id === reservationId);
    
    setUserReservations(prev => 
      prev.map(req => 
        req.id === reservationId 
          ? { 
              ...req, 
              status: 'APPROVED' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: '관리자'
            }
          : req
      )
    );
    
    const updatedRequests = userReservations.map(req => 
      req.id === reservationId 
        ? { 
            ...req, 
            status: 'APPROVED' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: '관리자'
          }
        : req
    );
    localStorage.setItem('reservationRequests', JSON.stringify(updatedRequests));
    
    // 승인 알림 생성
    if (reservation) {
      createStatusChangeNotification('APPROVED', reservation.form.machineryName, reservationId);
    }
  };

  const handleReject = (reservationId: string, reason: string) => {
    const reservation = userReservations.find(req => req.id === reservationId);
    
    setUserReservations(prev => 
      prev.map(req => 
        req.id === reservationId 
          ? { 
              ...req, 
              status: 'REJECTED' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: '관리자',
              rejectionReason: reason
            }
          : req
      )
    );
    
    const updatedRequests = userReservations.map(req => 
      req.id === reservationId 
        ? { 
            ...req, 
            status: 'REJECTED' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: '관리자',
            rejectionReason: reason
          }
        : req
    );
    localStorage.setItem('reservationRequests', JSON.stringify(updatedRequests));
    
    // 반려 알림 생성
    if (reservation) {
      createStatusChangeNotification('REJECTED', reservation.form.machineryName, reservationId, reason);
    }
  };

  const handleCancel = (reservationId: string, reason: string) => {
    const reservation = userReservations.find(req => req.id === reservationId);
    
    setUserReservations(prev => 
      prev.map(req => 
        req.id === reservationId 
          ? { 
              ...req, 
              status: 'CANCELLED' as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: '관리자',
              rejectionReason: reason
            }
          : req
      )
    );
    
    const updatedRequests = userReservations.map(req => 
      req.id === reservationId 
        ? { 
            ...req, 
            status: 'CANCELLED' as const,
            reviewedAt: new Date().toISOString(),
            reviewedBy: '관리자',
            rejectionReason: reason
          }
        : req
    );
    localStorage.setItem('reservationRequests', JSON.stringify(updatedRequests));
    
    // 취소 알림 생성
    if (reservation) {
      createStatusChangeNotification('CANCELLED', reservation.form.machineryName, reservationId, reason);
    }
  };

  const handleSendMessage = (reservationId: string) => {
    console.log('문자 발송:', reservationId);
  };

  const handleStatusChange = (reservationId: string, newStatus: ReservationStatusType, reason?: string) => {
    const reservation = userReservations.find(req => req.id === reservationId);
    
    setUserReservations(prev => 
      prev.map(req => 
        req.id === reservationId 
          ? { 
              ...req, 
              status: newStatus,
              reviewedAt: new Date().toISOString(),
              reviewedBy: '관리자',
              rejectionReason: reason
            }
          : req
      )
    );
    
    const updatedRequests = userReservations.map(req => 
      req.id === reservationId 
        ? { 
            ...req, 
            status: newStatus,
            reviewedAt: new Date().toISOString(),
            reviewedBy: '관리자',
            rejectionReason: reason
          }
        : req
    );
    localStorage.setItem('reservationRequests', JSON.stringify(updatedRequests));
    
    // 상태 변경 알림 생성
    if (reservation) {
      createStatusChangeNotification(newStatus, reservation.form.machineryName, reservationId, reason);
    }
  };

  const showStatusChangeModal = (reservationId: string) => {
    const statusOptions = [
      { value: 'APPROVED', label: '승인 (예약 완료)' },
      { value: 'CHECKED_OUT', label: '출고 완료 (사용중)' },
      { value: 'PENDING_RETURN', label: '반납 대기' },
      { value: 'RETURNED', label: '반납 완료' },
      { value: 'REJECTED', label: '거절' },
      { value: 'CANCELLED', label: '취소' }
    ];

    const selectedStatus = prompt(
      `예약 상태를 선택하세요:\n\n` +
      statusOptions.map((option, index) => `${index + 1}. ${option.label}`).join('\n') +
      `\n\n번호를 입력하세요 (1-${statusOptions.length}):`
    );

    if (selectedStatus) {
      const statusIndex = parseInt(selectedStatus) - 1;
      if (statusIndex >= 0 && statusIndex < statusOptions.length) {
        const newStatus = statusOptions[statusIndex].value as ReservationStatusType;
        
        // 거절이나 취소의 경우 사유 입력 받기
        let reason = '';
        if (newStatus === 'REJECTED' || newStatus === 'CANCELLED') {
          reason = prompt(`${newStatus === 'REJECTED' ? '거절' : '취소'} 사유를 입력하세요:`) || '';
        }
        
        handleStatusChange(reservationId, newStatus, reason);
      }
    }
  };

  const handleViewDetail = (reservation: ReservationRequest) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleManualReservationSubmit = (reservationData: any) => {
    // 새 예약 ID 생성
    const newId = `R-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // 새 예약 요청 객체 생성
    const newReservation: ReservationRequest = {
      id: newId,
      form: {
        selectedMachinery: reservationData.selectedMachinery,
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
        rentalPeriod: reservationData.rentalPeriod,
        farmerName: reservationData.farmerName,
        farmerPhone: reservationData.farmerPhone,
        farmAddress: reservationData.farmAddress,
        farmSize: reservationData.farmSize,
        cropType: reservationData.cropType,
        deliveryRequired: reservationData.deliveryRequired,
        deliveryAddress: reservationData.deliveryAddress,
        notes: `관리자 수동 예약${reservationData.notes ? ` - ${reservationData.notes}` : ''}`
      },
      status: 'APPROVED', // 수동 예약은 자동 승인
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedBy: '관리자 (수동 예약)'
    };

    // localStorage에 추가
    const existingRequests = JSON.parse(localStorage.getItem('reservationRequests') || '[]');
    const updatedRequests = [...existingRequests, newReservation];
    localStorage.setItem('reservationRequests', JSON.stringify(updatedRequests));

    // 상태 업데이트
    setUserReservations(prev => [...prev, newReservation]);
    
    // 모달 닫기
    setShowManualReservationModal(false);
  };

  // 사용자 예약 요청을 위한 테이블 컬럼 정의
  const userReservationColumns: ColumnDef<ReservationRequest, any>[] = [
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          {row.original.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row.original.id)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                title="예약 승인"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                승인
              </button>
              <button
                onClick={() => setSelectedReservation(row.original)}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                title="예약 반려"
              >
                <XCircle className="h-3 w-3 mr-1" />
                반려
              </button>
            </>
          )}
          {['PENDING', 'APPROVED'].includes(row.original.status) && (
            <button
              onClick={() => {
                const reason = prompt('취소 사유를 입력하세요:');
                if (reason) {
                  handleCancel(row.original.id, reason);
                }
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors"
              title="예약 취소"
            >
              <X className="h-3 w-3 mr-1" />
              취소
            </button>
          )}
          <button
            onClick={() => showStatusChangeModal(row.original.id)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            title="상태 변경"
          >
            <Clock className="h-3 w-3 mr-1" />
            상태변경
          </button>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleSendMessage(row.original.id)}
              className="p-1 rounded transition-colors"
              style={{
                color: '#328E6E',
                '--tw-hover-color': '#2a7659'
              } as React.CSSProperties}
              title="문자 발송"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleViewDetail(row.original)}
              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
              title="상세보기"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: '예약번호',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: 'form.machineryName',
      header: '농기계',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {row.original.form.machineryName}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.form.officeName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'form.farmerName',
      header: '신청자',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.form.farmerName}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            {row.original.form.farmerPhone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'form.startDate',
      header: '사용일시',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {row.original.form.startDate}
          </div>
          <div className="text-gray-500">
            ~ {row.original.form.endDate}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'currentStatus',
      header: '현재 상태',
      size: 220,
      minSize: 220,
      maxSize: 300,
      cell: ({ row }) => {
        const statusInfo = RESERVATION_STATUS_MAP[row.original.currentStatus as ReservationStatusType];
        let IconComponent;
        
        switch (statusInfo.icon) {
          case 'clock':
            IconComponent = Clock;
            break;
          case 'check-circle':
            IconComponent = CheckCircle;
            break;
          case 'truck':
            IconComponent = Truck;
            break;
          case 'x-circle':
            IconComponent = XCircle;
            break;
          default:
            IconComponent = Clock;
        }

        return (
          <div className="flex flex-col space-y-1 min-w-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.bgColor} ${statusInfo.color}`}>
              <IconComponent className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{statusInfo.label}</span>
            </span>
            {row.original.daysUntilReturn !== null && row.original.currentStatus === 'CHECKED_OUT' && (
              <span className={`text-xs whitespace-nowrap ${row.original.daysUntilReturn <= 1 ? 'text-orange-600' : 'text-gray-500'}`}>
                {row.original.daysUntilReturn > 0 ? `${row.original.daysUntilReturn}일 남음` : `${Math.abs(row.original.daysUntilReturn)}일 연체`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'form.deliveryRequired',
      header: '배송',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.form.deliveryRequired 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.form.deliveryRequired ? '배송' : '수령'}
        </span>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: '신청일시',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.submittedAt).toLocaleDateString('ko-KR')}
          <br />
          {new Date(row.original.submittedAt).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      ),
    },
  ];

  // 기존 테이블 컬럼 정의
  const columns: ColumnDef<Reservation, any>[] = [
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.status === 'REQUESTED' && (
            <>
              <button
                onClick={() => handleApprove(row.original.id)}
                className="text-green-600 hover:text-green-800 p-1"
                title="승인"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(row.original.id, '')}
                className="text-red-600 hover:text-red-800 p-1"
                title="반려"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleSendMessage(row.original.id)}
            className="p-1"
            style={{
              color: '#328E6E',
              '--tw-hover-color': '#2a7659'
            } as React.CSSProperties}
            title="문자 발송"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 p-1" title="상세보기">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: '예약번호',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.id}
        </div>
      ),
    },
    {
      accessorKey: 'assetName',
      header: '장비',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {row.original.assetName.split(' (')[0]}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.assetName.split(' (')[1]?.replace(')', '')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'farmerName',
      header: '신청자',
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
      header: '사용일시',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {new Date(row.original.startDate).toLocaleDateString('ko-KR')}
          </div>
          <div className="text-gray-500">
            {new Date(row.original.startDate).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {new Date(row.original.endDate).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="reservation" />
      ),
    },
    {
      accessorKey: 'channel',
      header: '채널',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.channel === 'WEB' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.channel === 'WEB' ? '웹' : '전화'}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: '메모',
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm text-gray-500" title={row.original.notes}>
          {row.original.notes || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '접수일시',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString('ko-KR')}
          <br />
          {new Date(row.original.createdAt).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">예약·배정 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 예약 요청을 처리하고 일정을 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'table'
                  ? 'text-white'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={viewMode === 'table' ? {
                backgroundColor: '#328E6E',
                borderColor: '#328E6E'
              } : {}}
            >
              테이블
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                viewMode === 'calendar'
                  ? 'text-white'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              style={viewMode === 'calendar' ? {
                backgroundColor: '#328E6E',
                borderColor: '#328E6E'
              } : {}}
            >
              <CalendarIcon className="h-4 w-4 mr-2 inline" />
              캘린더
            </button>
          </div>
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
          <button 
            onClick={() => setShowManualReservationModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
            style={{backgroundColor: '#328E6E'}}
          >
            <Plus className="h-4 w-4 mr-2" />
            수동 예약
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 예약
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {combinedReservations.length}건
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
                  요청
                </dt>
                <dd className="text-lg font-medium text-yellow-600">
                  {combinedReservations.filter(r => r.currentStatus === 'PENDING').length}건
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
                  확정
                </dt>
                <dd className="text-lg font-medium" style={{color: '#328E6E'}}>
                  {combinedReservations.filter(r => r.currentStatus === 'APPROVED').length}건
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
                  사용중
                </dt>
                <dd className="text-lg font-medium text-green-600">
                  {combinedReservations.filter(r => r.currentStatus === 'CHECKED_OUT').length}건
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
                  완료/취소
                </dt>
                <dd className="text-lg font-medium text-gray-600">
                  {combinedReservations.filter(r => ['RETURNED', 'CANCELLED', 'REJECTED'].includes(r.currentStatus)).length}건
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                채널
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {channelOptions.map((option) => (
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
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedChannel('all');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 대기열 알림 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              대기열 현황
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>트랙터 2건, 경운기 1건의 예약이 대기 중입니다. 취소 발생 시 자동으로 배정됩니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 통합 예약 관리 */}
      {combinedReservations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">예약 현황 관리</h2>
            <span className="text-sm text-gray-500">{combinedReservations.length}건</span>
          </div>
          <AdminTable
            data={combinedReservations}
            columns={userReservationColumns}
            searchPlaceholder="예약번호, 신청자명, 농기계명으로 검색..."
            pageSize={10}
          />
        </div>
      )}


      {/* Detail Modal */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReservation(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Manual Reservation Modal */}
      <ManualReservationModal
        isOpen={showManualReservationModal}
        onClose={() => setShowManualReservationModal(false)}
        onSubmit={handleManualReservationSubmit}
      />
    </div>
  );
}