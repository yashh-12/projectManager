import React from 'react';

function Error({ error, setError }) {
  if (!error) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-2xl px-6 py-4 flex items-start gap-4 rounded-xl shadow-lg border-2 bg-red-100 border-red-500 text-red-800">
      <p className="flex-1 text-sm md:text-base font-medium">
        {error}
      </p>
      <button
        onClick={() => setError("")}
        className="text-red-700 hover:text-red-900 font-bold text-lg leading-none"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

export default Error;
