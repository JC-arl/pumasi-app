import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import EquipmentRegistrationModal from '../../components/admin/EquipmentRegistrationModal';
import RegionSelector from '../../components/admin/RegionSelector';
import { getOfficesByRegion, getRegionByOfficeId } from '../../data/regionData';
import type { Asset } from '../../types/admin';
import { 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  FileText,
  MapPin
} from 'lucide-react';

// 간단한 더미 데이터
const mockAssets: Asset[] = [
  {
    id: 'A-001',
    standardCode: 'STD-001',
    name: '대형트랙터',
    model: 'John Deere 8345R',
    officeId: 'OF-001',
    status: 'AVAILABLE',
    totalUsageHours: 1250,
    purchaseDate: '2022-03-15',
    assetNumber: 'A-001-2022',
    location: '춘천지점',
    lastMaintenance: '2024-08-01',
  },
  {
    id: 'A-002',
    standardCode: 'STD-002',
    name: '중형경운기',
    model: 'Kubota L3901',
    officeId: 'OF-001',
    status: 'IN_USE',
    totalUsageHours: 850,
    purchaseDate: '2023-01-20',
    assetNumber: 'A-002-2023',
    location: '춘천지점',
    lastMaintenance: '2024-07-15',
  },
  {
    id: 'A-003',
    standardCode: 'STD-003',
    name: '콤바인',
    model: 'New Holland CR8.90',
    officeId: 'OF-002',
    status: 'MAINTENANCE',
    totalUsageHours: 2100,
    purchaseDate: '2021-09-10',
    assetNumber: 'A-003-2021',
    location: '원주지점',
    lastMaintenance: '2024-08-10',
  },
  {
    id: 'A-004',
    standardCode: 'STD-004',
    name: '소형트랙터',
    model: 'Kubota B2650',
    officeId: 'OF-001',
    status: 'AVAILABLE',
    totalUsageHours: 420,
    purchaseDate: '2024-02-10',
    assetNumber: 'A-004-2024',
    location: '춘천지점',
    lastMaintenance: '2024-07-01',
  },
];

const statusOptions = [
  { id: 'all', name: '전체 상태' },
  { id: 'AVAILABLE', name: '사용가능' },
  { id: 'RESERVED', name: '예약됨' },
  { id: 'IN_USE', name: '사용중' },
  { id: 'MAINTENANCE', name: '정비중' },
  { id: 'OUT_OF_SERVICE', name: '사용불가' },
];

const officeOptions = [
  { id: 'all', name: '전체 사업소' },
  { id: 'OF-001', name: '춘천지점' },
  { id: 'OF-002', name: '원주지점' },
  { id: 'OF-003', name: '강릉지점' },
];

const ASSETS_STORAGE_KEY = 'adminAssets';

export default function Assets() {
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Load assets from localStorage on component mount
  useEffect(() => {
    const savedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (savedAssets) {
      try {
        const parsedAssets = JSON.parse(savedAssets);
        setAssets([...mockAssets, ...parsedAssets]);
      } catch (error) {
        console.error('Error loading saved assets:', error);
      }
    }
  }, []);

  // 필터링된 데이터
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 지역별 필터링
      if (selectedRegion) {
        const allowedOffices = getOfficesByRegion(selectedRegion);
        if (!allowedOffices.includes(asset.officeId)) {
          return false;
        }
      }
      
      const officeMatch = selectedOffice === 'all' || asset.officeId === selectedOffice;
      const statusMatch = selectedStatus === 'all' || asset.status === selectedStatus;
      return officeMatch && statusMatch;
    });
  }, [assets, selectedOffice, selectedStatus, selectedRegion]);

  // 장비 등록 핸들러
  const handleEquipmentRegistration = (equipmentData: any) => {
    const newAsset: Asset = {
      id: `A-${Date.now()}`,
      standardCode: equipmentData.standardCode,
      name: equipmentData.name,
      model: equipmentData.model,
      officeId: equipmentData.officeId,
      status: 'AVAILABLE',
      totalUsageHours: 0,
      purchaseDate: equipmentData.purchaseDate,
      assetNumber: `${equipmentData.standardCode}-${new Date().getFullYear()}`,
      location: officeOptions.find(office => office.id === equipmentData.officeId)?.name || '알 수 없음',
      lastMaintenance: null,
    };

    // 현재 자산 목록에 추가
    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);

    // localStorage에 새로 추가된 자산만 저장 (mock 데이터 제외)
    const customAssets = updatedAssets.filter(asset => !mockAssets.find(mock => mock.id === asset.id));
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(customAssets));

    alert('장비가 성공적으로 등록되었습니다.');
  };

  // 테이블 컬럼 정의
  const columns: ColumnDef<Asset>[] = [
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-blue-600">
            <Edit className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-green-600">
            <FileText className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      enableSorting: false,
    },
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
      header: '소속사업소',
      cell: ({ row }) => (
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
          {row.original.location}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="asset" />
      ),
    },
    {
      accessorKey: 'totalUsageHours',
      header: '누적사용시간',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.totalUsageHours.toLocaleString()}시간
        </span>
      ),
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

  // 한글이 포함된 CSV 내보내기 함수
  const handleExport = () => {
    const csvContent = [
      '자산번호,장비명,모델,소속사업소,상태,누적사용시간,구입일',
      ...filteredAssets.map(asset => 
        `"${asset.assetNumber}","${asset.name}","${asset.model}","${asset.location}","${asset.status}","${asset.totalUsageHours}","${asset.purchaseDate}"`
      )
    ].join('\n');

    // BOM을 추가하여 한글 깨짐 방지
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `장비목록_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">장비·자산 관리</h1>
          <p className="mt-2 text-sm text-gray-700">
            농기계 장비를 등록하고 상태를 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            필터
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </button>
          <button 
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            장비 등록
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  총 장비수
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

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                사업소
              </label>
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {officeOptions.map((option) => (
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
                  setSelectedOffice('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        searchPlaceholder="장비명, 자산번호, 표준코드로 검색..."
      />

      {/* 장비 등록 모달 */}
      <EquipmentRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleEquipmentRegistration}
      />
    </div>
  );
}