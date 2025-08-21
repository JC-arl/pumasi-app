import React, { useState, useEffect } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import DashboardRentalUsage from '../../components/admin/DashboardRentalUsage';
import {
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { ReservationRequest } from '../../types/reservation';
import type { CheckoutItem } from '../../types/checkout';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { jeoubukMachinery } from '../../data/jeoubukMachinery';

// 일별 사용률 데이터 (최근 7일)
const dailyUsageData = [
  { date: '8/16', usage: 82, available: 18 },
  { date: '8/17', usage: 75, available: 25 },
  { date: '8/18', usage: 88, available: 12 },
  { date: '8/19', usage: 79, available: 21 },
  { date: '8/20', usage: 95, available: 5 },
  { date: '8/21', usage: 91, available: 9 },
  { date: '8/22', usage: 87, available: 13 },
];

const recentAlerts = [
  {
    id: 1,
    type: 'warning',
    title: '트랙터 T-001 정기점검 필요',
    message: '500시간 사용 완료, 정기점검이 필요합니다.',
    time: '10분 전',
  },
  {
    id: 2,
    type: 'info',
    title: '새로운 예약 요청',
    message: '김농부님이 경운기 대여를 요청했습니다.',
    time: '25분 전',
  },
  {
    id: 3,
    type: 'error',
    title: '반납 지연',
    message: '이씨네농장 트랙터 반납이 2시간 지연되었습니다.',
    time: '1시간 전',
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayReservations: 0,
    overdueReturns: 0,
    utilizationRate: 0,
    maintenanceIssues: 0,
  });

  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    const calculateStats = () => {
      // 예약 데이터 가져오기
      const reservationRequests: ReservationRequest[] = JSON.parse(
        localStorage.getItem('reservationRequests') || '[]'
      );

      // 출고/임대 중 데이터 가져오기
      const checkoutItems: CheckoutItem[] = JSON.parse(
        localStorage.getItem('checkoutItems') || '[]'
      );

      // 오늘 날짜
      const today = new Date().toDateString();

      // 오늘 예약 신청 수
      const todayReservations = reservationRequests.filter(req => 
        new Date(req.submittedAt).toDateString() === today
      ).length;

      // 지연 반납 계산
      const overdueReturns = checkoutItems.filter(item => {
        if (item.status !== 'CHECKED_OUT') return false;
        const endDate = new Date(item.endDate);
        const now = new Date();
        return now > endDate;
      }).length;

      // 가동률 계산 (임대 중인 농기계 / 전체 농기계)
      // 김천시 + 전북특별자치도 전체 농기계 수 계산
      const kimcheonTotalCount = kimcheonMachinery.reduce((total, machinery) => {
        return total + machinery.specifications.reduce((specTotal, spec) => specTotal + spec.totalCount, 0);
      }, 0);
      
      const jeoubukTotalCount = Object.values(jeoubukMachinery).reduce((total, equipmentList) => {
        return total + equipmentList.reduce((listTotal, equipment) => listTotal + equipment.totalCount, 0);
      }, 0);
      
      const totalAssets = kimcheonTotalCount + jeoubukTotalCount;
      const inUseAssets = checkoutItems.filter(item => item.status === 'CHECKED_OUT').length;
      const utilizationRate = totalAssets > 0 ? Math.round((inUseAssets / totalAssets) * 100 * 10) / 10 : 0;

      // 정비 필요 건수 (임의로 일부 계산)
      const maintenanceIssues = Math.floor(Math.random() * 3) + overdueReturns;

      setStats({
        todayReservations,
        overdueReturns,
        utilizationRate,
        maintenanceIssues,
      });

      // 최근 알림 생성
      const alerts = [];
      
      if (overdueReturns > 0) {
        alerts.push({
          id: 1,
          type: 'error',
          title: `반납 지연 ${overdueReturns}건`,
          message: `${overdueReturns}건의 농기계 반납이 지연되었습니다.`,
          time: '방금 전',
        });
      }

      if (todayReservations > 0) {
        alerts.push({
          id: 2,
          type: 'info',
          title: '새로운 예약 신청',
          message: `오늘 ${todayReservations}건의 새로운 예약 신청이 있습니다.`,
          time: '30분 전',
        });
      }

      if (maintenanceIssues > 0) {
        alerts.push({
          id: 3,
          type: 'warning',
          title: '정비 필요',
          message: `${maintenanceIssues}건의 농기계에 정비가 필요합니다.`,
          time: '1시간 전',
        });
      }

      // 기본 알림이 없으면 샘플 알림 추가
      if (alerts.length === 0) {
        alerts.push({
          id: 4,
          type: 'info',
          title: '시스템 정상 운영 중',
          message: '모든 시스템이 정상적으로 운영되고 있습니다.',
          time: '2시간 전',
        });
      }

      setRecentAlerts(alerts);
    };

    calculateStats();
    const interval = setInterval(calculateStats, 30000); // 30초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">대시보드 - 전체지역</h1>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          title="오늘 예약"
          value={stats.todayReservations}
          change={stats.todayReservations > 0 ? { value: `+${stats.todayReservations}`, type: 'increase' } : { value: '0', type: 'neutral' }}
          icon={<Calendar />}
        />
        <AdminCard
          title="지연 반납"
          value={stats.overdueReturns}
          change={stats.overdueReturns > 0 ? { value: `+${stats.overdueReturns}`, type: 'decrease' } : { value: '0', type: 'neutral' }}
          icon={<Clock />}
        />
        <AdminCard
          title="가동률"
          value={`${stats.utilizationRate}%`}
          change={{ value: `${stats.utilizationRate}%`, type: stats.utilizationRate > 70 ? 'increase' : 'decrease' }}
          icon={<Activity />}
        />
        <AdminCard
          title="정비 건수"
          value={stats.maintenanceIssues}
          change={stats.maintenanceIssues > 0 ? { value: `+${stats.maintenanceIssues}`, type: 'decrease' } : { value: '0', type: 'neutral' }}
          icon={<AlertTriangle />}
        />
      </div>

      {/* 날씨 및 농업 데이터 분석 섹션 - 상단 이동 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">날씨 및 농업 데이터 분석</h2>
        </div>
        <WeatherAnalysisDashboard />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 알림 및 작업 - 축소 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-medium text-gray-900">최근 알림</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-[280px] overflow-y-auto">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start space-x-2">
                  <div className={`flex-shrink-0 w-2 h-2 mt-1 rounded-full ${
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {alert.time}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">알림이 없습니다</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2 bg-gray-50 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-800">
              모든 알림 보기
            </button>
          </div>
        </div>

        {/* 장비별 현황 - 축소 */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-base font-medium text-gray-900 mb-4">장비별 예약 현황</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">트랙터</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '85%', backgroundColor: '#328E6E' }}></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">경운기</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '72%', backgroundColor: '#67AE6E' }}></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">콤바인</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '68%', backgroundColor: '#90C67C' }}></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">파종기</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '45%', backgroundColor: '#E1EEBC' }}></div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 일별 사용률 차트 - 전체 폭 */}
      <div className="bg-white shadow rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">일별 사용률</h3>
          <div className="flex items-center text-sm">
            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#328E6E'}}></div>
            <span className="text-gray-600 font-medium">사용률(%)</span>
          </div>
        </div>
        <div className="h-[280px] p-6">
          {/* 막대 그래프로만 표시 - 식별 용이 */}
          <div className="flex items-end justify-between h-full space-x-4">
            {dailyUsageData.map((day, index) => (
              <div key={day.date} className="flex flex-col items-center flex-1">
                <div className="relative w-full h-full mb-4 flex items-end">
                  {/* 사용률만 막대로 표시 */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-700 hover:opacity-80 cursor-pointer"
                    style={{
                      backgroundColor: day.usage >= 90 ? '#dc2626' : 
                                     day.usage >= 70 ? '#328E6E' : 
                                     day.usage >= 50 ? '#67AE6E' : '#90C67C',
                      height: `${Math.max((day.usage / 100) * 180, 16)}px`,
                    }}
                    title={`${day.date} 사용률: ${day.usage}%`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-gray-900 mb-1">{day.usage}%</div>
                  <div className="text-sm text-gray-500">{day.date}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 범례 - 사용률 구간별 색상 설명 */}
          <div className="flex justify-center mt-6 space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#dc2626'}}></div>
              <span className="text-gray-600">90%+ (포화)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#328E6E'}}></div>
              <span className="text-gray-600">70-89% (높음)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#67AE6E'}}></div>
              <span className="text-gray-600">50-69% (보통)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#90C67C'}}></div>
              <span className="text-gray-600">50% 미만 (여유)</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// 트랙터 임대 추세 라인차트 컴포넌트 (Recharts 사용)
function TractorRentalChart({ data }: { data: Array<{ "년": number; "월": number; "임대 횟수": number }> }) {
  // 1-12월 모든 월 데이터 확보 (누락 월은 0으로 채움)
  const completeData = [];
  for (let month = 1; month <= 12; month++) {
    const existingData = data.find(d => d.월 === month);
    completeData.push({
      month: month,
      monthName: `${month}월`,
      count: existingData?.["임대 횟수"] || 0,
      year: existingData?.년 || 2022
    });
  }

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border border-gray-600">
          <p className="font-semibold text-base">{`${data.monthName}`}</p>
          <p className="text-gray-200 text-sm mt-1">
            <span className="font-medium">{`임대 횟수: ${data.count}회`}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // 커스텀 점 컴포넌트
  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    return <circle cx={cx} cy={cy} r={3} fill="#328E6E" stroke="white" strokeWidth={2} />;
  };

  // 커스텀 액티브 점 컴포넌트
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props;
    return <circle cx={cx} cy={cy} r={5} fill="#1e7a5f" stroke="white" strokeWidth={2} />;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={completeData}
        margin={{ top: 24, right: 24, bottom: 32, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis 
          dataKey="month"
          domain={[1, 12]}
          type="number"
          scale="linear"
          ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          interval={0}
          tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
          axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
          tickLine={{ stroke: '#d1d5db' }}
          tickMargin={8}
        />
        <YAxis 
          allowDecimals={false}
          tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
          axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
          tickLine={{ stroke: '#d1d5db' }}
          tickMargin={8}
          label={{ 
            value: '임대 횟수', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: '14px', fill: '#374151', fontWeight: 600 }
          }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ stroke: '#328E6E', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '8px',
            fontSize: '14px',
            fontWeight: 600
          }}
          iconType="line"
        />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#328E6E" 
          strokeWidth={2}
          name="트랙터 임대 횟수"
          dot={<CustomDot />}
          activeDot={<CustomActiveDot />}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// 날씨 분석 대시보드 메인 컴포넌트
function WeatherAnalysisDashboard() {
  const [region, setRegion] = useState('전주');
  const [monthlyPrecipData, setMonthlyPrecipData] = useState<any>(null);
  const [monthlyTempData, setMonthlyTempData] = useState<any>(null);

  // 데이터 로드 (월별 데이터만)
  useEffect(() => {
    const loadMonthlyData = async () => {
      try {
        const [monthlyPrecipRes, monthlyTempRes] = await Promise.all([
          fetch('/data/monthly_precip_all.json'),
          fetch('/data/monthly_temp_all.json')
        ]);
        const monthlyPrecipData = await monthlyPrecipRes.json();
        const monthlyTempData = await monthlyTempRes.json();
        
        setMonthlyPrecipData(monthlyPrecipData);
        setMonthlyTempData(monthlyTempData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    loadMonthlyData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 상단 - 농기계 임대 사용현황 */}
      <DashboardRentalUsage />

      {/* 지역 선택 컨트롤 */}
      <RegionControls
        region={region}
        onRegionChange={setRegion}
      />

      {/* 하단 - 2열: 월별 기온 & 월별 강수량 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 좌측: 월별 기온 차트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <MonthlyTemp
            monthlyData={monthlyTempData}
            region={region}
          />
        </div>

        {/* 우측: 월별 강수량 차트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <MonthlyPrecip
            monthlyData={monthlyPrecipData}
            region={region}
          />
        </div>
      </div>
    </div>
  );
}

// 지역 선택 컨트롤 (개선된 가독성)
function RegionControls({ 
  region, 
  onRegionChange 
}: {
  region: string;
  onRegionChange: (region: string) => void;
}) {
  const regions = ['전주', '임실', '정읍', '장수', '김천시 중앙', '김천시 남부', '김천시 북부'];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지역 선택
          </label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 text-black"
            style={{
              borderColor: '#328E6E',
              '--tw-ring-color': '#328E6E'
            } as React.CSSProperties}
          >
            {regions.map(regionName => (
              <option key={regionName} value={regionName} className="text-black bg-white">
                {regionName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


// 월별 기온 차트
function MonthlyTemp({ 
  monthlyData, 
  region 
}: { 
  monthlyData: any; 
  region: string; 
}) {
  const title = '월별 기온';
  const chartData = monthlyData ? getMonthly(monthlyData, region, 'temperature') : null;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-[280px]">
        {chartData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ value: '°C', angle: 0, position: 'insideTopLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}°C`, '평균 기온']}
                labelFormatter={(label: any) => `${label}월`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#F97316" 
                strokeWidth={2}
                dot={{ fill: '#F97316', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">데이터 로딩 중...</div>
        )}
      </div>
    </>
  );
}

// 월별 강수량 차트
function MonthlyPrecip({ 
  monthlyData, 
  region 
}: { 
  monthlyData: any; 
  region: string; 
}) {
  const title = '월별 강수량';
  const chartData = monthlyData ? getMonthly(monthlyData, region, 'precipitation') : null;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-[280px]">
        {chartData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                label={{ value: 'mm', angle: 0, position: 'insideTopLeft' }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value}mm`, '강수량']}
                labelFormatter={(label: any) => `${label}월`}
              />
              <Bar dataKey="value" fill="#4F9CF9" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">데이터 로딩 중...</div>
        )}
      </div>
    </>
  );
}

// 헬퍼 함수들
function fillMonths(data: Array<{ month: number; [key: string]: any }>) {
  const result = [];
  for (let month = 1; month <= 12; month++) {
    const existing = data.find(item => item.month === month);
    result.push(existing || { month, ...Object.keys(data[0] || {}).reduce((acc, key) => {
      if (key !== 'month') acc[key] = 0;
      return acc;
    }, {} as any) });
  }
  return result;
}

function fillDays(year: number, month: number, data: Array<{ day: number; [key: string]: any }>) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];
  
  for (let day = 1; day <= daysInMonth; day++) {
    const existing = data.find(item => item.day === day);
    if (existing) {
      result.push(existing);
    } else {
      const defaultValues = Object.keys(data[0] || {}).reduce((acc, key) => {
        if (key === 'day') acc[key] = day;
        else if (key === 'precipitation') acc[key] = 0;
        else if (key === 'temperature') acc[key] = null;
        else acc[key] = null;
        return acc;
      }, {} as any);
      result.push({ day, ...defaultValues });
    }
  }
  return result;
}

// 월별 데이터 처리 헬퍼 함수
function getMonthly(data: any, region: string, type: 'temperature' | 'precipitation') {
  if (!data || !data.regions || !data.regions[region]) return null;
  
  const regionData = data.regions[region];
  const processedData = regionData.map((item: any) => {
    const value = type === 'temperature' 
      ? item['월평균기온(°C)'] 
      : item['월총강수량(mm)'];
    
    return {
      month: item['월'],
      value: value
    };
  });
  
  // 1-12월 모든 달 보정
  const result = [];
  for (let month = 1; month <= 12; month++) {
    const existing = processedData.find((item: any) => item.month === month);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        month,
        value: type === 'precipitation' ? 0 : null
      });
    }
  }
  
  return result;
}

