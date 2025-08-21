import type { MachinerySpecification, Machinery } from '../types/rental';

export interface ClientReservation {
  id: string;
  machineryId: string;
  machineryName: string;
  specificationId: string;
  specification: string;
  manufacturer: string;
  officeId: string;
  officeName: string;
  rentalPrice: number;
  reservationDate: string;
  status: 'RESERVED' | 'CANCELLED';
  createdAt: string;
}

const RESERVATIONS_KEY = 'clientReservations';
const INVENTORY_KEY = 'machineryInventory';

// 예약 목록 조회
export const getReservations = (): ClientReservation[] => {
  const data = localStorage.getItem(RESERVATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// 예약 추가
export const addReservation = (reservation: Omit<ClientReservation, 'id' | 'createdAt'>): string => {
  const reservations = getReservations();
  const currentNumber = reservations.length + 1;
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD 형식
  const newReservation: ClientReservation = {
    ...reservation,
    id: `${dateStr}${currentNumber.toString().padStart(3, '0')}`, // YYMMDD001 형식
    createdAt: new Date().toISOString(),
  };
  
  reservations.push(newReservation);
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  
  return newReservation.id;
};

// 예약 취소
export const cancelReservation = (reservationId: string): boolean => {
  const reservations = getReservations();
  const reservationIndex = reservations.findIndex(r => r.id === reservationId);
  
  if (reservationIndex === -1) return false;
  
  reservations[reservationIndex].status = 'CANCELLED';
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  
  return true;
};

// 재고 정보 조회 (수정된 재고 반영)
export const getInventoryAdjustments = (): Record<string, number> => {
  const data = localStorage.getItem(INVENTORY_KEY);
  return data ? JSON.parse(data) : {};
};

// 재고 정보 업데이트
export const updateInventory = (specificationId: string, adjustment: number): void => {
  const inventory = getInventoryAdjustments();
  inventory[specificationId] = (inventory[specificationId] || 0) + adjustment;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
};

// 실제 사용 가능한 수량 계산
export const getAvailableCount = (specification: MachinerySpecification): number => {
  const adjustments = getInventoryAdjustments();
  const adjustment = adjustments[specification.id] || 0;
  return Math.max(0, specification.availableCount + adjustment);
};

// 예약 생성 함수
export const createReservation = (
  machinery: Machinery,
  specification: MachinerySpecification,
  officeName: string
): { success: boolean; reservationId?: string; error?: string } => {
  const currentAvailable = getAvailableCount(specification);
  
  if (currentAvailable <= 0) {
    return {
      success: false,
      error: '현재 예약 가능한 농기계가 없습니다.'
    };
  }
  
  try {
    // 예약 생성
    const reservationId = addReservation({
      machineryId: machinery.id,
      machineryName: machinery.name,
      specificationId: specification.id,
      specification: specification.specification,
      manufacturer: specification.manufacturer,
      officeId: machinery.officeId,
      officeName: officeName,
      rentalPrice: specification.rentalPrice,
      reservationDate: new Date().toISOString(),
      status: 'RESERVED'
    });
    
    // 재고 감소
    updateInventory(specification.id, -1);
    
    return {
      success: true,
      reservationId
    };
  } catch (error) {
    return {
      success: false,
      error: '예약 처리 중 오류가 발생했습니다.'
    };
  }
};

// 예약 취소 및 재고 복구
export const cancelReservationAndRestoreInventory = (reservation: ClientReservation): boolean => {
  try {
    // 예약 취소
    const cancelled = cancelReservation(reservation.id);
    if (!cancelled) return false;
    
    // 재고 복구
    updateInventory(reservation.specificationId, 1);
    
    return true;
  } catch (error) {
    return false;
  }
};