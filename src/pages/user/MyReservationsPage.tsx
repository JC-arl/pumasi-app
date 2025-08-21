import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { getReservations, cancelReservationAndRestoreInventory, type ClientReservation } from '../../utils/reservationUtils';
import { createReservationNotification } from '../../utils/notificationUtils';

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ClientReservation[]>([]);
  const [selectedTab, setSelectedTab] = useState<'reserved' | 'cancelled'>('reserved');

  useEffect(() => {
    const loadReservations = () => {
      const allReservations = getReservations();
      setReservations(allReservations);
    };

    loadReservations();
    // 페이지가 포커스될 때마다 예약 목록 새로고침
    const handleFocus = () => loadReservations();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const filteredReservations = reservations.filter(reservation => {
    if (selectedTab === 'reserved') return reservation.status === 'RESERVED';
    if (selectedTab === 'cancelled') return reservation.status === 'CANCELLED';
    return true;
  });

  const handleCancelReservation = (reservation: ClientReservation) => {
    const confirmCancel = confirm(
      `다음 예약을 취소하시겠습니까?\n\n` +
      `농기계: ${reservation.machineryName} (${reservation.specification})\n` +
      `임대료: ₩${reservation.rentalPrice.toLocaleString()}/일\n\n` +
      `취소 시 재고가 복구됩니다.`
    );

    if (confirmCancel) {
      const success = cancelReservationAndRestoreInventory(reservation);
      if (success) {
        // 예약 취소 알림 생성
        createReservationNotification('cancelled', reservation.machineryName, reservation.id);
        
        alert('예약이 취소되었습니다. 재고가 복구되었습니다.');
        // 예약 목록 새로고침
        const updatedReservations = getReservations();
        setReservations(updatedReservations);
      } else {
        alert('예약 취소 중 오류가 발생했습니다.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{backgroundColor: '#CBDCEB', color: '#133E87'}}>
            <CheckCircle className="w-3 h-3 mr-1" />
            예약 완료
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            취소됨
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">내 예약</h1>

      {/* 탭 메뉴 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('reserved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'reserved'
                ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={selectedTab === 'reserved' ? {
              borderBottomColor: '#133E87',
              color: '#133E87'
            } : {}}
          >
            예약 중 ({reservations.filter(r => r.status === 'RESERVED').length})
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
            취소됨 ({reservations.filter(r => r.status === 'CANCELLED').length})
          </button>
        </nav>
      </div>

      {/* 예약 목록 */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {selectedTab === 'reserved' && '진행 중인 예약이 없습니다'}
            {selectedTab === 'cancelled' && '취소된 예약이 없습니다'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            농기계를 예약하면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <div 
              key={reservation.id} 
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => navigate(`/machinery/${reservation.machineryId}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 transition-colors">
                    {reservation.machineryName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reservation.specification} - {reservation.manufacturer}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(reservation.status)}
                  {reservation.status === 'RESERVED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 카드 클릭 이벤트 방지
                        handleCancelReservation(reservation);
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="예약 취소"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {reservation.officeName}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(reservation.reservationDate)}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    ₩{reservation.rentalPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/일</span>
                </div>
                <div className="text-xs text-gray-400">
                  예약번호: {reservation.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}