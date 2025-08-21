export interface MachinerySelection {
  machineryId: string;
  machineryName: string;
  specification: string;
  manufacturer: string;
  rentalPrice: number;
  officeId: string;
  officeName: string;
}

export interface ReservationForm {
  selectedMachinery: MachinerySelection[];
  startDate: string;
  endDate: string;
  rentalPeriod?: string; // '1일', '2일', '반일' 등
  farmerName: string;
  farmerPhone: string;
  farmAddress: string;
  farmSize: number;
  cropType: string;
  deliveryRequired: boolean;
  deliveryAddress?: string;
  notes?: string;
}

export interface ReservationRequest {
  id: string;
  form: ReservationForm;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHECKED_OUT' | 'PENDING_RETURN' | 'RETURNED' | 'CANCELLED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ReservationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}