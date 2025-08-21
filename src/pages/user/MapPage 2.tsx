import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import RentalOfficeList from '../../components/RentalOfficeList';
import RentalOfficeModal from '../../components/RentalOfficeModal';
import Map from '../../components/Map';
import { mockRentalOffices } from '../../data/mockData';
import type { RentalOffice } from '../../types/rental';

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedOffice, setSelectedOffice] = useState<RentalOffice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  // 도/특별시/광역시 목록 추출
  const provinces = useMemo(() => {
    const provinceSet = new Set<string>();
    mockRentalOffices.forEach(office => {
      const addressParts = office.address.split(' ');
      if (addressParts.length > 0) {
        let province = addressParts[0];
        if (province && !province.includes('소재지') && province !== 'nan') {
          // 전라북도를 전북특별자치도로 통합
          if (province === '전라북도') {
            province = '전북특별자치도';
          }
          provinceSet.add(province);
        }
      }
    });
    return Array.from(provinceSet).sort();
  }, []);

  // 선택된 도에 따른 시/군/구 목록
  const cities = useMemo(() => {
    if (selectedProvince === 'all') return [];
    
    const citySet = new Set<string>();
    mockRentalOffices.forEach(office => {
      const addressParts = office.address.split(' ');
      let province = addressParts[0];
      // 전라북도를 전북특별자치도로 통합
      if (province === '전라북도') {
        province = '전북특별자치도';
      }
      if (province === selectedProvince && addressParts[1] && addressParts[1] !== 'nan') {
        citySet.add(addressParts[1]);
      }
    });
    return Array.from(citySet).sort();
  }, [selectedProvince]);

  // 필터링된 임대소 목록
  const filteredOffices = useMemo(() => {
    let offices = mockRentalOffices;

    // 도 필터링
    if (selectedProvince !== 'all') {
      offices = offices.filter(office => {
        const addressParts = office.address.split(' ');
        let province = addressParts[0];
        // 전라북도를 전북특별자치도로 통합
        if (province === '전라북도') {
          province = '전북특별자치도';
        }
        return province === selectedProvince;
      });
    }

    // 시/군/구 필터링
    if (selectedCity !== 'all') {
      offices = offices.filter(office => {
        const addressParts = office.address.split(' ');
        return addressParts[1] === selectedCity;
      });
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      offices = offices.filter(
        (office) =>
          office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          office.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          office.availableMachinery.some((machinery) =>
            machinery.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return offices;
  }, [searchQuery, selectedProvince, selectedCity]);

  // 필터 변경 핸들러
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity('all'); // 도가 변경되면 시/군/구 초기화
  };

  const handleOfficeSelect = (office: RentalOffice) => {
    // 임대소 리스트 클릭 시 바로 상세 페이지로 이동
    navigate(`/office/${office.id}`);
  };

  const handleMarkerClick = (office: RentalOffice) => {
    navigate(`/office/${office.id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">농기계 지도</h1>
      
      <div className="mb-6 space-y-4">
        <SearchBar onSearch={setSearchQuery} />
        
        {/* 지역 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">지역 필터</h3>
          
          {/* 도/특별시/광역시 필터 */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 mb-2 block">도/특별시/광역시</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleProvinceChange('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedProvince === 'all'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
                style={selectedProvince === 'all' ? {
                  backgroundColor: '#CBDCEB',
                  color: '#133E87',
                  borderColor: '#608BC1'
                } : {}}
              >
                전체
              </button>
              {provinces.map((province) => (
                <button
                  key={province}
                  onClick={() => handleProvinceChange(province)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedProvince === province
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                  style={selectedProvince === province ? {
                    backgroundColor: '#CBDCEB',
                    color: '#133E87',
                    borderColor: '#608BC1'
                  } : {}}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>

          {/* 시/군/구 필터 */}
          {cities.length > 0 && (
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-2 block">시/군/구</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCity === 'all'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                  style={selectedCity === 'all' ? {
                    backgroundColor: '#608BC1',
                    color: '#ffffff',
                    borderColor: '#608BC1'
                  } : {}}
                >
                  전체
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCity === city
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                    style={selectedCity === city ? {
                      backgroundColor: '#608BC1',
                      color: '#ffffff',
                      borderColor: '#608BC1'
                    } : {}}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 필터링 결과 표시 */}
          <div className="text-xs text-gray-500">
            {selectedProvince === 'all' 
              ? `전체 ${mockRentalOffices.length}개 임대소` 
              : `${selectedProvince}${selectedCity !== 'all' ? ` ${selectedCity}` : ''}: ${filteredOffices.length}개 임대소`}
            {searchQuery && ` (검색: "${searchQuery}")`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 사이드바 - 임대소 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 max-h-[600px] overflow-y-auto">
            <RentalOfficeList
              offices={filteredOffices}
              onOfficeSelect={handleOfficeSelect}
              selectedOffice={selectedOffice}
            />
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="h-[600px]">
              <Map
                rentalOffices={filteredOffices}
                onMarkerClick={handleMarkerClick}
                selectedOffice={selectedOffice}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <RentalOfficeModal
        office={selectedOffice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}