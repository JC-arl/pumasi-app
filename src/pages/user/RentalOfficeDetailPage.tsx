import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Filter } from 'lucide-react';
import { mockRentalOffices } from '../../data/mockData';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { getAvailableCount } from '../../utils/reservationUtils';
import type { Machinery } from '../../types/rental';

export default function RentalOfficeDetailPage() {
  const { officeId } = useParams<{ officeId: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const office = mockRentalOffices.find(o => o.id === officeId);
  
  // 해당 임대소의 농기계 목록 필터링
  const officeMachinery = kimcheonMachinery.filter(
    (machinery: Machinery) => machinery.officeId === officeId
  );

  // 농기계 종류를 큰 카테고리로 분류하는 함수
  const getMachineryMainCategory = (machineryName: string, category: string) => {
    const name = machineryName.toLowerCase();
    const cat = category.toLowerCase();
    
    // 트랙터류
    if (name.includes('트랙터')) return '트랙터류';
    
    // 경운/정지 작업
    if (name.includes('경운기') || name.includes('로터리') || name.includes('쟁기') || 
        cat.includes('경운') || cat.includes('정지') || cat.includes('쟁기') || cat.includes('논갈이')) {
      return '경운·정지 장비';
    }
    
    // 수확 장비
    if (name.includes('수확기') || name.includes('콤바인') || name.includes('탈곡기') || 
        cat.includes('수확') || cat.includes('탈곡') || name.includes('벼수확기')) {
      return '수확 장비';
    }
    
    // 파종/이앙 장비
    if (name.includes('파종기') || name.includes('이앙기') || name.includes('모내기') || 
        cat.includes('파종') || cat.includes('이앙')) {
      return '파종·이앙 장비';
    }
    
    // 방제/살포 장비
    if (name.includes('방제기') || name.includes('살포기') || name.includes('분무기') || 
        cat.includes('방제') || cat.includes('살포') || cat.includes('퇴비살포')) {
      return '방제·살포 장비';
    }
    
    // 운반/적재 장비
    if (name.includes('트럭') || name.includes('트레일러') || name.includes('운반') || 
        cat.includes('운반') || name.includes('로더') || cat.includes('로우더')) {
      return '운반·적재 장비';
    }
    
    // 굴착/토목 장비
    if (name.includes('굴삭기') || name.includes('포클레인') || name.includes('백호') || 
        cat.includes('굴착') || name.includes('미니') && name.includes('굴')) {
      return '굴착·토목 장비';
    }
    
    // 가공/파쇄 장비
    if (name.includes('파쇄기') || name.includes('절단기') || name.includes('분쇄기') || 
        cat.includes('파쇄') || cat.includes('절단')) {
      return '가공·파쇄 장비';
    }
    
    // 기타
    return '기타 장비';
  };

  // 큰 카테고리 목록 추출
  const mainCategories = useMemo(() => {
    const categorySet = new Set<string>();
    officeMachinery.forEach(machinery => {
      const mainCategory = getMachineryMainCategory(machinery.name, machinery.category);
      categorySet.add(mainCategory);
    });
    return Array.from(categorySet).sort();
  }, [officeMachinery]);

  // 필터링된 농기계 목록
  const filteredMachinery = useMemo(() => {
    let filtered = officeMachinery;

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(machinery => 
        getMachineryMainCategory(machinery.name, machinery.category) === selectedCategory
      );
    }

    // 재고 상태 필터링
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(machinery => {
        const availableCount = machinery.specifications.reduce(
          (sum, spec) => sum + getAvailableCount(spec), 0
        );
        if (availabilityFilter === 'available') {
          return availableCount > 0;
        } else {
          return availableCount === 0;
        }
      });
    }

    return filtered;
  }, [officeMachinery, selectedCategory, availabilityFilter]);

  if (!office) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">임대소를 찾을 수 없습니다</h2>
          <button 
            onClick={() => navigate('/map')}
            className="mt-4 text-green-600 hover:text-green-700"
          >
            지도로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleMachineryClick = (machinery: Machinery) => {
    navigate(`/machinery/${machinery.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        뒤로가기
      </button>

      {/* 임대소 정보 헤더 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{office.name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-gray-400" />
            {office.address}
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-gray-400" />
            {office.phone}
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-400" />
            {office.operatingHours}
          </div>
        </div>

        {office.description && (
          <p className="mt-4 text-gray-600">{office.description}</p>
        )}
      </div>

      {/* 농기계 목록 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">보유 농기계</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Filter className="h-4 w-4 mr-1" />
            {filteredMachinery.length}개 / {officeMachinery.length}개
          </div>
        </div>

        {/* 필터링 옵션 */}
        {officeMachinery.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 카테고리 필터 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">농기계 종류</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">전체 종류</option>
                  {mainCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 재고 상태 필터 */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">재고 상태</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="available">예약 가능</option>
                  <option value="unavailable">품절</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {filteredMachinery.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {officeMachinery.length === 0 
                ? '등록된 농기계가 없습니다.' 
                : '필터 조건에 맞는 농기계가 없습니다.'}
            </p>
            {officeMachinery.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                다른 조건으로 검색해보세요.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMachinery.map((machinery) => {
              const totalCount = machinery.specifications.reduce(
                (sum, spec) => sum + spec.totalCount, 0
              );
              const availableCount = machinery.specifications.reduce(
                (sum, spec) => sum + getAvailableCount(spec), 0
              );

              return (
                <div
                  key={machinery.id}
                  onClick={() => handleMachineryClick(machinery)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{machinery.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{machinery.category}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {availableCount}/{totalCount}
                      </span>
                      <span className="text-sm text-gray-500">대</span>
                    </div>
                    
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${totalCount > 0 ? (availableCount / totalCount) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {availableCount > 0 ? '예약 가능' : '예약 불가'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}