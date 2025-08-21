import { useState, useMemo, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import EquipmentRegistrationModal from '../../components/admin/EquipmentRegistrationModal';
import RegionSelector from '../../components/admin/RegionSelector';
import { getOfficesByRegion } from '../../data/regionData';
import { kimcheonMachinery } from '../../data/kimcheonMachinery';
import { jeoubukMachinery } from '../../data/jeoubukMachinery';
import type { Asset } from '../../types/admin';
import type { Machinery } from '../../types/rental';
import { 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  FileText,
  MapPin,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  { id: 'kimcheon-edu', name: '김천시 농기계교육센터' },
  { id: 'kimcheon-south', name: '김천시 남부농기계임대사업소' },
  { id: 'kimcheon-north', name: '김천시 북부농기계임대사업소' },
  { id: 'kimcheon-east', name: '김천시 동부농기계임대사업소' },
  { id: 'kimcheon-west', name: '김천시 서부농기계임대사업소' },
  // 전북특별자치도 사업소들
  { id: 'jeoubuk-gyenam', name: '계남 농기계 임대사업장' },
  { id: 'jeoubuk-gyebuk', name: '계북 농기계 임대사업장' },
  { id: 'jeoubuk-beonam', name: '번암 농기계 임대사업장' },
  { id: 'jeoubuk-sanseo', name: '산서 농기계 임대사업장' },
  { id: 'jeoubuk-janggye', name: '장계 농기계 임대사업장' },
  { id: 'jeoubuk-cheoncheon', name: '천천 농기계 임대사업장' },
  { id: 'jeoubuk-jangsu', name: '장수 농기계 임대사업장' },
  { id: 'jeoubuk-gangjin', name: '강진 농기계 임대사업장' },
  { id: 'jeoubuk-sindeok', name: '신덕 농기계 임대사업장' },
  { id: 'jeoubuk-osu', name: '오수 농기계 임대사업장' },
  { id: 'jeoubuk-imsil', name: '임실 농기계 임대사업장' },
  { id: 'jeoubuk-inwol', name: '인월 농기계 임대사업장' },
  { id: 'jeoubuk-geumji', name: '금지 농기계 임대사업장' },
  { id: 'jeoubuk-samae', name: '사매 농기계 임대사업장' },
  { id: 'jeoubuk-maryeong', name: '마령 농기계 임대사업장' },
  { id: 'jeoubuk-donghyang', name: '동향 농기계 임대사업장' },
  { id: 'jeoubuk-bugwi', name: '부귀 농기계 임대사업장' },
  { id: 'jeoubuk-ancheon', name: '안천 농기계 임대사업장' },
  { id: 'jeoubuk-sangjeon', name: '상전 농기계 임대사업장' },
  { id: 'jeoubuk-ibaek', name: '이백 농기계 임대사업장' },
  { id: 'jeoubuk-gimje', name: '김제 농기계 임대사업장' },
  { id: 'jeoubuk-bongnam', name: '봉남 농기계 임대사업장' },
  { id: 'jeoubuk-mangyeong', name: '만경 농기계 임대사업장' },
  { id: 'jeoubuk-gongdeok', name: '공덕 농기계 임대사업장' },
  { id: 'jeoubuk-muju', name: '무주 농기계 임대사업장' },
  { id: 'jeoubuk-jeonju', name: '전주 농기계 임대사업장' },
  { id: 'jeoubuk-jinan', name: '진안 농기계 임대사업장' },
  { id: 'jeoubuk-jeongcheon', name: '정천 농기계 임대사업장' },
  { id: 'jeoubuk-sangseo', name: '상서 농기계 임대사업장' },
  { id: 'jeoubuk-boan', name: '보안 농기계 임대사업장' },
  { id: 'jeoubuk-dongjin', name: '동진 농기계 임대사업장' },
  { id: 'jeoubuk-ongdong', name: '옹동 농기계 임대사업장' },
  { id: 'jeoubuk-soyang', name: '소양 농기계 임대사업장' },
  { id: 'jeoubuk-samrye', name: '삼례 농기계 임대사업장' },
  { id: 'jeoubuk-gui', name: '구이 농기계 임대사업장' },
  { id: 'jeoubuk-gosan', name: '고산 농기계 임대사업장' },
  { id: 'jeoubuk-jeongwoo', name: '정우 농기계 임대사업장' },
  { id: 'jeoubuk-geumma', name: '금마 농기계 임대사업장' },
  { id: 'jeoubuk-soseong', name: '소성 농기계 임대사업장' },
  { id: 'jeoubuk-gaejeong', name: '개정 농기계 임대사업장' },
  { id: 'jeoubuk-impi', name: '임피 농기계 임대사업장' },
  { id: 'jeoubuk-okseo', name: '옥서 농기계 임대사업장' },
  { id: 'jeoubuk-hamyeol', name: '함열 농기계 임대사업장' },
  { id: 'jeoubuk-gochang', name: '고창 농기계 임대사업장' },
  { id: 'jeoubuk-haeri', name: '해리 농기계 임대사업장' },
  { id: 'jeoubuk-daesan', name: '대산 농기계 임대사업장' },
  { id: 'jeoubuk-heungdeok', name: '흥덕 농기계 임대사업장' },
  { id: 'jeoubuk-sunchang', name: '순창 농기계 임대사업장' },
  { id: 'jeoubuk-bokheung', name: '복흥 농기계 임대사업장' },
];

const ASSETS_STORAGE_KEY = 'adminAssets';

// 김천시 농기계 데이터를 Asset 형태로 변환하는 함수
const transformMachineryToAssets = (machinery: Machinery[]): Asset[] => {
  const assets: Asset[] = [];
  
  machinery.forEach(machine => {
    machine.specifications.forEach((spec, index) => {
      // 각 specification을 개별 자산으로 생성
      for (let i = 0; i < spec.totalCount; i++) {
        const asset: Asset = {
          id: `${machine.id}-${spec.id}-${i + 1}`,
          standardCode: spec.standardCode,
          name: machine.name,
          model: `${spec.specification} (${spec.manufacturer})`,
          officeId: machine.officeId,
          status: i < spec.availableCount ? 'AVAILABLE' : 'IN_USE',
          totalUsageHours: Math.floor(Math.random() * 2000) + 100, // 임시 사용시간
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

// 사무소 ID를 실제 위치명으로 변환
const getOfficeLocationName = (officeId: string): string => {
  const officeMap: { [key: string]: string } = {
    'kimcheon-edu': '김천시 농기계교육센터',
    'kimcheon-south': '김천시 남부농기계임대사업소',
    'kimcheon-north': '김천시 북부농기계임대사업소',
    'kimcheon-east': '김천시 동부농기계임대사업소',
    'kimcheon-west': '김천시 서부농기계임대사업소',
    'OF-001': '춘천지점',
    'OF-002': '원주지점',
    'OF-003': '강릉지점',
    // 전북특별자치도 사업소들
    'jeoubuk-gyenam': '계남 농기계 임대사업장',
    'jeoubuk-gyebuk': '계북 농기계 임대사업장',
    'jeoubuk-beonam': '번암 농기계 임대사업장',
    'jeoubuk-sanseo': '산서 농기계 임대사업장',
    'jeoubuk-janggye': '장계 농기계 임대사업장',
    'jeoubuk-cheoncheon': '천천 농기계 임대사업장',
    'jeoubuk-jangsu': '장수 농기계 임대사업장',
    'jeoubuk-gangjin': '강진 농기계 임대사업장',
    'jeoubuk-sindeok': '신덕 농기계 임대사업장',
    'jeoubuk-osu': '오수 농기계 임대사업장',
    'jeoubuk-imsil': '임실 농기계 임대사업장',
    'jeoubuk-inwol': '인월 농기계 임대사업장',
    'jeoubuk-geumji': '금지 농기계 임대사업장',
    'jeoubuk-samae': '사매 농기계 임대사업장',
    'jeoubuk-maryeong': '마령 농기계 임대사업장',
    'jeoubuk-donghyang': '동향 농기계 임대사업장',
    'jeoubuk-bugwi': '부귀 농기계 임대사업장',
    'jeoubuk-ancheon': '안천 농기계 임대사업장',
    'jeoubuk-sangjeon': '상전 농기계 임대사업장',
    'jeoubuk-ibaek': '이백 농기계 임대사업장',
    'jeoubuk-gimje': '김제 농기계 임대사업장',
    'jeoubuk-bongnam': '봉남 농기계 임대사업장',
    'jeoubuk-mangyeong': '만경 농기계 임대사업장',
    'jeoubuk-gongdeok': '공덕 농기계 임대사업장',
    'jeoubuk-muju': '무주 농기계 임대사업장',
    'jeoubuk-jeonju': '전주 농기계 임대사업장',
    'jeoubuk-jinan': '진안 농기계 임대사업장',
    'jeoubuk-jeongcheon': '정천 농기계 임대사업장',
    'jeoubuk-sangseo': '상서 농기계 임대사업장',
    'jeoubuk-boan': '보안 농기계 임대사업장',
    'jeoubuk-dongjin': '동진 농기계 임대사업장',
    'jeoubuk-ongdong': '옹동 농기계 임대사업장',
    'jeoubuk-soyang': '소양 농기계 임대사업장',
    'jeoubuk-samrye': '삼례 농기계 임대사업장',
    'jeoubuk-gui': '구이 농기계 임대사업장',
    'jeoubuk-gosan': '고산 농기계 임대사업장',
    'jeoubuk-jeongwoo': '정우 농기계 임대사업장',
    'jeoubuk-geumma': '금마 농기계 임대사업장',
    'jeoubuk-soseong': '소성 농기계 임대사업장',
    'jeoubuk-gaejeong': '개정 농기계 임대사업장',
    'jeoubuk-impi': '임피 농기계 임대사업장',
    'jeoubuk-okseo': '옥서 농기계 임대사업장',
    'jeoubuk-hamyeol': '함열 농기계 임대사업장',
    'jeoubuk-gochang': '고창 농기계 임대사업장',
    'jeoubuk-haeri': '해리 농기계 임대사업장',
    'jeoubuk-daesan': '대산 농기계 임대사업장',
    'jeoubuk-heungdeok': '흥덕 농기계 임대사업장',
    'jeoubuk-sunchang': '순창 농기계 임대사업장',
    'jeoubuk-bokheung': '복흥 농기계 임대사업장',
  };
  
  return officeMap[officeId] || officeId;
};

export default function Assets() {
  const navigate = useNavigate();
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(() => {
    // 김천시 및 전북 농기계 데이터를 Asset 형태로 변환하여 초기화
    const kimcheonAssets = transformMachineryToAssets(kimcheonMachinery);
    const jeoubukAssets = transformMachineryToAssets(jeoubukMachinery);
    return [...mockAssets, ...kimcheonAssets, ...jeoubukAssets];
  });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Load assets from localStorage on component mount
  useEffect(() => {
    const savedAssets = localStorage.getItem(ASSETS_STORAGE_KEY);
    const kimcheonAssets = transformMachineryToAssets(kimcheonMachinery);
    const jeoubukAssets = transformMachineryToAssets(jeoubukMachinery);
    
    if (savedAssets) {
      try {
        const parsedAssets = JSON.parse(savedAssets);
        setAssets([...mockAssets, ...kimcheonAssets, ...jeoubukAssets, ...parsedAssets]);
      } catch (error) {
        console.error('Error loading saved assets:', error);
        setAssets([...mockAssets, ...kimcheonAssets, ...jeoubukAssets]);
      }
    } else {
      setAssets([...mockAssets, ...kimcheonAssets, ...jeoubukAssets]);
    }
  }, []);

  // 도/특별시/광역시 목록 추출
  const provinces = useMemo(() => {
    const provinceSet = new Set<string>();
    assets.forEach(asset => {
      const location = asset.location;
      if (location) {
        if (location.includes('김천시')) {
          provinceSet.add('경상북도');
        } else if (location.includes('농기계 임대사업장')) {
          provinceSet.add('전북특별자치도');
        } else if (location.includes('지점')) {
          provinceSet.add('강원특별자치도');
        }
      }
    });
    return Array.from(provinceSet).sort();
  }, [assets]);

  // 선택된 도에 따른 시/군/구 목록
  const cities = useMemo(() => {
    if (selectedProvince === 'all') return [];
    
    const citySet = new Set<string>();
    assets.forEach(asset => {
      const location = asset.location;
      if (location) {
        if (selectedProvince === '경상북도' && location.includes('김천시')) {
          citySet.add('김천시');
        } else if (selectedProvince === '전북특별자치도' && location.includes('농기계 임대사업장')) {
          // 전북 지역 사업장에서 시/군 추출
          const parts = location.split(' ');
          if (parts[0] && !parts[0].includes('농기계')) {
            citySet.add(parts[0]);
          }
        } else if (selectedProvince === '강원특별자치도' && location.includes('지점')) {
          const cityName = location.replace('지점', '');
          citySet.add(cityName);
        }
      }
    });
    return Array.from(citySet).sort();
  }, [selectedProvince, assets]);

  // 필터링된 데이터
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // 지역별 필터링 (기존)
      if (selectedRegion) {
        const allowedOffices = getOfficesByRegion(selectedRegion);
        if (!allowedOffices.includes(asset.officeId)) {
          return false;
        }
      }
      
      // 도 필터링
      if (selectedProvince !== 'all') {
        const location = asset.location;
        if (selectedProvince === '경상북도' && !location.includes('김천시')) return false;
        if (selectedProvince === '전북특별자치도' && !location.includes('농기계 임대사업장')) return false;
        if (selectedProvince === '강원특별자치도' && !location.includes('지점')) return false;
      }

      // 시/군/구 필터링
      if (selectedCity !== 'all' && selectedCity) {
        const location = asset.location;
        if (!location.includes(selectedCity)) return false;
      }
      
      const officeMatch = selectedOffice === 'all' || asset.officeId === selectedOffice;
      const statusMatch = selectedStatus === 'all' || asset.status === selectedStatus;
      return officeMatch && statusMatch;
    });
  }, [assets, selectedOffice, selectedStatus, selectedRegion, selectedProvince, selectedCity]);

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
      lastMaintenance: undefined,
    };

    // 현재 자산 목록에 추가
    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);

    // localStorage에 새로 추가된 자산만 저장 (mock, kimcheon, jeoubuk 데이터 제외)
    const kimcheonAssets = transformMachineryToAssets(kimcheonMachinery);
    const jeoubukAssets = transformMachineryToAssets(jeoubukMachinery);
    const customAssets = updatedAssets.filter(asset => 
      !mockAssets.find(mock => mock.id === asset.id) &&
      !kimcheonAssets.find(kimcheon => kimcheon.id === asset.id) &&
      !jeoubukAssets.find(jeoubuk => jeoubuk.id === asset.id)
    );
    localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(customAssets));

    alert('장비가 성공적으로 등록되었습니다.');
  };

  // 도 변경 핸들러
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedCity('all'); // 도가 변경되면 시/군 초기화
  };

  // 시/군/구 변경 핸들러
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  // 테이블 컬럼 정의
  const columns: ColumnDef<Asset>[] = [
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center space-x-2">
          <button className="text-gray-400" style={{'--tw-hover-color': '#328E6E'} as React.CSSProperties}>
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
        <div className="flex items-center text-sm text-gray-900 min-w-[180px] max-w-[220px]">
          <MapPin className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" />
          <span className="truncate" title={row.original.location}>
            {row.original.location}
          </span>
        </div>
      ),
      size: 200,
      minSize: 180,
      maxSize: 220,
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
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
          <button
            onClick={() => navigate('/admin/assets/all-regions')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Globe className="h-4 w-4 mr-2" />
            전체 지역 조회
          </button>
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: '#328E6E',
              '--tw-ring-color': '#328E6E'
            } as React.CSSProperties}
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
                  {filteredAssets.length}대
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
                  {filteredAssets.filter(a => a.status === 'AVAILABLE').length}대
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
                <dd className="text-lg font-medium" style={{color: '#328E6E'}}>
                  {filteredAssets.filter(a => a.status === 'IN_USE').length}대
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
                  {filteredAssets.filter(a => a.status === 'MAINTENANCE').length}대
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* 지역 필터 */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">지역 필터</h3>
              
              {/* 도/특별시/광역시 필터 */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-2 block">도/특별시/광역시</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleProvinceChange('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedProvince === 'all'
                        ? 'border'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                    style={selectedProvince === 'all' ? {
                      backgroundColor: '#E1EEBC',
                      color: '#328E6E',
                      borderColor: '#67AE6E'
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
                          ? 'border'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                      style={selectedProvince === province ? {
                        backgroundColor: '#E1EEBC',
                        color: '#328E6E',
                        borderColor: '#67AE6E'
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
                      onClick={() => handleCityChange('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCity === 'all'
                          ? 'border'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                      style={selectedCity === 'all' ? {
                        backgroundColor: '#E1EEBC',
                        color: '#328E6E',
                        borderColor: '#67AE6E'
                      } : {}}
                    >
                      전체
                    </button>
                    {cities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCityChange(city)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCity === city
                            ? 'border'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                        style={selectedCity === city ? {
                          backgroundColor: '#E1EEBC',
                          color: '#328E6E',
                          borderColor: '#67AE6E'
                        } : {}}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 기존 필터 */}
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
                    setSelectedProvince('all');
                    setSelectedCity('all');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: '#328E6E',
                    '--tw-ring-color': '#328E6E'
                  } as React.CSSProperties}
                >
                  필터 초기화
                </button>
              </div>
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