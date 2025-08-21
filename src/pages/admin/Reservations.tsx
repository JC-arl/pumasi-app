import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import type { Reservation } from '../../types/admin';
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
  Phone
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
    console.log('승인:', reservationId);
  };

  const handleReject = (reservationId: string) => {
    console.log('반려:', reservationId);
  };

  const handleSendMessage = (reservationId: string) => {
    console.log('문자 발송:', reservationId);
  };

  // 테이블 컬럼 정의
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
                onClick={() => handleReject(row.original.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="반려"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleSendMessage(row.original.id)}
            className="text-blue-600 hover:text-blue-800 p-1"
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
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              테이블
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-l-0 border ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
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
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
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
                  {mockReservations.length}건
                </dd>
              </div>
            </div>
          </div>
        </div>
        {statusOptions.slice(1).map((status) => {
          const count = mockReservations.filter(r => r.status === status.id).length;
          const colors = {
            REQUESTED: 'text-yellow-600',
            CONFIRMED: 'text-blue-600',
            IN_USE: 'text-green-600',
            RETURNED: 'text-purple-600',
            COMPLETED: 'text-gray-600',
            CANCELLED: 'text-red-600',
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

      {/* 컨텐츠 */}
      {viewMode === 'table' ? (
        <AdminTable
          data={filteredReservations}
          columns={columns}
          searchPlaceholder="예약번호, 신청자명, 장비명으로 검색..."
          pageSize={15}
        />
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">캘린더 뷰</h3>
            <p className="mt-1 text-sm text-gray-500">
              캘린더 뷰는 개발 중입니다. 드래그앤드롭으로 일정을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}