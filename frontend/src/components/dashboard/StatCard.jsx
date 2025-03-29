import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'bg-gray-700', percentage }) => {
  return (
    <div className={`${color} bg-opacity-20 rounded-lg p-6 border border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
          {percentage && (
            <div className="mt-1 text-sm">
              <span className={percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                {percentage > 0 ? '+' : ''}{percentage}%
              </span>
            </div>
          )}
        </div>
        <div className={`${color} bg-opacity-20 rounded-full p-3`}>
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
