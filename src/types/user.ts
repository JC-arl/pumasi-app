// 사용자(농민) 관련 타입 정의

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  farmlands: Farmland[];
  preferredOffices: string[];
  licenses: License[];
  paymentMethods: PaymentMethod[];
}

export interface Farmland {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  size: number; // 평방미터
  cropType: string[];
}

export interface License {
  id: string;
  type: 'TRACTOR' | 'COMBINE' | 'FORKLIFT';
  number: string;
  expiryDate: string;
  verified: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'BANK_TRANSFER' | 'CASH';
  name: string;
  isDefault: boolean;
}

export interface UserReservation {
  id: string;
  assetId: string;
  assetName: string;
  officeName: string;
  startDate: string;
  endDate: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'OUTBOUND' | 'RETURN_DUE' | 'RETURNED' | 'CANCELED';
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  totalCost: number;
  notes?: string;
  createdAt: string;
  weather?: WeatherInfo;
}

export interface WeatherInfo {
  date: string;
  condition: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'STORMY';
  precipitationProbability: number;
  workSuitabilityScore: number; // 0-100
  recommendation: 'OPTIMAL' | 'CAUTION' | 'NOT_RECOMMENDED';
}

export interface AssetDetail {
  id: string;
  name: string;
  model: string;
  standardCode: string;
  description: string;
  specifications: {
    power: string;
    weight: string;
    dimensions: string;
    fuelType: string;
  };
  images: string[];
  hourlyRate: number;
  dailyRate: number;
  availableSlots: AvailableSlot[];
  office: {
    id: string;
    name: string;
    address: string;
    phone: string;
    operatingHours: string;
    deliveryAvailable: boolean;
    deliveryRadius: number;
    deliveryFee: number;
  };
  requirements: string[];
  consumables: string[];
}

export interface AvailableSlot {
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  price: number;
}

export interface SearchFilters {
  workType?: string;
  date?: string;
  radius?: number;
  availableOnly?: boolean;
  deliveryAvailable?: boolean;
}

export interface QuickReservation {
  workType: string;
  urgency: 'TODAY' | 'THIS_WEEK' | 'FLEXIBLE';
  farmlandId?: string;
  preferredTime?: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

export interface WaitlistEntry {
  id: string;
  assetId: string;
  preferredDate: string;
  position: number;
  estimatedAvailableAt?: string;
  autoAccept: boolean;
}

export interface Notification {
  id: string;
  type: 'RESERVATION_CONFIRMED' | 'RESERVATION_CHANGED' | 'WAITLIST_AVAILABLE' | 'RETURN_REMINDER' | 'WEATHER_ALERT';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ReservationWizardState {
  step: 1 | 2 | 3 | 4;
  assetId: string;
  selectedDate?: string;
  selectedTimeSlot?: TimeSlot;
  deliveryType?: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  farmlandId?: string;
  notes?: string;
  agreedToTerms?: boolean;
  totalCost?: number;
}