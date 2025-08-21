export interface CartItem {
  id: string;
  machineryId: string;
  machineryName: string;
  specificationId: string;
  specification: string;
  manufacturer: string;
  rentalPrice: number;
  officeName: string;
  officeId: string;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}