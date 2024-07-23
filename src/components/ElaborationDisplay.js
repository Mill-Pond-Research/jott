import React from 'react';

const ElaborationDisplay = ({ elaboration, onRegenerate }) => {
  return (
    <div className="mt-6 border rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-100 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-purple-700">AI Elaboration</h3>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-300"
          onClick={onRegenerate}
        >
          Regenerate
        </button>
      </div>
      <div className="p-4 bg-white">
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {elaboration || 'No elaboration available. Click "Elaborate" to generate insights.'}
        </div>
      </div>
    </div>
  );
};

export default ElaborationDisplay;
