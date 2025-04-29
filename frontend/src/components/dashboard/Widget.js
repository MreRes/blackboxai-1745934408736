import React from 'react';

function Widget({ title, children, onToggle }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onToggle}
          className="text-sm text-primary-600 hover:text-primary-800 focus:outline-none"
          aria-label={`Toggle ${title} widget`}
        >
          Toggle
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default Widget;
