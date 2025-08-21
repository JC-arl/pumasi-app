export interface NotificationItem {
  id: string;
  type: 'RESERVATION_CONFIRMED' | 'RESERVATION_CANCELLED' | 'RESERVATION_APPROVED' | 'RESERVATION_REJECTED' | 'RESERVATION_CHECKOUT' | 'RESERVATION_RETURNED' | 'SYSTEM_INFO' | 'PROMOTION';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: any;
}

const NOTIFICATIONS_KEY = 'clientNotifications';

// 알림 목록 조회
export const getNotifications = (): NotificationItem[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// 알림 추가
export const addNotification = (notification: Omit<NotificationItem, 'id' | 'createdAt'>): string => {
  const notifications = getNotifications();
  const newNotification: NotificationItem = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  
  // 최신 알림을 맨 앞에 추가
  notifications.unshift(newNotification);
  
  // 최대 100개까지만 저장
  const limitedNotifications = notifications.slice(0, 100);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(limitedNotifications));
  
  return newNotification.id;
};

// 알림 읽음 처리
export const markAsRead = (notificationId: string): boolean => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (!notification) return false;
  
  notification.read = true;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  return true;
};

// 모든 알림 읽음 처리
export const markAllAsRead = (): void => {
  const notifications = getNotifications();
  notifications.forEach(notification => {
    notification.read = true;
  });
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// 읽지 않은 알림 개수
export const getUnreadCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

// 알림 삭제
export const deleteNotification = (notificationId: string): boolean => {
  const notifications = getNotifications();
  const filteredNotifications = notifications.filter(n => n.id !== notificationId);
  
  if (filteredNotifications.length === notifications.length) return false;
  
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filteredNotifications));
  return true;
};

// 예약 관련 알림 생성 헬퍼
export const createReservationNotification = (type: 'confirmed' | 'cancelled', machineryName: string, reservationId: string) => {
  if (type === 'confirmed') {
    return addNotification({
      type: 'RESERVATION_CONFIRMED',
      title: '예약이 완료되었습니다',
      message: `${machineryName} 예약이 성공적으로 완료되었습니다.`,
      read: false,
      actionUrl: '/my/reservations',
      data: { reservationId }
    });
  } else {
    return addNotification({
      type: 'RESERVATION_CANCELLED',
      title: '예약이 취소되었습니다',
      message: `${machineryName} 예약이 취소되었습니다.`,
      read: false,
      actionUrl: '/my/reservations',
      data: { reservationId }
    });
  }
};

// 예약 상태 변경 알림 생성
export const createStatusChangeNotification = (status: string, machineryName: string, reservationId: string, reason?: string) => {
  const notifications = {
    'APPROVED': {
      type: 'RESERVATION_APPROVED' as const,
      title: '예약이 승인되었습니다',
      message: `${machineryName} 예약이 승인되었습니다. 곧 출고 준비가 시작됩니다.`
    },
    'REJECTED': {
      type: 'RESERVATION_REJECTED' as const,
      title: '예약이 반려되었습니다',
      message: `${machineryName} 예약이 반려되었습니다.${reason ? ` 사유: ${reason}` : ''}`
    },
    'CHECKED_OUT': {
      type: 'RESERVATION_CHECKOUT' as const,
      title: '농기계가 출고되었습니다',
      message: `${machineryName}가 출고되었습니다. 안전하게 이용해주세요.`
    },
    'RETURNED': {
      type: 'RESERVATION_RETURNED' as const,
      title: '농기계 반납이 완료되었습니다',
      message: `${machineryName} 반납이 완료되었습니다. 이용해주셔서 감사합니다.`
    },
    'CANCELLED': {
      type: 'RESERVATION_CANCELLED' as const,
      title: '예약이 취소되었습니다',
      message: `${machineryName} 예약이 취소되었습니다.${reason ? ` 사유: ${reason}` : ''}`
    }
  };

  const notificationData = notifications[status as keyof typeof notifications];
  if (notificationData) {
    return addNotification({
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      read: false,
      actionUrl: '/my/reservations',
      data: { reservationId }
    });
  }
};

// 기본 알림 데이터 생성 (최초 실행 시)
export const initializeDefaultNotifications = () => {
  const notifications = getNotifications();
  
  if (notifications.length === 0) {
    // 환영 알림
    addNotification({
      type: 'SYSTEM_INFO',
      title: '농기계 임대 서비스에 오신 것을 환영합니다!',
      message: '필요한 농기계를 쉽고 빠르게 예약하고 이용해보세요. 지도에서 가까운 임대소를 찾아보세요.',
      read: false,
      actionUrl: '/map'
    });
    
    // 이용 안내 알림
    addNotification({
      type: 'SYSTEM_INFO',
      title: '농기계 예약 이용 안내',
      message: '예약 후 취소는 이용 1일 전까지 가능하며, 농기계 운전 면허증을 반드시 지참해주세요.',
      read: false
    });
  }
};