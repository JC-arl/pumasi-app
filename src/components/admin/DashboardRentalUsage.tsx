import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// 데이터 타입 정의
interface EquipmentData {
  카테고리: string;
  총대여일수: number;
}

interface MonthlyData {
  연도: number;
  월: number;
  장비: EquipmentData[];
}

interface RegionData {
  지역: string;
  월별: MonthlyData[];
}

interface RentalData {
  regions: RegionData[];
}

// 카테고리별 색상 매핑
const CATEGORY_COLORS = {
  '트랙터류': '#328E6E',
  '수확기류': '#F97316', 
  '경운정지류': '#4F9CF9',
  '파종이앙류': '#8B5CF6',
  '방제살포류': '#EF4444',
  '기타': '#6B7280'
};

const CATEGORIES = ['트랙터류', '수확기류', '경운정지류', '파종이앙류', '방제살포류', '기타'];

export default function DashboardRentalUsage() {
  const [selectedRegion, setSelectedRegion] = useState('김천시'); // 기본값을 김천시로 변경
  const [selectedYear, setSelectedYear] = useState(2021);
  const [selectedCategory, setSelectedCategory] = useState('트랙터류');
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<RentalData | null>(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/all_regions_monthly_rental_days_remapped_fix.json');
        const data = await response.json();
        
        // 김천시 데이터 추가 (임시 데이터)
        const kimcheonData = {
          "지역": "김천시",
          "월별": [
            {
              "연도": 2021,
              "월": 1,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 45 },
                { "카테고리": "수확기류", "총대여일수": 12 },
                { "카테고리": "경운정지류", "총대여일수": 38 },
                { "카테고리": "파종이앙류", "총대여일수": 15 },
                { "카테고리": "방제살포류", "총대여일수": 22 },
                { "카테고리": "기타", "총대여일수": 18 }
              ]
            },
            {
              "연도": 2021,
              "월": 2,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 52 },
                { "카테고리": "수확기류", "총대여일수": 8 },
                { "카테고리": "경운정지류", "총대여일수": 42 },
                { "카테고리": "파종이앙류", "총대여일수": 18 },
                { "카테고리": "방제살포류", "총대여일수": 25 },
                { "카테고리": "기타", "총대여일수": 20 }
              ]
            },
            {
              "연도": 2021,
              "월": 3,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 68 },
                { "카테고리": "수확기류", "총대여일수": 5 },
                { "카테고리": "경운정지류", "총대여일수": 55 },
                { "카테고리": "파종이앙류", "총대여일수": 32 },
                { "카테고리": "방제살포류", "총대여일수": 28 },
                { "카테고리": "기타", "총대여일수": 23 }
              ]
            },
            {
              "연도": 2021,
              "월": 4,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 78 },
                { "카테고리": "수확기류", "총대여일수": 3 },
                { "카테고리": "경운정지류", "총대여일수": 65 },
                { "카테고리": "파종이앙류", "총대여일수": 48 },
                { "카테고리": "방제살포류", "총대여일수": 35 },
                { "카테고리": "기타", "총대여일수": 28 }
              ]
            },
            {
              "연도": 2021,
              "월": 5,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 85 },
                { "카테고리": "수확기류", "총대여일수": 8 },
                { "카테고리": "경운정지류", "총대여일수": 72 },
                { "카테고리": "파종이앙류", "총대여일수": 62 },
                { "카테고리": "방제살포류", "총대여일수": 45 },
                { "카테고리": "기타", "총대여일수": 35 }
              ]
            },
            {
              "연도": 2021,
              "월": 6,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 72 },
                { "카테고리": "수확기류", "총대여일수": 15 },
                { "카테고리": "경운정지류", "총대여일수": 58 },
                { "카테고리": "파종이앙류", "총대여일수": 38 },
                { "카테고리": "방제살포류", "총대여일수": 52 },
                { "카테고리": "기타", "총대여일수": 32 }
              ]
            },
            {
              "연도": 2021,
              "월": 7,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 65 },
                { "카테고리": "수확기류", "총대여일수": 22 },
                { "카테고리": "경운정지류", "총대여일수": 45 },
                { "카테고리": "파종이앙류", "총대여일수": 25 },
                { "카테고리": "방제살포류", "총대여일수": 68 },
                { "카테고리": "기타", "총대여일수": 28 }
              ]
            },
            {
              "연도": 2021,
              "월": 8,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 58 },
                { "카테고리": "수확기류", "총대여일수": 35 },
                { "카테고리": "경운정지류", "총대여일수": 38 },
                { "카테고리": "파종이앙류", "총대여일수": 18 },
                { "카테고리": "방제살포류", "총대여일수": 55 },
                { "카테고리": "기타", "총대여일수": 25 }
              ]
            },
            {
              "연도": 2021,
              "월": 9,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 62 },
                { "카테고리": "수확기류", "총대여일수": 78 },
                { "카테고리": "경운정지류", "총대여일수": 42 },
                { "카테고리": "파종이앙류", "총대여일수": 22 },
                { "카테고리": "방제살포류", "총대여일수": 48 },
                { "카테고리": "기타", "총대여일수": 32 }
              ]
            },
            {
              "연도": 2021,
              "월": 10,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 75 },
                { "카테고리": "수확기류", "총대여일수": 95 },
                { "카테고리": "경운정지류", "총대여일수": 52 },
                { "카테고리": "파종이앙류", "총대여일수": 28 },
                { "카테고리": "방제살포류", "총대여일수": 35 },
                { "카테고리": "기타", "총대여일수": 38 }
              ]
            },
            {
              "연도": 2021,
              "월": 11,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 48 },
                { "카테고리": "수확기류", "총대여일수": 42 },
                { "카테고리": "경운정지류", "총대여일수": 35 },
                { "카테고리": "파종이앙류", "총대여일수": 15 },
                { "카테고리": "방제살포류", "총대여일수": 22 },
                { "카테고리": "기타", "총대여일수": 28 }
              ]
            },
            {
              "연도": 2021,
              "월": 12,
              "장비": [
                { "카테고리": "트랙터류", "총대여일수": 35 },
                { "카테고리": "수확기류", "총대여일수": 18 },
                { "카테고리": "경운정지류", "총대여일수": 25 },
                { "카테고리": "파종이앙류", "총대여일수": 8 },
                { "카테고리": "방제살포류", "총대여일수": 15 },
                { "카테고리": "기타", "총대여일수": 22 }
              ]
            }
          ]
        };
        
        // 기존 데이터에 김천시 데이터 추가
        const extendedData = {
          regions: [...data.regions, kimcheonData]
        };
        
        dataRef.current = extendedData;
        setLoading(false);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 헬퍼 함수들
  const getRegionYears = (data: RentalData, region: string): number[] => {
    const regionData = data.regions.find(r => r.지역 === region);
    if (!regionData) return [];
    
    const years = [...new Set(regionData.월별.map(m => m.연도))];
    return years.sort((a, b) => a - b);
  };


  const getLineSeries = (data: RentalData, region: string, year: number, category: string) => {
    const regionData = data.regions.find(r => r.지역 === region);
    if (!regionData) return [];

    const yearData = regionData.월별.filter(m => m.연도 === year);
    const result = [];

    for (let month = 1; month <= 12; month++) {
      const monthData = yearData.find(m => m.월 === month);
      const equipment = monthData?.장비?.find(e => e.카테고리 === category);
      
      result.push({
        월: month,
        value: equipment?.총대여일수 || 0
      });
    }

    return result;
  };


  // 메모화된 데이터
  const { availableRegions, availableYears, lineData } = useMemo(() => {
    if (!dataRef.current) {
      return {
        availableRegions: [],
        availableYears: [],
        lineData: []
      };
    }

    const regions = dataRef.current.regions.map(r => r.지역);
    const years = getRegionYears(dataRef.current, selectedRegion);
    const line = getLineSeries(dataRef.current, selectedRegion, selectedYear, selectedCategory);

    return {
      availableRegions: regions,
      availableYears: years,
      lineData: line
    };
  }, [selectedRegion, selectedYear, selectedCategory, loading]);

  // 연도가 변경되면 유효한 연도로 조정
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">농기계 임대 데이터를 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지역 선택
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-100"
              style={{
                borderColor: '#328E6E',
                '--tw-ring-color': '#328E6E'
              } as React.CSSProperties}
            >
              {availableRegions.map(region => (
                <option key={region} value={region} className="text-gray-800 bg-white">
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연도 선택
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-100"
              style={{
                borderColor: '#328E6E',
                '--tw-ring-color': '#328E6E'
              } as React.CSSProperties}
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="text-gray-800 bg-white">
                  {year}년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 선택
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-100"
              style={{
                borderColor: '#328E6E',
                '--tw-ring-color': '#328E6E'
              } as React.CSSProperties}
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category} className="text-gray-800 bg-white">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 농기계별 월별 추이 차트 - 가로로 길게 */}
      <div className="bg-white shadow rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          {selectedCategory} 월별 대여 추이 ({selectedRegion} {selectedYear}년)
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 30, right: 50, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="월"
                tick={{ fontSize: 14, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}월`}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 14, fill: '#6b7280' }}
                label={{ value: '대여일수 (일)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}일`, selectedCategory]}
                labelFormatter={(label: any) => `${selectedYear}년 ${label}월`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS]}
                strokeWidth={4}
                dot={{ 
                  fill: CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS], 
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#fff'
                }}
                activeDot={{ 
                  r: 8,
                  fill: CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS],
                  strokeWidth: 3,
                  stroke: '#fff'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}