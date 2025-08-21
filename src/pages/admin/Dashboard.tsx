import React from 'react';
import AdminCard from '../../components/admin/AdminCard';
import {
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
} from 'lucide-react';
// 차트 라이브러리는 임시로 주석 처리
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from 'recharts';

// const weeklyData = [
//   { name: '월', reservations: 35, usage: 420, maintenance: 24 },
//   { name: '화', reservations: 28, usage: 380, maintenance: 18 },
//   { name: '수', reservations: 42, usage: 520, maintenance: 32 },
//   { name: '목', reservations: 38, usage: 450, maintenance: 28 },
//   { name: '금', reservations: 45, usage: 580, maintenance: 36 },
//   { name: '토', reservations: 52, usage: 640, maintenance: 42 },
//   { name: '일', reservations: 42, usage: 520, maintenance: 35 },
// ];

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

// 간단한 더미 통계 데이터
const mockStats = {
  todayReservations: 25,
  overdueReturns: 3,
  utilizationRate: 78.2,
  maintenanceIssues: 5,
};

export default function Dashboard() {

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-700">
          농기계 임대 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          title="오늘 예약"
          value={mockStats.todayReservations}
          change={{ value: '+12%', type: 'increase' }}
          icon={<Calendar />}
        />
        <AdminCard
          title="지연 반납"
          value={mockStats.overdueReturns}
          change={{ value: '-25%', type: 'increase' }}
          icon={<Clock />}
        />
        <AdminCard
          title="가동률"
          value={`${mockStats.utilizationRate}%`}
          change={{ value: '+5.4%', type: 'increase' }}
          icon={<Activity />}
        />
        <AdminCard
          title="정비 건수"
          value={mockStats.maintenanceIssues}
          change={{ value: '+2', type: 'decrease' }}
          icon={<AlertTriangle />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 주간 트렌드 차트 */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">주간 트렌드</h3>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                예약수
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                사용시간
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                정비시간
              </div>
            </div>
          </div>
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">차트 로딩 중...</p>
          </div>
        </div>

        {/* 알림 및 작업 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">최근 알림</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAlerts.map((alert) => (
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
            ))}
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
        {/* 사용률 차트 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">일별 사용률</h3>
          <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">사용률 차트</p>
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
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm text-gray-500">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">경운기</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm text-gray-500">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">콤바인</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm text-gray-500">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">파종기</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
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