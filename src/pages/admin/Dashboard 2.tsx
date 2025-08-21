import React, { useState, useEffect } from 'react';
import AdminCard from '../../components/admin/AdminCard';
import {
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import type { ReservationRequest } from '../../types/reservation';
import type { CheckoutItem } from '../../types/checkout';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { jeoubukMachinery } from '../../data/jeoubukMachinery';
import tractorMonthlyStats from '../../data/tractor_monthly_stats.json';

// 일별 사용률 데이터 (최근 7일)
const dailyUsageData = [
  { date: '12/14', usage: 82, available: 18 },
  { date: '12/15', usage: 75, available: 25 },
  { date: '12/16', usage: 88, available: 12 },
  { date: '12/17', usage: 79, available: 21 },
  { date: '12/18', usage: 95, available: 5 },
  { date: '12/19', usage: 91, available: 9 },
  { date: '12/20', usage: 87, available: 13 },
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
      
      const jeoubukTotalCount = jeoubukMachinery.reduce((total, machinery) => {
        return total + machinery.specifications.reduce((specTotal, spec) => specTotal + spec.totalCount, 0);
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
        <p className="mt-2 text-sm text-gray-700">
          김천시 및 전북특별자치도 농기계 임대 현황을 한눈에 확인하세요
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 연간 트랙터 임대 추세 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">연간 트랙터 임대 추세</h3>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#328E6E'}}></div>
              <span className="text-gray-600">트랙터 임대 횟수</span>
            </div>
          </div>
          <div className="h-[300px] p-4">
            <TractorRentalChart data={tractorMonthlyStats} />
          </div>
        </div>

        {/* 알림 및 작업 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">최근 알림</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {alert.time}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">알림이 없습니다</p>
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              모든 알림 보기
            </button>
          </div>
        </div>
      </div>

      {/* 추가 차트 - 사용률 히트맵 및 장비별 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 일별 사용률 차트 - 막대 그래프만 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">일별 사용률</h3>
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#328E6E'}}></div>
              <span className="text-gray-600">사용률(%)</span>
            </div>
          </div>
          <div className="h-[200px] p-4">
            {/* 막대 그래프로만 표시 - 식별 용이 */}
            <div className="flex items-end justify-between h-full space-x-3">
              {dailyUsageData.map((day, index) => (
                <div key={day.date} className="flex flex-col items-center flex-1">
                  <div className="relative w-full h-full mb-3 flex items-end">
                    {/* 사용률만 막대로 표시 */}
                    <div 
                      className="w-full rounded-t-lg transition-all duration-700 hover:opacity-80 cursor-pointer"
                      style={{
                        backgroundColor: day.usage >= 90 ? '#dc2626' : 
                                       day.usage >= 70 ? '#328E6E' : 
                                       day.usage >= 50 ? '#67AE6E' : '#90C67C',
                        height: `${Math.max((day.usage / 100) * 140, 12)}px`,
                      }}
                      title={`${day.date} 사용률: ${day.usage}%`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900 mb-1">{day.usage}%</div>
                    <div className="text-xs text-gray-500">{day.date}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 범례 - 사용률 구간별 색상 설명 */}
            <div className="flex justify-center mt-4 space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#dc2626'}}></div>
                <span className="text-gray-600">90%+ (포화)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#328E6E'}}></div>
                <span className="text-gray-600">70-89% (높음)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#67AE6E'}}></div>
                <span className="text-gray-600">50-69% (보통)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: '#90C67C'}}></div>
                <span className="text-gray-600">50% 미만 (여유)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 장비별 현황 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">장비별 예약 현황</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">트랙터</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '85%', backgroundColor: '#328E6E' }}></div>
                </div>
                <span className="text-sm text-gray-500">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">경운기</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '72%', backgroundColor: '#67AE6E' }}></div>
                </div>
                <span className="text-sm text-gray-500">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">콤바인</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '68%', backgroundColor: '#90C67C' }}></div>
                </div>
                <span className="text-sm text-gray-500">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">파종기</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '45%', backgroundColor: '#E1EEBC' }}></div>
                </div>
                <span className="text-sm text-gray-500">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 트랙터 임대 추세 라인차트 컴포넌트
function TractorRentalChart({ data }: { data: Array<{ "년": number; "월": number; "임대 횟수": number }> }) {
  // 월별로 데이터 정렬
  const sortedData = [...data].sort((a, b) => a.월 - b.월);
  
  // 최대값과 최소값 계산 (Y축 스케일을 위해)
  const maxValue = Math.max(...sortedData.map(d => d["임대 횟수"]));
  const minValue = Math.min(...sortedData.map(d => d["임대 횟수"]));
  const range = maxValue - minValue;
  const paddedMax = maxValue + (range * 0.1); // 10% 패딩
  const paddedMin = Math.max(0, minValue - (range * 0.1));
  
  // 월 이름 맵핑
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  // SVG 차트 크기
  const chartWidth = 100;
  const chartHeight = 80;
  const padding = { top: 10, right: 10, bottom: 20, left: 15 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  
  // 좌표 계산 함수
  const getX = (index: number) => (index / (sortedData.length - 1)) * innerWidth + padding.left;
  const getY = (value: number) => chartHeight - padding.bottom - ((value - paddedMin) / (paddedMax - paddedMin)) * innerHeight;
  
  // 라인 경로 생성
  const linePath = sortedData.map((d, index) => {
    const x = getX(index);
    const y = getY(d["임대 횟수"]);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
        {/* Y축 그리드 라인 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight - padding.bottom - (ratio * innerHeight);
          const value = Math.round(paddedMin + (paddedMax - paddedMin) * ratio);
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth="0.3"
              />
              <text
                x={padding.left - 2}
                y={y + 1}
                textAnchor="end"
                fontSize="3"
                fill="#9ca3af"
              >
                {value}
              </text>
            </g>
          );
        })}
        
        {/* X축 */}
        <line
          x1={padding.left}
          y1={chartHeight - padding.bottom}
          x2={chartWidth - padding.right}
          y2={chartHeight - padding.bottom}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        
        {/* Y축 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={chartHeight - padding.bottom}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        
        {/* 라인 */}
        <path
          d={linePath}
          fill="none"
          stroke="#328E6E"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 데이터 포인트 */}
        {sortedData.map((d, index) => {
          const x = getX(index);
          const y = getY(d["임대 횟수"]);
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="1.2"
                fill="#328E6E"
                stroke="white"
                strokeWidth="0.5"
              />
              {/* 툴팁 트리거 영역 */}
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="transparent"
                className="cursor-pointer hover:fill-gray-100"
              >
                <title>{monthNames[d.월 - 1]}: {d["임대 횟수"]}회</title>
              </circle>
            </g>
          );
        })}
        
        {/* X축 라벨 */}
        {sortedData.map((d, index) => {
          const x = getX(index);
          const shouldShow = index % 2 === 0 || sortedData.length <= 6; // 격월 표시 또는 데이터가 적으면 모두 표시
          if (!shouldShow) return null;
          
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding.bottom + 6}
              textAnchor="middle"
              fontSize="3"
              fill="#6b7280"
            >
              {d.월}월
            </text>
          );
        })}
      </svg>
      
      {/* 호버 정보 표시를 위한 인터랙티브 오버레이 */}
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-5" style={{ pointerEvents: 'none' }}>
        {sortedData.map((d, index) => (
          <div
            key={index}
            className="relative group"
            style={{ 
              pointerEvents: 'auto',
              width: `${100 / sortedData.length}%`,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
              {monthNames[d.월 - 1]}: {d["임대 횟수"]}회
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}