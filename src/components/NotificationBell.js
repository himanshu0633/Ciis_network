// src/components/NotificationBell.js
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const { unreadCount, notifications, markAsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave_applied':
        return '📝';
      case 'leave_status_changed':
        return '🔄';
      case 'leave_deleted':
        return '🗑️';
      case 'task_overdue':
        return '⚠️';
      case 'attendance_absent':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;