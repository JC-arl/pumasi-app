import type { Region, AdminUser } from '../types/admin';

export const regions: Region[] = [
  {
    id: 'kimcheon-central',
    name: '김천시 중앙지역',
    offices: ['kimcheon-edu']
  },
  {
    id: 'kimcheon-south',
    name: '김천시 남부지역', 
    offices: ['kimcheon-south']
  },
  {
    id: 'kimcheon-north',
    name: '김천시 북부지역',
    offices: ['kimcheon-north']
  },
  {
    id: 'kimcheon-east',
    name: '김천시 동부지역',
    offices: ['kimcheon-east']
  },
  {
    id: 'kimcheon-west',
    name: '김천시 서부지역',
    offices: ['kimcheon-west']
  },
  // 전북 지역들
  {
    id: 'jeonbuk-jeonju',
    name: '전주시',
    offices: ['jeoubuk-전주시농업기계임대사업소']
  },
  {
    id: 'jeonbuk-jeongeup',
    name: '정읍시',
    offices: [
      'jeoubuk-정읍시농기계임대사업소동부',
      'jeoubuk-정읍시농기계임대사업소본소',
      'jeoubuk-정읍시농기계임대사업소북부',
      'jeoubuk-정읍시농기계임대사업소서남권'
    ]
  },
  {
    id: 'jeonbuk-jangsu',
    name: '장수군',
    offices: [
      'jeoubuk-계남농기계임대사업장',
      'jeoubuk-계북농기계임대사업장',
      'jeoubuk-번암농기계임대사업장',
      'jeoubuk-산서농기계임대사업장',
      'jeoubuk-장계농기계임대사업장',
      'jeoubuk-장수농기계임대사업장',
      'jeoubuk-천천농기계임대사업장'
    ]
  },
  {
    id: 'jeonbuk-other',
    name: '전북 기타지역',
    offices: [
      'jeoubuk-남부임대사업소',
      'jeoubuk-농기계임대사업소동향면',
      'jeoubuk-농기계임대사업소마령면',
      'jeoubuk-농기계임대사업소본소',
      'jeoubuk-농기계임대사업소부귀면',
      'jeoubuk-농기계임대사업소상전면',
      'jeoubuk-농기계임대사업소안천면',
      'jeoubuk-농기계임대사업소정천면',
      'jeoubuk-북부임대사업소',
      'jeoubuk-서부임대사업소',
      'jeoubuk-중부임대사업소'
    ]
  }
];

export const mockAdminUser: AdminUser = {
  id: 'admin-001',
  name: '김관리',
  role: 'ADMIN',
  assignedRegions: ['kimcheon-central', 'kimcheon-south', 'kimcheon-north'],
  selectedRegion: null
};

export const getOfficesByRegion = (regionId: string): string[] => {
  const region = regions.find(r => r.id === regionId);
  return region ? region.offices : [];
};

export const getRegionByOfficeId = (officeId: string): Region | null => {
  return regions.find(region => region.offices.includes(officeId)) || null;
};