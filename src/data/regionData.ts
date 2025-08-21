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