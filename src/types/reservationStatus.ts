export type ReservationStatusType = 
  | 'PENDING'        // 예약 대기 (관리자 승인 대기)
  | 'APPROVED'       // 예약 완료 (관리자 승인됨)
  | 'CHECKED_OUT'    // 사용중 (출고됨)
  | 'PENDING_RETURN' // 반납 대기 (반납 예정일 임박)
  | 'RETURNED'       // 반납 완료
  | 'REJECTED'       // 예약 거절
  | 'CANCELLED';     // 예약 취소

export interface ReservationStatusInfo {
  status: ReservationStatusType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  nextStatus?: ReservationStatusType;
}

export const RESERVATION_STATUS_MAP: Record<ReservationStatusType, ReservationStatusInfo> = {
  PENDING: {
    status: 'PENDING',
    label: '예약 대기',
    description: '관리자 승인을 기다리고 있습니다',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: 'clock',
    nextStatus: 'APPROVED'
  },
  APPROVED: {
    status: 'APPROVED',
    label: '예약 완료',
    description: '예약이 승인되었습니다. 출고일을 기다려주세요',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: 'check-circle',
    nextStatus: 'CHECKED_OUT'
  },
  CHECKED_OUT: {
    status: 'CHECKED_OUT',
    label: '사용중',
    description: '농기계를 사용 중입니다',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: 'truck',
    nextStatus: 'PENDING_RETURN'
  },
  PENDING_RETURN: {
    status: 'PENDING_RETURN',
    label: '반납 대기',
    description: '반납 예정일이 임박했습니다',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    icon: 'clock',
    nextStatus: 'RETURNED'
  },
  RETURNED: {
    status: 'RETURNED',
    label: '반납 완료',
    description: '농기계 반납이 완료되었습니다',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: 'check-circle'
  },
  REJECTED: {
    status: 'REJECTED',
    label: '예약 거절',
    description: '예약이 거절되었습니다',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: 'x-circle'
  },
  CANCELLED: {
    status: 'CANCELLED',
    label: '예약 취소',
    description: '예약이 취소되었습니다',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: 'x-circle'
  }
};

export const getReservationStatusInfo = (status: ReservationStatusType): ReservationStatusInfo => {
  return RESERVATION_STATUS_MAP[status];
};

export const getNextStatus = (currentStatus: ReservationStatusType): ReservationStatusType | null => {
  return RESERVATION_STATUS_MAP[currentStatus]?.nextStatus || null;
};