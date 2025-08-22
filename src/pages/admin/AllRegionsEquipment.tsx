import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { regions, getRegionByOfficeId } from '../../data/regionData';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { jeoubukMachinery } from '../../data/jeoubukMachinery';
import type { Asset } from '../../types/admin';
import type { Machinery } from '../../types/rental';
import { 
  Filter, 
  Download, 
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 농기계 데이터를 Asset 형태로 변환하는 함수
const transformMachineryToAssets = (machinery: Machinery[]): Asset[] => {
  const assets: Asset[] = [];
  
  machinery.forEach(machine => {
    machine.specifications.forEach((spec) => {
      // 각 specification을 개별 자산으로 생성
      for (let i = 0; i < spec.totalCount; i++) {
        const asset: Asset = {
          id: `${machine.id}-${spec.id}-${i + 1}`,
          standardCode: spec.standardCode,
          name: machine.name,
          model: `${spec.specification} (${spec.manufacturer})`,
          officeId: machine.officeId,
          status: i < spec.availableCount ? 'AVAILABLE' : 'IN_USE',
          totalUsageHours: Math.floor(Math.random() * 2000) + 100,
          purchaseDate: `202${Math.floor(Math.random() * 4 + 1)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          assetNumber: `${spec.standardCode}-${i + 1}`,
          location: getOfficeLocationName(machine.officeId),
          lastMaintenance: Math.random() > 0.3 ? `2024-${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : undefined,
        };
        assets.push(asset);
      }
    });
  });
  
  return assets;
};

// 전북 농기계 데이터를 Asset 형태로 변환하는 함수
const transformJeoubukToAssets = (jeoubukData: Record<string, readonly any[]>): Asset[] => {
  const assets: Asset[] = [];
  
  Object.entries(jeoubukData).forEach(([officeName, equipmentList]) => {
    equipmentList.forEach((equipment) => {
      // 각 장비를 개별 자산으로 생성
      for (let i = 0; i < equipment.totalCount; i++) {
        const asset: Asset = {
          id: `jeoubuk-${equipment.표준코드}-${i + 1}`,
          standardCode: equipment.표준코드,
          name: equipment.농기계명,
          model: `${equipment.규격} (${equipment.제조사})`,
          officeId: `jeoubuk-${officeName.replace(/\s+/g, '').replace(/[^가-힣a-zA-Z0-9]/g, '')}`,
          status: i < equipment.availableCount ? 'AVAILABLE' : 'IN_USE',
          totalUsageHours: Math.floor(Math.random() * 2000) + 100,
          purchaseDate: `202${Math.floor(Math.random() * 4 + 1)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          assetNumber: `${equipment.표준코드}-${i + 1}`,
          location: officeName,
          lastMaintenance: Math.random() > 0.3 ? `2024-${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : undefined,
        };
        assets.push(asset);
      }
    });
  });
  
  return assets;
};

// 사무소 ID를 실제 위치명으로 변환
const getOfficeLocationName = (officeId: string): string => {
  const officeMap: { [key: string]: string } = {
    'kimcheon-edu': '김천시 농업기술센터',
    'kimcheon-south': '김천시 남부 농기계임대사업소',
    'kimcheon-north': '김천시 북부 농기계임대사업소',
  };
  return officeMap[officeId] || officeId;
};

// 실제 농기계 데이터에서 변환된 Asset 목록
const kimcheonAssets = transformMachineryToAssets(kimcheonMachinery);
const jeoubukAssets = transformJeoubukToAssets(jeoubukMachinery);


// 간단한 더미 데이터 - 다양한 지역의 장비들
const allRegionsAssets: Asset[] = [
  ...kimcheonAssets,
  ...jeoubukAssets,
];

const statusOptions = [
  { id: 'all', name: '전체 상태' },
  { id: 'AVAILABLE', name: '사용가능' },
  { id: 'RESERVED', name: '예약됨' },
  { id: 'IN_USE', name: '사용중' },
  { id: 'MAINTENANCE', name: '정비중' },
  { id: 'OUT_OF_SERVICE', name: '사용불가' },
];

const regionOptions = [
  { id: 'all', name: '전체 지역' },
  ...regions.map(region => ({ id: region.id, name: region.name }))
];

export default function AllRegionsEquipment() {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(allRegionsAssets);

  // Load additional assets from localStorage
  useEffect(() => {
    const savedAssets = localStorage.getItem('adminAssets');
    if (savedAssets) {
      try {
        const parsedAssets = JSON.parse(savedAssets);
        setAssets([...allRegionsAssets, ...parsedAssets]);
      } catch (error) {
        console.error('Error loading saved assets:', error);
      }
    }
  }, []);

  // 필터링된 데이터
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 지역별 필터링
      if (selectedRegion !== 'all') {
        const assetRegion = getRegionByOfficeId(asset.officeId);
        if (!assetRegion || assetRegion.id !== selectedRegion) {
          return false;
        }
      }
      
      const statusMatch = selectedStatus === 'all' || asset.status === selectedStatus;
      return statusMatch;
    });
  }, [assets, selectedRegion, selectedStatus]);

  // 테이블 컬럼 정의
  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'assetNumber',
      header: '자산번호',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.assetNumber}
        </div>
      ),
    },
    {
      accessorKey: 'standardCode',
      header: '표준코드',
    },
    {
      accessorKey: 'name',
      header: '장비명',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.model}</div>
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: '소속사업소/지역',
      cell: ({ row }) => {
        const region = getRegionByOfficeId(row.original.officeId);
        return (
          <div className="flex items-center text-sm min-w-[200px] max-w-[250px]">
            <MapPin className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate" title={row.original.location}>
                {row.original.location}
              </div>
              <div className="text-xs text-gray-500 truncate" title={region ? region.name : '알 수 없는 지역'}>
                {region ? region.name : '알 수 없는 지역'}
              </div>
            </div>
          </div>
        );
      },
      size: 220,
      minSize: 200,
      maxSize: 250,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <div className="min-w-[100px]">
          <StatusBadge status={row.original.status} type="asset" />
        </div>
      ),
      size: 110,
      minSize: 100,
      maxSize: 120,
    },
    {
      accessorKey: 'totalUsageHours',
      header: '누적사용시간',
      cell: ({ row }) => (
        <div className="text-sm text-gray-900 min-w-[120px] text-right">
          {row.original.totalUsageHours.toLocaleString()}시간
        </div>
      ),
      size: 130,
      minSize: 120,
      maxSize: 150,
    },
    {
      accessorKey: 'lastMaintenance',
      header: '최근정비일',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.lastMaintenance || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'purchaseDate',
      header: '구입일',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.purchaseDate}
        </span>
      ),
    },
  ];

  // 지역별 통계 계산
  const regionStats = useMemo(() => {
    const stats = regions.map(region => {
      const regionAssets = assets.filter(asset => {
        const assetRegion = getRegionByOfficeId(asset.officeId);
        return assetRegion && assetRegion.id === region.id;
      });

      return {
        regionId: region.id,
        regionName: region.name,
        total: regionAssets.length,
        available: regionAssets.filter(a => a.status === 'AVAILABLE').length,
        inUse: regionAssets.filter(a => a.status === 'IN_USE').length,
        maintenance: regionAssets.filter(a => a.status === 'MAINTENANCE').length,
      };
    });

    return stats.filter(stat => stat.total > 0);
  }, [assets]);

  // CSV 내보내기 함수
  const handleExport = () => {
    const csvContent = [
      '자산번호,장비명,모델,소속사업소,지역,상태,누적사용시간,구입일',
      ...filteredAssets.map(asset => {
        const region = getRegionByOfficeId(asset.officeId);
        return `"${asset.assetNumber}","${asset.name}","${asset.model}","${asset.location}","${region ? region.name : '알 수 없음'}","${asset.status}","${asset.totalUsageHours}","${asset.purchaseDate}"`;
      })
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `전체지역_장비목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/assets')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              뒤로가기
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">전체 지역 장비 현황</h1>
          <p className="mt-2 text-sm text-gray-700">
            모든 지역의 농기계 장비 현황을 조회할 수 있습니다
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            필터
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
        </div>
      </div>

      {/* 지역별 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  전체 장비
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {assets.length}대
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  사용가능
                </dt>
                <dd className="text-lg font-medium text-green-600">
                  {assets.filter(a => a.status === 'AVAILABLE').length}대
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  사용중
                </dt>
                <dd className="text-lg font-medium text-blue-600">
                  {assets.filter(a => a.status === 'IN_USE').length}대
                </dd>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  정비중
                </dt>
                <dd className="text-lg font-medium text-orange-600">
                  {assets.filter(a => a.status === 'MAINTENANCE').length}대
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 지역별 상세 현황 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">지역별 장비 현황</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regionStats.map((stat) => (
            <div key={stat.regionId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">{stat.regionName}</h4>
                <span className="text-lg font-bold text-gray-600">{stat.total}대</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">사용가능</span>
                  <span>{stat.available}대</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">사용중</span>
                  <span>{stat.inUse}대</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-orange-600">정비중</span>
                  <span>{stat.maintenance}대</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                지역
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {regionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                상태
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {statusOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedRegion('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <AdminTable
        data={filteredAssets}
        columns={columns}
        searchPlaceholder="장비명, 자산번호, 표준코드, 소속사업소로 검색..."
      />
    </div>
  );
}