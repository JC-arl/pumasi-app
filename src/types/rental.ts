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
