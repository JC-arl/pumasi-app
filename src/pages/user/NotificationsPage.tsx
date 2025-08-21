import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Calendar, Info, Gift } from 'lucide-react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  initializeDefaultNotifications,
  type NotificationItem 
} from '../../utils/notificationUtils';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    initializeDefaultNotifications();
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    setNotifications(allNotifications);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'unread') {
      return !notification.read;
    }
    return true;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm('이 알림을 삭제하시겠습니까?')) {
      deleteNotification(notificationId);
      loadNotifications();
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'RESERVATION_CONFIRMED':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'RESERVATION_CANCELLED':
        return <Calendar className="h-5 w-5 text-red-500" />;
      case 'PROMOTION':
        return <Gift className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 7 * 24 * 60) return `${Math.floor(diffInMinutes / (24 * 60))}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">알림</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            모두 읽음
          </button>
        )}
      </div>

      {/* 필터 탭 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedFilter === 'all'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            전체 ({notifications.length})
          </button>
          <button
            onClick={() => setSelectedFilter('unread')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedFilter === 'unread'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            읽지 않음 ({unreadCount})
          </button>
        </nav>
      </div>

      {/* 알림 목록 */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {selectedFilter === 'all' ? '알림이 없습니다' : '읽지 않은 알림이 없습니다'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            새로운 알림이 오면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-green-500' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 rounded"
                      title="읽음 처리"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}