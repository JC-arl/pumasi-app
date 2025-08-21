interface StatusBadgeProps {
  status: string;
  type?: 'asset' | 'reservation' | 'maintenance' | 'user';
  className?: string;
}

const statusConfig = {
  asset: {
    AVAILABLE: { bg: 'bg-brand-light', text: 'text-brand-navy', label: '사용가능' },
    RESERVED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '예약됨' },
    IN_USE: { bg: 'bg-blue-100', text: 'text-blue-800', label: '사용중' },
    MAINTENANCE: { bg: 'bg-orange-100', text: 'text-orange-800', label: '정비중' },
    OUT_OF_SERVICE: { bg: 'bg-red-100', text: 'text-red-800', label: '사용불가' },
  },
  reservation: {
    REQUESTED: { bg: 'bg-gray-100', text: 'text-gray-800', label: '요청' },
    CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '확정' },
    IN_USE: { bg: 'bg-brand-light', text: 'text-brand-navy', label: '사용중' },
    RETURNED: { bg: 'bg-purple-100', text: 'text-purple-800', label: '반납' },
    COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: '완료' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '취소' },
  },
  maintenance: {
    REQUESTED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '요청' },
    IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800', label: '진행중' },
    COMPLETED: { bg: 'bg-brand-light', text: 'text-brand-navy', label: '완료' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '취소' },
  },
  user: {
    ACTIVE: { bg: 'bg-brand-light', text: 'text-brand-navy', label: '활성' },
    INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: '비활성' },
  },
};

export default function StatusBadge({ 
  status, 
  type = 'asset', 
  className = '' 
}: StatusBadgeProps) {
  const config = statusConfig[type][status as keyof typeof statusConfig[typeof type]];
  
  if (!config) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}