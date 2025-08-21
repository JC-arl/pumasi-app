import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Clock,
  ArrowRight,
  Zap,
  Star,
  Eye
} from 'lucide-react';
import AssetCard from '../../components/user/AssetCard';
import WeatherBadge from '../../components/user/WeatherBadge';
import { getReservations, type ClientReservation } from '../../utils/reservationUtils';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { mockRentalOffices } from '../../data/mockData';
import type { Machinery } from '../../types/rental';
import AccessibilityModal from '../../components/user/AccessibilityModal';
import { colors } from '../../styles/colors';

// 임시 데이터
const mockWeather = {
  date: '2024-08-19',
  condition: 'SUNNY' as const,
  precipitationProbability: 10,
  workSuitabilityScore: 85,
  recommendation: 'OPTIMAL' as const,
};

const mockPopularAssets = [
  {
    id: 'asset-1',
    name: '대형 트랙터',
    model: 'John Deere 8345R',
    hourlyRate: 35000,
    dailyRate: 250000,
    office: {
      name: '춘천농기계센터',
      address: '강원도 춘천시',
      deliveryAvailable: true,
    },
  },
  {
    id: 'asset-2', 
    name: '중형 경운기',
    model: 'Kubota L3901',
    hourlyRate: 15000,
    dailyRate: 100000,
    office: {
      name: '원주농기계센터',
      address: '강원도 원주시',
      deliveryAvailable: false,
    },
  },
  {
    id: 'asset-3',
    name: '콤바인',
    model: 'New Holland CR8.90',
    hourlyRate: 45000,
    dailyRate: 320000,
    office: {
      name: '강릉농기계센터',
      address: '강원도 강릉시',
      deliveryAvailable: true,
    },
  },
];

const workTypes = [
  { id: 'plowing', name: '밭갈이', icon: '🚜', recommended: true },
  { id: 'seeding', name: '파종', icon: '🌱', recommended: true },
  { id: 'harvesting', name: '수확', icon: '🌾', recommended: false },
  { id: 'spraying', name: '방제', icon: '💧', recommended: true },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentReservations, setRecentReservations] = useState<ClientReservation[]>([]);
  const [popularMachinery, setPopularMachinery] = useState<Machinery[]>([]);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);

  useEffect(() => {
    // 실제 예약 내역을 불러와서 최근 3개만 표시
    const allReservations = getReservations();
    const recent = allReservations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    setRecentReservations(recent);

    // 인기 장비 계산 - 예약 횟수 기준
    const machineryReservationCount = new Map<string, number>();
    
    allReservations.forEach(reservation => {
      const count = machineryReservationCount.get(reservation.machineryId) || 0;
      machineryReservationCount.set(reservation.machineryId, count + 1);
    });

    // 예약이 있는 농기계들을 예약 횟수 순으로 정렬
    const popularIds = Array.from(machineryReservationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    // 예약이 없는 경우, 기본적으로 처음 3개 농기계를 표시
    const finalIds = popularIds.length > 0 ? popularIds : kimcheonMachinery.slice(0, 3).map(m => m.id);
    
    const popular = kimcheonMachinery.filter(machinery => finalIds.includes(machinery.id));
    setPopularMachinery(popular);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색어와 함께 지도 페이지로 이동
      navigate(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen pb-20 lg:pb-8" style={{backgroundColor: '#F3F3E0'}}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r" style={{background: `linear-gradient(to right, ${colors.primary.main}, ${colors.primary.light})`}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              품앗이 - Pumasi
            </h1>
          </div>

          {/* Search Bar - Enhanced */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="mb-2 text-center">
              <p className="text-white text-sm font-medium">
                🔍 원하는 농기계를 빠르게 찾아보세요
              </p>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-white rounded-xl shadow-lg border-4 border-white transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6" style={{color: colors.primary.main}} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-28 py-5 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none text-lg font-medium"
                  style={{}}
                  placeholder="장비명, 작업 종류, 지역을 검색하세요..."
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-8 text-white rounded-lg font-semibold text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  style={{backgroundColor: colors.button.primary}}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
                >
                  검색
                </button>
              </div>
            </form>
            <div className="mt-3 text-center">
              <p className="text-white/80 text-xs">
                💡 예시: "트랙터", "김천 콤바인", "파종 장비" 등
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 예약</h2>
            <Link
              to="/map?quick=nearest"
              className="block w-full text-white text-center py-4 rounded-lg transition-colors font-medium"
              style={{backgroundColor: colors.button.primary}}
              onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primaryHover}
              onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = colors.button.primary}
            >
              <Zap className="h-5 w-5 inline mr-2" />
              가장 가까운 장비 찾기
            </Link>
            <div className="mt-4 space-y-3">
              <Link
                to="/map"
                className="flex items-center text-sm text-gray-600 transition-colors"
                onMouseEnter={(e) => {(e.target as HTMLElement).style.color = colors.primary.light}}
                onMouseLeave={(e) => {(e.target as HTMLElement).style.color = '#4B5563'}}
              >
                <MapPin className="h-4 w-4 mr-2" />
                지도에서 찾기
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
              <Link
                to="/my/reservations"
                className="flex items-center text-sm text-gray-600 transition-colors"
                onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.color = colors.primary.light}}
                onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.color = '#4B5563'}}
              >
                <Calendar className="h-4 w-4 mr-2" />
                내 예약 현황
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
              <button
                onClick={() => setAccessibilityModalOpen(true)}
                className="flex items-center text-sm text-gray-600 w-full transition-colors"
                onMouseEnter={(e) => {(e.target as HTMLElement).style.color = colors.primary.main}}
                onMouseLeave={(e) => {(e.target as HTMLElement).style.color = '#4B5563'}}
              >
                <Eye className="h-4 w-4 mr-2" />
                접근성 설정 (고령자 모드)
                <ArrowRight className="h-4 w-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>

{/* Popular Equipment - 임시로 숨김 */}
        {false && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">인기 장비</h2>
            <Link
              to="/map"
              className="font-medium flex items-center transition-colors"
              style={{color: colors.primary.main}}
              onMouseEnter={(e) => {(e.target as HTMLElement).style.color = colors.primary.light}}
              onMouseLeave={(e) => {(e.target as HTMLElement).style.color = colors.primary.main}}
            >
              전체보기
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMachinery.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">아직 인기 장비 데이터가 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">예약이 늘어나면 인기 장비가 표시됩니다</p>
              </div>
            ) : (
              popularMachinery.map((machinery) => {
                const office = mockRentalOffices.find(o => o.id === machinery.officeId);
                const firstSpec = machinery.specifications[0];
                return (
                  <div
                    key={machinery.id}
                    onClick={() => navigate(`/machinery/${machinery.id}`)}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{machinery.name}</h3>
                      <TrendingUp className="h-5 w-5" style={{color: colors.primary.light}} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{machinery.category}</p>
                    {office && (
                      <p className="text-xs text-gray-500 mb-3">{office.name}</p>
                    )}
                    {firstSpec && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold" style={{color: colors.primary.main}}>
                          ₩{firstSpec.rentalPrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">/일</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* Recent Activity & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reservations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 예약</h2>
            <div className="space-y-3">
              {recentReservations.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">아직 예약 내역이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-1">농기계를 예약해보세요</p>
                </div>
              ) : (
                recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{reservation.machineryName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(reservation.createdAt).toLocaleDateString('ko-KR')} 예약
                      </div>
                      <div className="text-xs text-gray-400">
                        {reservation.officeName}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reservation.status === 'RESERVED' 
                        ? 'text-white'
                        : 'bg-red-100 text-red-800'
                    }`}
                    style={reservation.status === 'RESERVED' ? {backgroundColor: colors.primary.accent, color: colors.primary.main} : {}}>
                      {reservation.status === 'RESERVED' ? '예약 중' : '취소됨'}
                    </span>
                  </div>
                ))
              )}
              <Link
                to="/my/reservations"
                className="block text-center py-2 transition-colors"
                style={{color: colors.primary.main}}
                onMouseEnter={(e) => {(e.target as HTMLElement).style.color = colors.primary.light}}
                onMouseLeave={(e) => {(e.target as HTMLElement).style.color = colors.primary.main}}
              >
                전체 예약 내역 보기
              </Link>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">사용 팁</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">예약 전 날씨 확인</div>
                  <div className="text-sm text-gray-500">비 예보 시 작업 일정을 조정하세요</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">미리 예약하기</div>
                  <div className="text-sm text-gray-500">농번기에는 2-3일 전 예약을 권장합니다</div>
                </div>
              </div>
              <Link
                to="/help"
                className="block text-sm mt-4 transition-colors"
                style={{color: colors.primary.main}}
                onMouseEnter={(e) => {(e.target as HTMLElement).style.color = colors.primary.light}}
                onMouseLeave={(e) => {(e.target as HTMLElement).style.color = colors.primary.main}}
              >
                더 많은 팁 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Modal */}
      <AccessibilityModal 
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />
    </div>
  );
}