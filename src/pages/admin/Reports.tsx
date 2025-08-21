import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Calendar, Package, Users } from 'lucide-react';

// 간단한 통계 데이터
const mockReportData = {
  monthly: {
    reservations: [45, 52, 48, 61, 55, 67, 72, 58, 63, 69, 55, 60],
    equipment: [12, 15, 13, 18, 16, 20, 22, 19, 21, 23, 18, 20],
    users: [8, 12, 10, 15, 13, 18, 20, 16, 19, 22, 17, 19],
  },
  topEquipment: [
    { name: '대형트랙터', usage: 156, percentage: 78 },
    { name: '중형경운기', usage: 134, percentage: 67 },
    { name: '콤바인', usage: 98, percentage: 49 },
    { name: '소형트랙터', usage: 87, percentage: 44 },
    { name: '파종기', usage: 65, percentage: 33 },
  ],
  summary: {
    totalReservations: 728,
    activeUsers: 245,
    equipmentUtilization: 67.3,
    revenue: 45600000
  }
};

const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMetric, setSelectedMetric] = useState('reservations');

  const handleExport = () => {
    const csvContent = [
      '월,예약건수,장비이용,신규사용자',
      ...mockReportData.monthly.reservations.map((value, index) => 
        `${months[index]},${value},${mockReportData.monthly.equipment[index]},${mockReportData.monthly.users[index]}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `농기계_이용통계_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case 'equipment':
        return mockReportData.monthly.equipment;
      case 'users':
        return mockReportData.monthly.users;
      default:
        return mockReportData.monthly.reservations;
    }
  };

  const getMetricColor = () => {
    switch (selectedMetric) {
      case 'equipment':
        return '#608BC1';
      case 'users':
        return '#CBDCEB';
      default:
        return '#133E87';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">통계·분석</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 임대 서비스 이용 현황을 분석하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="weekly">주간</option>
            <option value="monthly">월간</option>
            <option value="yearly">연간</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 예약 건수
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockReportData.summary.totalReservations.toLocaleString()}건
                </dd>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% (전월 대비)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  활성 사용자
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockReportData.summary.activeUsers.toLocaleString()}명
                </dd>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% (전월 대비)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  장비 가동률
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {mockReportData.summary.equipmentUtilization}%
                </dd>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.2% (전월 대비)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  월 매출액
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {(mockReportData.summary.revenue / 10000).toLocaleString()}만원
                </dd>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% (전월 대비)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 월별 트렌드 차트 */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">월별 이용 현황</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMetric('reservations')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedMetric === 'reservations' 
                      ? 'text-white' 
                      : 'text-gray-600 bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedMetric === 'reservations' ? '#133E87' : undefined
                  }}
                >
                  예약건수
                </button>
                <button
                  onClick={() => setSelectedMetric('equipment')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedMetric === 'equipment' 
                      ? 'text-white' 
                      : 'text-gray-600 bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: selectedMetric === 'equipment' ? '#608BC1' : undefined
                  }}
                >
                  장비이용
                </button>
                <button
                  onClick={() => setSelectedMetric('users')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    selectedMetric === 'users' 
                      ? 'bg-gray-400 text-white' 
                      : 'text-gray-600 bg-gray-100'
                  }`}
                >
                  신규사용자
                </button>
              </div>
            </div>

            {/* 간단한 바 차트 */}
            <div className="h-64 flex items-end space-x-2">
              {getMetricData().map((value, index) => {
                const maxValue = Math.max(...getMetricData());
                const height = (value / maxValue) * 200;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t transition-all hover:opacity-80"
                      style={{
                        height: `${height}px`,
                        backgroundColor: getMetricColor(),
                        minHeight: '4px'
                      }}
                      title={`${months[index]}: ${value}`}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">
                      {months[index]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 인기 장비 순위 */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">인기 장비 TOP 5</h3>
            <div className="space-y-4">
              {mockReportData.topEquipment.map((equipment, index) => (
                <div key={equipment.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {equipment.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {equipment.usage}회 이용
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${equipment.percentage}%`,
                          backgroundColor: '#133E87'
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {equipment.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 추가 분석 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">시간대별 이용 패턴</h3>
          <div className="space-y-3">
            {[
              { time: '06:00-09:00', usage: 15, label: '새벽' },
              { time: '09:00-12:00', usage: 45, label: '오전' },
              { time: '12:00-15:00', usage: 35, label: '오후' },
              { time: '15:00-18:00', usage: 28, label: '저녁' },
              { time: '18:00-21:00', usage: 12, label: '밤' },
            ].map((timeSlot) => (
              <div key={timeSlot.time} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {timeSlot.time} ({timeSlot.label})
                </span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${timeSlot.usage}%`,
                        backgroundColor: '#608BC1'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">
                    {timeSlot.usage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">지역별 이용 현황</h3>
          <div className="space-y-3">
            {[
              { region: '춘천시', usage: 142, percentage: 65 },
              { region: '원주시', usage: 98, percentage: 45 },
              { region: '강릉시', usage: 76, percentage: 35 },
              { region: '동해시', usage: 54, percentage: 25 },
              { region: '속초시', usage: 32, percentage: 15 },
            ].map((region) => (
              <div key={region.region} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {region.region}
                </span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {region.usage}건
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${region.percentage}%`,
                        backgroundColor: '#CBDCEB'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}