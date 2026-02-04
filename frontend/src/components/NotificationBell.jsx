import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const dropdownRef = useRef(null);

    const { user } = useAuth();
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (!user?.user?.id) return;

        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [user?.user?.id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/${user?.user?.id}/count`);
            const data = await response.json();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/notifications/${user?.user?.id}?limit=10`);
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read
        try {
            await fetch(`${BASE_URL}/api/notifications/${notification.id}/read`, {
                method: 'PUT'
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Navigate to file if file_id exists
            if (notification.file_id) {
                setIsOpen(false);
                navigate('/fileinbox');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await fetch(`${BASE_URL}/api/notifications/${user?.user?.id}/read-all`, {
                method: 'PUT'
            });

            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPROVED':
                return '✅';
            case 'REJECTED':
                return '❌';
            case 'Query_Raised':
                return '❓';
            case 'FORWARDED':
                return '➡️';
            default:
                return 'ℹ️';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'APPROVED':
                return '#28a745';
            case 'REJECTED':
                return '#dc3545';
            case 'Query_Raised':
                return '#ffc107';
            case 'FORWARDED':
                return '#17a2b8';
            default:
                return '#6c757d';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={handleBellClick}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px',
                    fontSize: '20px'
                }}
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '50%',
                            minWidth: '18px',
                            height: '18px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px'
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        // Mobile: open to left (right-aligned), Desktop: open to right (left-aligned)
                        ...(isMobile ? { right: 0 } : { left: 0 }),
                        top: '100%',
                        width: isMobile ? 'min(350px, 90vw)' : '350px',
                        maxHeight: '400px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                            Notifications
                        </h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#007bff',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications list */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</div>
                                <p style={{ margin: 0 }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{
                                        padding: '12px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        cursor: 'pointer',
                                        backgroundColor: notification.is_read ? 'white' : '#f0f7ff',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = notification.is_read ? 'white' : '#f0f7ff'}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: getNotificationColor(notification.type) + '20',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p
                                                style={{
                                                    margin: '0 0 4px 0',
                                                    fontSize: '13px',
                                                    lineHeight: '1.4',
                                                    color: '#333',
                                                    fontWeight: notification.is_read ? 'normal' : '500'
                                                }}
                                            >
                                                {notification.message}
                                            </p>
                                            <span
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#888'
                                                }}
                                            >
                                                {formatTime(notification.created_at)}
                                            </span>
                                        </div>
                                        {!notification.is_read && (
                                            <div
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#007bff',
                                                    flexShrink: 0,
                                                    marginTop: '6px'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
