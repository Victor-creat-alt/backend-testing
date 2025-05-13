import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between bg-white border-b p-4 shadow-sm">
      <button className="md:hidden" onClick={onToggleSidebar}>
        <Menu className="text-blue-600" />
      </button>
      <h1 className="text-lg font-semibold text-blue-700">Vet Admin Dashboard</h1>
    </header>
  );
};

export default Header;
