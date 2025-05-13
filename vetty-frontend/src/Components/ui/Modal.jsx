import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center transition-opacity duration-300"
      style={{
        backgroundColor: 'rgba(128, 128, 128, 0.2)', // Slightly stronger grey with 20% opacity
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Title */}
        {title && <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;