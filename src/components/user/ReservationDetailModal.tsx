import React from 'react';
import { X, Calendar, MapPin, Phone, Truck, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { RESERVATION_STATUS_MAP, type ReservationStatusType } from '../../types/reservationStatus';

interface ReservationDetail {
  id: string;
  status: ReservationStatusType;
  machineryName: string;
  officeName: string;
  farmerName: string;
  farmerPhone: string;
  startDate: string;
  endDate: string;
  deliveryRequired: boolean;
  farmAddress: string;
  submittedAt: string;
  rejectionReason?: string;
  checkoutDate?: string;
  returnDate?: string;
}

interface ReservationDetailModalProps {
  reservation: ReservationDetail;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_FLOW: ReservationStatusType[] = ['PENDING', 'APPROVED', 'CHECKED_OUT', 'PENDING_RETURN', 'RETURNED'];
const STATUS_LABELS = ['예약 대기', '예약 완료', '사용중', '반납 대기', '반납 완료'];

export default function ReservationDetailModal({ reservation, isOpen, onClose }: ReservationDetailModalProps) {
  if (!isOpen) return null;

  const currentStatusIndex = STATUS_FLOW.indexOf(reservation.status);
  const isRejectedOrCancelled = ['REJECTED', 'CANCELLED'].includes(reservation.status);

  const getStatusIcon = (status: ReservationStatusType) => {
    const statusInfo = RESERVATION_STATUS_MAP[status];
    switch (statusInfo.icon) {
      case 'clock':
        return Clock;
      case 'check-circle':
        return CheckCircle;
      case 'truck':
        return Truck;
      default:
        return Clock;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">예약 상세 내역</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 농기계 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{reservation.machineryName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {reservation.officeName}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {reservation.startDate} ~ {reservation.endDate}
            </div>
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              {reservation.deliveryRequired ? '배송 요청' : '직접 수령'}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {reservation.farmerName}
            </div>
          </div>
        </div>

        {/* 현재 상태 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">현재 상태</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${RESERVATION_STATUS_MAP[reservation.status].bgColor} ${RESERVATION_STATUS_MAP[reservation.status].color}`}>
              {React.createElement(getStatusIcon(reservation.status), { className: "w-4 h-4 mr-1" })}
              {RESERVATION_STATUS_MAP[reservation.status].label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {RESERVATION_STATUS_MAP[reservation.status].description}
          </p>
        </div>

        {/* 진행 상태 플로우 */}
        {!isRejectedOrCancelled && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">진행 상태</h3>
            
            {/* 진행 단계 표시 */}
            <div className="flex items-center justify-between mb-4">
              {STATUS_FLOW.map((status, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StatusIcon = getStatusIcon(status);
                
                return (
                  <React.Fragment key={status}>
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive 
                          ? isCurrent 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-green-100 border-green-500 text-green-700'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 text-center font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {STATUS_LABELS[index]}
                      </span>
                    </div>
                    {index < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* 상태별 추가 정보 */}
        {reservation.status === 'CHECKED_OUT' && reservation.checkoutDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">출고 완료</p>
                <p className="text-sm text-blue-700 mt-1">
                  출고일시: {new Date(reservation.checkoutDate).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {reservation.status === 'RETURNED' && reservation.returnDate && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">반납 완료</p>
                <p className="text-sm text-green-700 mt-1">
                  반납일시: {new Date(reservation.returnDate).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {reservation.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {reservation.status === 'REJECTED' ? '거절 사유' : '취소 사유'}
                </p>
                <p className="text-sm text-red-700 mt-1">{reservation.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* 신청자 정보 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">신청자 정보</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">성명:</span>
              <span className="ml-2">{reservation.farmerName}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">연락처:</span>
              <span className="ml-2">{reservation.farmerPhone}</span>
            </div>
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
              <span className="font-medium">농장 주소:</span>
              <span className="ml-2">{reservation.farmAddress}</span>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t pt-4 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>신청일시: {new Date(reservation.submittedAt).toLocaleString('ko-KR')}</span>
            <span>예약번호: {reservation.id}</span>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}