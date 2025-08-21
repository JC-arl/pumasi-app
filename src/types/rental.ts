export interface RentalOffice {
  id: string;
  name: string;
  address: string;
  phone: string;
  website?: null | string;
  lat: null | number;
  lng: null | number;
  description: string;
  operatingHours: string;
  availableMachinery: string[];
  rating?: null | number;
  reviewCount?: null | number;
}

export interface MapCenter {
  lat: number;
  lng: number;
}

export interface MachinerySpecification {
  id: string;
  specification: string;
  manufacturer: string;
  totalCount: number;
  availableCount: number;
  rentalPrice: number;
  description: string;
  standardCode: string;
}

export interface Machinery {
  id: string;
  name: string;
  image: string;
  category: string;
  officeId: string;
  specifications: MachinerySpecification[];
}
