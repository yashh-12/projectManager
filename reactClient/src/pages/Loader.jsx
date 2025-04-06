import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full opacity-50 animate-ping"></div>
      </div>
    </div>
  );
};

export default Loader;
