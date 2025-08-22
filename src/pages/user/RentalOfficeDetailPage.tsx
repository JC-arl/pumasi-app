import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Filter } from 'lucide-react';
import { mockRentalOffices } from '../../data/mockData';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { jeoubukMachinery } from '../../data/jeoubukMachinery';
import { getAvailableCount } from '../../utils/reservationUtils';
import type { Machinery } from '../../types/rental';

export default function RentalOfficeDetailPage() {
  const { officeId } = useParams<{ officeId: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const office = mockRentalOffices.find(o => o.id === officeId);
  
  // jeoubukMachinery를 Machinery 형태로 변환
  const convertJeoubukToMachinery = (): Machinery[] => {
    const result: Machinery[] = [];
    
    Object.entries(jeoubukMachinery).forEach(([officeName, equipmentList]) => {
      const officeId = `jeoubuk-${officeName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      const machineryMap = new Map<string, Machinery>();
      
      equipmentList.forEach((equipment, index) => {
        const machineryKey = equipment.농기계명;
        
        if (!machineryMap.has(machineryKey)) {
          machineryMap.set(machineryKey, {
            id: `${officeId}-${equipment.농기계명.replace(/[^a-zA-Z0-9]/g, '')}-${Math.random().toString(36).substring(2, 11)}`,
            name: equipment.농기계명,
            image: `/images/machinery/${equipment.농기계명}.jpg`,
            category: equipment.주작업 || '일반',
            officeId: officeId,
            specifications: []
          });
        }
        
        const machinery = machineryMap.get(machineryKey)!;
        machinery.specifications.push({
          id: `${equipment.표준코드}-${index}`,
          specification: equipment.규격 || '표준',
          manufacturer: equipment.제조사 || '제조사 미상',
          totalCount: equipment.totalCount || 1,
          availableCount: equipment.availableCount || 1,
          rentalPrice: equipment.임대금액 || 0,
          description: equipment.주작업 || '',
          standardCode: equipment.표준코드 || '',
        });
      });
      
      result.push(...Array.from(machineryMap.values()));
    });
    
    return result;
  };
  
  // 전체 농기계 목록 (김천 + 전북)
  const allMachinery = [...kimcheonMachinery, ...convertJeoubukToMachinery()];
  
  // 해당 임대소의 농기계 목록 필터링
  let officeMachinery = allMachinery.filter(
    (machinery: Machinery) => machinery.officeId === officeId
  );
  
  // jeoubuk_tools.json에 없는 전라북도 지역에 임시 농기계 데이터 추가
  if (officeMachinery.length === 0 && office?.description?.includes('전북특별자치도')) {
    const mockMachinery: Machinery[] = [
      {
        id: `${officeId}-tractor-001`,
        name: "트랙터",
        image: "/images/machinery/트랙터.jpg",
        category: "경운작업",
        officeId: officeId!,
        specifications: [
          {
            id: "tractor-spec-1",
            specification: "40마력급",
            manufacturer: "대동공업(주)",
            totalCount: 3,
            availableCount: 2,
            rentalPrice: 15000,
            description: "일반 경운작업용",
            standardCode: "001-01-0001-1001",
          },
          {
            id: "tractor-spec-2", 
            specification: "60마력급",
            manufacturer: "동양물산(주)",
            totalCount: 2,
            availableCount: 1,
            rentalPrice: 20000,
            description: "중작업용",
            standardCode: "001-01-0002-1001",
          }
        ]
      },
      {
        id: `${officeId}-cultivator-001`,
        name: "경운기",
        image: "/images/machinery/경운기.jpg", 
        category: "경운작업",
        officeId: officeId!,
        specifications: [
          {
            id: "cultivator-spec-1",
            specification: "15마력급",
            manufacturer: "대동공업(주)",
            totalCount: 5,
            availableCount: 3,
            rentalPrice: 8000,
            description: "소규모 경운작업용",
            standardCode: "001-02-0001-1001",
          }
        ]
      },
      {
        id: `${officeId}-rotary-001`,
        name: "로터베이터",
        image: "/images/machinery/로터베이터.jpg",
        category: "경운작업", 
        officeId: officeId!,
        specifications: [
          {
            id: "rotary-spec-1",
            specification: "120cm급",
            manufacturer: "영진기계(주)",
            totalCount: 4,
            availableCount: 2,
            rentalPrice: 5000,
            description: "토양정리용",
            standardCode: "001-18-0001-1108",
          }
        ]
      },
      {
        id: `${officeId}-harvester-001`,
        name: "콤바인",
        image: "/images/machinery/콤바인.jpg",
        category: "수확작업",
        officeId: officeId!,
        specifications: [
          {
            id: "harvester-spec-1", 
            specification: "4조식",
            manufacturer: "동양물산(주)",
            totalCount: 2,
            availableCount: 1,
            rentalPrice: 35000,
            description: "벼 수확용",
            standardCode: "001-15-0001-1201",
          }
        ]
      },
      {
        id: `${officeId}-sprayer-001`,
        name: "방제기",
        image: "/images/machinery/방제기.jpg",
        category: "방제작업",
        officeId: officeId!,
        specifications: [
          {
            id: "sprayer-spec-1",
            specification: "500L급",
            manufacturer: "성창기계(주)", 
            totalCount: 3,
            availableCount: 2,
            rentalPrice: 12000,
            description: "농약살포용",
            standardCode: "001-07-0001-1301",
          }
        ]
      }
    ];
    
    officeMachinery = mockMachinery;
  }

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