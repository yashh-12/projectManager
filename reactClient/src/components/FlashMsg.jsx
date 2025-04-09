import React from 'react';

function FlashMsg({ message, setMessage }) {
  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-2xl px-6 py-4 flex items-start gap-4 rounded-xl shadow-lg border-2 bg-green-100 border-green-500 text-green-800">
      <p className="flex-1 text-sm md:text-base font-medium">
        {message}
      </p>
      <button
        onClick={() => setMessage("")}
        className="text-green-700 hover:text-green-900 font-bold text-lg leading-none"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default FlashMsg;
