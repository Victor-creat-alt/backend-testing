// /components/ui/card.jsx

import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
