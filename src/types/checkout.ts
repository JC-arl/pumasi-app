export interface CheckoutItem {
  id: string;
  reservationId: string;
  assetId: string;
  assetName: string;
  farmerName: string;
  farmerPhone: string;
  startDate: string;
  endDate: string;
  status: 'PENDING_CHECKOUT' | 'CHECKED_OUT' | 'PENDING_RETURN' | 'RETURNED';
  checkoutDate?: string;
  returnDate?: string;
  checkoutBy?: string;
  returnBy?: string;
  checkoutNotes?: string;
  returnNotes?: string;
  condition: {
    checkout?: AssetCondition;
    return?: AssetCondition;
  };
  contract?: ContractInfo;
}

export interface AssetCondition {
  overall: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  engine: 'GOOD' | 'MINOR_ISSUES' | 'MAJOR_ISSUES';
  hydraulics: 'GOOD' | 'MINOR_ISSUES' | 'MAJOR_ISSUES';
  transmission: 'GOOD' | 'MINOR_ISSUES' | 'MAJOR_ISSUES';
  tires: 'GOOD' | 'WORN' | 'NEEDS_REPLACEMENT';
  exterior: 'EXCELLENT' | 'GOOD' | 'DAMAGED';
  interior: 'EXCELLENT' | 'GOOD' | 'DAMAGED';
  attachments: 'COMPLETE' | 'MISSING' | 'DAMAGED';
  fuelLevel: number; // 0-100
  mileage?: number;
  notes?: string;
  photos?: string[];
  damages?: DamageReport[];
}

export interface DamageReport {
  id: string;
  location: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  description: string;
  photo?: string;
  repairRequired: boolean;
  estimatedCost?: number;
}

export interface ContractInfo {
  id: string;
  signedDate: string;
  terms: string[];
  insurance: {
    provider: string;
    policyNumber: string;
    coverage: number;
  };
  deposit: {
    amount: number;
    method: 'CASH' | 'CARD' | 'TRANSFER';
    refundable: boolean;
  };
  operator: {
    name: string;
    license: string;
    experience: string;
  };
}