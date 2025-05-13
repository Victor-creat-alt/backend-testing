import React from 'react';

export const Input = ({ type = 'text', placeholder, value, onChange, name, className }) => {
  const safeValue = value === undefined || value === null ? '' : value;
  return (
    <input
      type={type}
      name={name} // Ensure the name prop is passed
      value={safeValue}
      onChange={onChange} // Ensure the onChange handler is passed
      placeholder={placeholder}
      className={`border rounded-md p-2 w-full ${className}`}
    />
  );
};

export default Input;
