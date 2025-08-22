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

// 7개 계열 카테고리
const CATEGORIES = [
  '트랙터 계열',
  '수확기 계열', 
  '파쇄기 계열',
  '탈곡기 계열',
  '이양기 계열',
  '살포기 계열',
  '기타 계열'
];

// 카테고리별 색상 매핑
const CATEGORY_COLORS = {
  '트랙터 계열': '#328E6E',
  '수확기 계열': '#F97316', 
  '파쇄기 계열': '#4F9CF9',
  '탈곡기 계열': '#8B5CF6',
  '이양기 계열': '#EF4444',
  '살포기 계열': '#10B981',
  '기타 계열': '#6B7280'
};

// 헬퍼 함수들

/** 월 1..12 강제 채움 + 카테고리 누락 0 채움 */
function fillMonths(rows: {월:number, 장비:{카테고리:string, 총대여일수:number}[]}[], cats: string[]) {
  const byMonth: Record<number, any> = {};
  for (let m=1;m<=12;m++){
    byMonth[m] = { 월: m };
    cats.forEach(c => { byMonth[m][c] = 0; });
  }
  for (const r of rows) {
    const m = r.월;
    if (!byMonth[m]) continue;
    for (const it of r.장비 || []) {
      if (cats.includes(it.카테고리)) byMonth[m][it.카테고리] += it.총대여일수 || 0;
    }
  }
  return Array.from({length:12}, (_,i)=>byMonth[i+1]);
}

/** 지역+연도 → 월별 카테고리 합산 테이블 */
function getMonthly(json:any, region:string, year:number){
  if (!json) return [];
  const cats = ["트랙터 계열","수확기 계열","파쇄기 계열","탈곡기 계열","이양기 계열","살포기 계열","기타 계열"];
  const r = (json?.regions || []).find((x:any)=>x.지역===region);
  const rows = (r?.월별 || []).filter((x:any)=>x.연도===year);
  return fillMonths(rows, cats);
}

/** 연간 합계 파이 시리즈 */
function getPieSeries(monthly:any[]){
  if (!Array.isArray(monthly)) return [];
  const cats = Object.keys(monthly[0]||{}).filter(k=>k!=="월");
  const sums: Record<string, number> = {};
  cats.forEach(c=>sums[c]=0);
  monthly.forEach(row=>{
    cats.forEach(c=> sums[c] += row[c]||0 );
  });
  return cats.map(c=>({ 카테고리:c, value:sums[c] })).filter(item => item.value > 0);
}

export default function DashboardRentalUsage() {
  const [region, setRegion] = useState<'정읍'|'장수'|'완주'|'전주'>('정읍');
  const [year, setYear] = useState<number>(2021);
  const [selectedCategory, setSelectedCategory] = useState('트랙터 계열');
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<RentalData | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 기존 데이터 로드
        const response = await fetch('/data/all_regions_monthly_rental_days_remapped_fix.json');
        const data = await response.json();
        dataRef.current = data;

        // 2025 예측 데이터 로드
        try {
          const predResponse = await fetch('/analysis/predicted_demand_2025.json');
          const predData = await predResponse.json();
          setPredictionData(predData);
        } catch (predError) {
          console.warn('2025 예측 데이터 로드 실패:', predError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const data = dataRef.current;

  // 사용 가능한 지역 및 연도
  const availableRegions = useMemo(() => {
    return data ? data.regions.map(r => r.지역) : [];
  }, [data]);

  const availableYears = useMemo(() => {
    if (!data) return [];
    const regionData = data.regions.find(r => r.지역 === region);
    if (!regionData) return [];
    const years = [...new Set(regionData.월별.map(m => m.연도))];
    return years.sort((a, b) => b - a); // 최신년도 먼저
  }, [data, region]);

  // 파생 데이터 메모이제이션
  const monthlyData = useMemo(() => {
    // 2025년이고 예측 데이터가 있으면 예측 데이터 사용
    if (year === 2025 && predictionData) {
      return predictionData.monthly.map((month: any) => ({
        월: month.월,
        '트랙터 계열': month['트랙터 계열'] || 0,
        '수확기 계열': month['수확기 계열'] || 0,
        '파쇄기 계열': month['파쇄기 계열'] || 0,
        '탈곡기 계열': month['탈곡기 계열'] || 0,
        '이양기 계열': month['이양기 계열'] || 0,
        '살포기 계열': month['살포기 계열'] || 0,
        '기타 계열': 0 // 예측에는 기타 계열 없음
      }));
    }
    // 일반 데이터 사용
    return getMonthly(data, region, year);
  }, [data, region, year, predictionData]);
  
  const lineSeries = useMemo(() => monthlyData.map(d => ({ 월: d.월, value: d[selectedCategory] || 0 })), [monthlyData, selectedCategory]);

  // 연도가 변경되면 유효한 연도로 조정
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(year)) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  // 데이터 로드 가드 - 모든 hooks 호출 후에 위치
  if (!data) {
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
              value={region}
              onChange={(e) => setRegion(e.target.value as '정읍'|'장수'|'완주'|'전주')}
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-100"
              style={{
                borderColor: '#328E6E',
                '--tw-ring-color': '#328E6E'
              } as React.CSSProperties}
            >
              {availableRegions.map(regionName => (
                <option key={regionName} value={regionName} className="text-gray-800 bg-white">
                  {regionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연도 선택
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-gray-800 dark:text-gray-100"
              style={{
                borderColor: '#328E6E',
                '--tw-ring-color': '#328E6E'
              } as React.CSSProperties}
            >
              {availableYears.map(yearOption => (
                <option key={yearOption} value={yearOption} className="text-gray-800 bg-white">
                  {yearOption === 2025 && predictionData ? `${yearOption}년(예측)` : `${yearOption}년`}
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

      {/* 농기계 계열 월별 추이 차트 - 전체 폭 */}
      <div className="bg-white shadow rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          {selectedCategory} 월별 추이 ({region} {year === 2025 && predictionData ? `${year}년(예측)` : `${year}년`})
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineSeries} margin={{ top: 30, right: 50, left: 30, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="월"
                tick={{ fontSize: 14, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}월`}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 14, fill: '#6b7280' }}
                label={{ 
                  value: year === 2025 && predictionData ? '수요예측 (건)' : '대여일수 (일)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { textAnchor: 'middle' } 
                }}
              />
              <Tooltip 
                formatter={(value: number) => [
                  `${value}${year === 2025 && predictionData ? '건' : '일'}`, 
                  selectedCategory
                ]}
                labelFormatter={(label: number) => `${year}년 ${label}월`}
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
                stroke={CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS] || '#328E6E'}
                strokeWidth={4}
                dot={{ 
                  fill: CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS] || '#328E6E', 
                  r: 6,
                  strokeWidth: 2,
                  stroke: '#fff'
                }}
                activeDot={{ 
                  r: 8,
                  fill: CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS] || '#328E6E',
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