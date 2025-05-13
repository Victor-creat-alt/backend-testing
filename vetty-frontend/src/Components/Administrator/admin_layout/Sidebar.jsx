import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, ClipboardList, History, Home, Layers, ShoppingBag } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0); // Notifications removed

  const navItems = [
    { label: 'Dashboard', icon: <Home />, path: '/admin/dashboard' },
    { label: 'Products', icon: <Box />, path: '/admin/products' },
    { label: 'Services', icon: <Layers />, path: '/admin/services' },
    { label: 'Orders', icon: <ShoppingBag />, path: '/admin/orders' },
    { label: 'Appointments', icon: <ClipboardList />, path: '/admin/appointments' },
    { label: 'Service History', icon: <History />, path: '/admin/service-history' },
    { label: 'Purchase History', icon: <History />, path: '/admin/purchase-history' },
    // Notifications removed
  ];

  return (
    <div className={`bg-blue-600 text-white w-64 transition-all duration-300 ${isOpen ? 'block' : 'hidden'} md:block`}>
      <div className="p-4 font-bold text-xl border-b border-blue-400">Admin Panel</div>
      <nav className="p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => {
              onClose();
            }}
            className={`relative flex items-center justify-between p-2 rounded hover:bg-blue-500 ${
              location.pathname === item.path ? 'bg-blue-700' : ''
            }`}
          >
            <div className="relative flex items-center gap-2">
              <div className="relative">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
