import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import { Button } from '../../ui/buttons';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Notifications</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleNotificationClick(notification)}
          >
            <h3 className="text-lg font-semibold text-blue-800">{notification.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{notification.details}</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedNotification && (
        <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Notification Details">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">{selectedNotification.title}</h3>
            <p className="mt-2 text-gray-700">{selectedNotification.details}</p>
          </div>
          <Button onClick={handleModalClose} variant="primary" size="md" className="mt-4">
            Close
          </Button>
        </Modal>
      )}
    </div>
  );
};

export default Notifications;
