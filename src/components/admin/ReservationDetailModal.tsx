import { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, Clock, User, MapPin, Phone, Calendar } from 'lucide-react';
import type { ReservationRequest } from '../../types/reservation';

interface ReservationDetailModalProps {
  reservation: ReservationRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ReservationDetailModal({
  reservation,
  isOpen,
  onClose,
  onApprove,
  onReject
}: ReservationDetailModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!isOpen) return null;

  const handleApprove = () => {
    onApprove(reservation.id);
    onClose();
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(reservation.id, rejectionReason);
      onClose();
      setRejectionReason('');
      setShowRejectionForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900">예약 상세 정보</h3>
              <p className="text-sm text-gray-500">예약 ID: {reservation.id}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                {reservation.status === 'PENDING' && '검토 대기'}
                {reservation.status === 'APPROVED' && '승인됨'}
                {reservation.status === 'REJECTED' && '거절됨'}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* 농기계 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                신청 농기계
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">농기계명:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.machineryName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">임대사업소:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.officeName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">임대 시작일:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.startDate}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">임대 종료일:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.endDate}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">배송 방법:</span>
                  <span className="ml-2 text-gray-900">
                    {reservation.form.deliveryRequired ? '배송 요청' : '직접 수령'}
                  </span>
                </div>
                {reservation.form.deliveryRequired && reservation.form.deliveryAddress && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">배송 주소:</span>
                    <span className="ml-2 text-gray-900">{reservation.form.deliveryAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 신청자 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-600" />
                신청자 정보
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">성명:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.farmerName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-700">연락처:</span>
                  <span className="ml-2 text-gray-900">{reservation.form.farmerPhone}</span>
                </div>
                <div className="md:col-span-2 flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1 mt-0.5" />
                  <div>
                    <span className="font-medium text-gray-700">농장 주소:</span>
                    <span className="ml-2 text-gray-900">{reservation.form.farmAddress}</span>
                  </div>
                </div>
                {reservation.form.farmSize && (
                  <div>
                    <span className="font-medium text-gray-700">농장 규모:</span>
                    <span className="ml-2 text-gray-900">{reservation.form.farmSize}평</span>
                  </div>
                )}
                {reservation.form.cropType && (
                  <div>
                    <span className="font-medium text-gray-700">재배 작물:</span>
                    <span className="ml-2 text-gray-900">{reservation.form.cropType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 특이사항 */}
            {reservation.form.notes && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
                  특이사항
                </h4>
                <p className="text-sm text-gray-700">{reservation.form.notes}</p>
              </div>
            )}

            {/* 신청 정보 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>신청일시: {new Date(reservation.submittedAt).toLocaleString('ko-KR')}</span>
              </div>
              {reservation.reviewedAt && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>처리일시: {new Date(reservation.reviewedAt).toLocaleString('ko-KR')}</span>
                  {reservation.reviewedBy && (
                    <span className="ml-2">처리자: {reservation.reviewedBy}</span>
                  )}
                </div>
              )}
              {reservation.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">거절 사유:</span> {reservation.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {reservation.status === 'PENDING' && (
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              {!showRejectionForm ? (
                <>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    거절
                  </button>
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    승인
                  </button>
                </>
              ) : (
                <div className="w-full space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 사유를 입력해주세요
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="거절 사유를 상세히 입력해주세요..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowRejectionForm(false);
                        setRejectionReason('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      거절 확정
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}