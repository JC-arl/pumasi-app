import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, CheckCircle, XCircle, Clock, AlertCircle, Truck, Eye, X } from 'lucide-react';
import { getReservations, cancelReservationAndRestoreInventory, type ClientReservation } from '../../utils/reservationUtils';
import { createReservationNotification } from '../../utils/notificationUtils';
import type { ReservationRequest } from '../../types/reservation';
import type { CheckoutItem } from '../../types/checkout';
import { RESERVATION_STATUS_MAP, type ReservationStatusType } from '../../types/reservationStatus';
import ReservationDetailModal from '../../components/user/ReservationDetailModal';

export default function MyReservationsPage() {
  // const navigate = useNavigate();
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [newReservations, setNewReservations] = useState<ReservationRequest[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'applied' | 'cancelled'>('applied');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const loadReservations = () => {
      // 기존 예약 시스템
      const allReservations = getReservations();
      setReservations(allReservations);

      // 새로운 예약 시스템
      const requests = JSON.parse(localStorage.getItem('reservationRequests') || '[]');
      setNewReservations(requests);

      // 출고/반납 시스템
      const checkouts = JSON.parse(localStorage.getItem('checkoutItems') || '[]');
      setCheckoutItems(checkouts);
    };

    loadReservations();
    // 페이지가 포커스될 때마다 예약 목록 새로고침
    const handleFocus = () => loadReservations();
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(loadReservations, 2000); // 2초마다 새로고침
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const handleCancelNewReservation = (reservationId: string) => {
    const reservation = newReservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const canCancel = ['PENDING', 'APPROVED'].includes(reservation.status);
    if (!canCancel) {
      alert('이 상태에서는 취소할 수 없습니다.');
      return;
    }

    const confirmCancel = confirm(
      `예약을 취소하시겠습니까?\n\n` +
      `농기계: ${reservation.form.machineryName}\n` +
      `신청자: ${reservation.form.farmerName}\n\n` +
      `취소 후에는 되돌릴 수 없습니다.`
    );

    if (confirmCancel) {
      const updatedReservations = newReservations.map(r => 
        r.id === reservationId 
          ? { ...r, status: 'CANCELLED' as const }
          : r
      );
      
      localStorage.setItem('reservationRequests', JSON.stringify(updatedReservations));
      setNewReservations(updatedReservations);

      // 예약 취소 알림 생성
      createReservationNotification('cancelled', reservation.form.machineryName, reservationId);
      
      alert('예약이 취소되었습니다.');
    }
  };

  // const filteredReservations = reservations.filter(reservation => {
  //   if (selectedTab === 'reserved') return reservation.status === 'RESERVED';
  //   if (selectedTab === 'cancelled') return reservation.status === 'CANCELLED';
  //   return true;
  // });

  // 통합된 예약 데이터 생성
  const combinedReservations = useMemo(() => {
    const combined = [];

    // 새로운 예약 시스템의 데이터를 통합 형태로 변환
    newReservations.forEach(req => {
      let status: ReservationStatusType = req.status as ReservationStatusType;
      
      // 승인된 예약이 출고되었는지 확인
      const checkoutItem = checkoutItems.find(item => item.reservationId === req.id);
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
              status = 'PENDING_RETURN'; // 연체된 경우도 반납 대기로 표시
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

      combined.push({
        id: req.id,
        type: 'new' as const,
        status,
        machineryName: req.form.machineryName,
        officeName: req.form.officeName,
        farmerName: req.form.farmerName,
        farmerPhone: req.form.farmerPhone,
        startDate: req.form.startDate,
        endDate: req.form.endDate,
        deliveryRequired: req.form.deliveryRequired,
        farmAddress: req.form.farmAddress,
        submittedAt: req.submittedAt,
        rejectionReason: req.rejectionReason,
        checkoutDate: checkoutItem?.checkoutDate,
        returnDate: checkoutItem?.returnDate,
      });
    });

    return combined;
  }, [newReservations, checkoutItems]);

  // 탭별 필터링 및 정렬
  const filteredCombinedReservations = useMemo(() => {
    const filtered = combinedReservations.filter(reservation => {
      if (selectedTab === 'applied') {
        return ['PENDING', 'APPROVED', 'CHECKED_OUT', 'PENDING_RETURN', 'RETURNED'].includes(reservation.status);
      }
      if (selectedTab === 'cancelled') {
        return ['REJECTED', 'CANCELLED'].includes(reservation.status);
      }
      return true;
    });

    // 취소된 항목은 최신순으로 정렬 (최신 상단)
    if (selectedTab === 'cancelled') {
      return filtered.sort((a, b) => {
        const aDate = new Date(a.submittedAt);
        const bDate = new Date(b.submittedAt);
        return bDate.getTime() - aDate.getTime(); // 최신 항목이 먼저 오도록
      });
    }

    // 신청된 항목도 최신순으로 정렬
    return filtered.sort((a, b) => {
      const aDate = new Date(a.submittedAt);
      const bDate = new Date(b.submittedAt);
      return bDate.getTime() - aDate.getTime(); // 최신 항목이 먼저 오도록
    });
  }, [combinedReservations, selectedTab]);

  // const handleCancelReservation = (reservation: ClientReservation) => {
  //   const confirmCancel = confirm(
  //     `다음 예약을 취소하시겠습니까?\n\n` +
  //     `농기계: ${reservation.machineryName} (${reservation.specification})\n` +
  //     `임대료: ₩${reservation.rentalPrice.toLocaleString()}/일\n\n` +
  //     `취소 시 재고가 복구됩니다.`
  //   );

  //   if (confirmCancel) {
  //     const success = cancelReservationAndRestoreInventory(reservation);
  //     if (success) {
  //       // 예약 취소 알림 생성
  //       createReservationNotification('cancelled', reservation.machineryName, reservation.id);
        
  //       alert('예약이 취소되었습니다. 재고가 복구되었습니다.');
  //       // 예약 목록 새로고침
  //       const updatedReservations = getReservations();
  //       setReservations(updatedReservations);
  //     } else {
  //       alert('예약 취소 중 오류가 발생했습니다.');
  //     }
  //   }
  // };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleString('ko-KR', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case 'RESERVED':
  //       return (
  //         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{backgroundColor: '#CBDCEB', color: '#133E87'}}>
  //           <CheckCircle className="w-3 h-3 mr-1" />
  //           예약 완료
  //         </span>
  //       );
  //     case 'CANCELLED':
  //       return (
  //         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
  //           <XCircle className="w-3 h-3 mr-1" />
  //           취소됨
  //         </span>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const getStatusBadgeWithIcon = (status: ReservationStatusType) => {
    const statusInfo = RESERVATION_STATUS_MAP[status];
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
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">내 예약</h1>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('applied')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'applied'
                ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={selectedTab === 'applied' ? {
              borderBottomColor: '#133E87',
              color: '#133E87'
            } : {}}
          >
            신청 내역 ({combinedReservations.filter(r => ['PENDING', 'APPROVED', 'CHECKED_OUT', 'PENDING_RETURN', 'RETURNED'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setSelectedTab('cancelled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'cancelled'
                ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={selectedTab === 'cancelled' ? {
              borderBottomColor: '#133E87',
              color: '#133E87'
            } : {}}
          >
            취소됨 ({combinedReservations.filter(r => ['REJECTED', 'CANCELLED'].includes(r.status)).length})
          </button>
        </nav>
      </div>

      {/* 통합 예약 목록 */}
      {filteredCombinedReservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {selectedTab === 'applied' && '신청한 예약이 없습니다'}
            {selectedTab === 'cancelled' && '취소된 예약이 없습니다'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            농기계 예약을 신청하면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCombinedReservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {/* 상태 진행 표시 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {reservation.machineryName}
                  </h3>
                  {getStatusBadgeWithIcon(reservation.status)}
                </div>
                
                {/* 진행 단계 표시 */}
                <div className="mt-4">
                  {/* 진행 바 */}
                  <div className="flex items-center justify-between mb-2">
                    {['PENDING', 'APPROVED', 'CHECKED_OUT', 'PENDING_RETURN', 'RETURNED'].map((status, index) => {
                      const currentIndex = ['PENDING', 'APPROVED', 'CHECKED_OUT', 'PENDING_RETURN', 'RETURNED'].indexOf(reservation.status);
                      const isActive = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      
                      return (
                        <React.Fragment key={status}>
                          <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                              isActive 
                                ? isCurrent 
                                  ? 'bg-blue-600 border-blue-600 text-white' 
                                  : 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-gray-100 border-gray-300 text-gray-400'
                            }`}>
                              <span className="text-xs font-medium">{index + 1}</span>
                            </div>
                          </div>
                          {index < 4 && (
                            <div className={`flex-1 h-0.5 mx-2 ${
                              index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  
                  {/* 단계 라벨 */}
                  <div className="flex justify-between text-xs">
                    <span className="text-center text-gray-500 w-8">예약<br/>대기</span>
                    <span className="text-center text-gray-500 w-8">예약<br/>완료</span>
                    <span className="text-center text-gray-500 w-8">사용중</span>
                    <span className="text-center text-gray-500 w-8">반납<br/>대기</span>
                    <span className="text-center text-gray-500 w-8">반납<br/>완료</span>
                  </div>
                </div>
              </div>

              {/* 예약 상세 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {reservation.officeName}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {reservation.startDate} ~ {reservation.endDate}
                </div>
                <div className="flex items-center text-gray-600">
                  <Truck className="w-4 h-4 mr-2" />
                  {reservation.deliveryRequired ? '배송 요청' : '직접 수령'}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {reservation.farmerPhone}
                </div>
              </div>

              {/* 상태별 추가 정보 */}
              {reservation.status === 'CHECKED_OUT' && reservation.checkoutDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <div className="flex items-start">
                    <Truck className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
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
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
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
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">거절 사유</p>
                      <p className="text-sm text-red-700 mt-1">{reservation.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 하단 정보 및 액션 버튼 */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  신청일시: {new Date(reservation.submittedAt).toLocaleString('ko-KR')}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {['PENDING', 'APPROVED'].includes(reservation.status) && (
                      <button
                        onClick={() => handleCancelNewReservation(reservation.id)}
                        className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <X className="w-4 h-4 mr-1" />
                        취소
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedReservation(reservation);
                        setIsDetailModalOpen(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      상세보기
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {reservation.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReservation(null);
          }}
        />
      )}
    </div>
  );
}