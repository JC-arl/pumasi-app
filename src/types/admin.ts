// Admin 관련 타입 정의

export type UserRole = 'ADMIN' | 'OPERATOR' | 'ANALYST';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  officeId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
  twoFactorEnabled: boolean;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  totalAssets: number;
  utilizationRate: number;
  status: 'ACTIVE' | 'INACTIVE';
  operatingHours: string;
  deliveryAvailable: boolean;
  region: string;
}

export interface Region {
  id: string;
  name: string;
  offices: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  assignedRegions: string[];
  selectedRegion: string | null;
}

export type AssetStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'IN_USE' 
  | 'MAINTENANCE' 
  | 'OUT_OF_SERVICE';

export interface Asset {
  id: string;
  standardCode: string;
  name: string;
  model: string;
  officeId: string;
  status: AssetStatus;
  totalUsageHours: number;
  purchaseDate: string;
  assetNumber: string;
  location?: string;
  lastMaintenance?: string;
}

export type ReservationStatus = 
  | 'REQUESTED' 
  | 'CONFIRMED' 
  | 'IN_USE' 
  | 'RETURNED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Reservation {
  id: string;
  assetId: string;
  assetName: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  startDate: string;
  endDate: string;
  status: ReservationStatus;
  channel: 'WEB' | 'PHONE';
  notes?: string;
  createdBy: string;
  createdAt: string;
  officeId: string;
}

export interface MaintenancePart {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface Maintenance {
  id: string;
  assetId: string;
  assetName: string;
  type: 'PREVENTIVE' | 'CORRECTIVE';
  description: string;
  requestDate: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  cost?: number;
  assignedTo?: string;
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  parts?: MaintenancePart[];
}

export interface DashboardStats {
  todayReservations: number;
  overdueReturns: number;
  utilizationRate: number;
  maintenanceIssues: number;
  weeklyTrends: {
    reservations: number[];
    usageHours: number[];
    maintenanceHours: number[];
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  before?: unknown;
  after?: unknown;
  timestamp: string;
  ipAddress: string;
}