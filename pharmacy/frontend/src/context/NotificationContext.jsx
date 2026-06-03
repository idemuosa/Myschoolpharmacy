import React, { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../services/socket';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const handleNewPrescription = (data) => {
            const newNotif = {
                id: Date.now(),
                type: 'prescription',
                title: 'New Prescription',
                message: `Patient: ${data.patientName || 'Unknown'}`,
                time: new Date().toLocaleTimeString(),
                read: false,
                link: '/prescriptions/review'
            };
            addNotification(newNotif);
        };

        const handleLowStock = (data) => {
            const newNotif = {
                id: Date.now(),
                type: 'stock',
                title: 'Low Stock Alert',
                message: data.message,
                time: new Date().toLocaleTimeString(),
                read: false,
                link: '/inventory'
            };
            addNotification(newNotif);
        };

        socket.on('alert_new_prescription', handleNewPrescription);
        socket.on('low_stock_alert', handleLowStock);

        return () => {
            socket.off('alert_new_prescription', handleNewPrescription);
            socket.off('low_stock_alert', handleLowStock);
        };
    }, []);

    const addNotification = (notif) => {
        setNotifications(prev => [notif, ...prev].slice(0, 50)); // Keep last 50
        setUnreadCount(prev => prev + 1);
        toast(notif.title, { icon: '🔔' });
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
