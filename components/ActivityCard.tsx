import React from 'react';

interface Props {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ActivityCard: React.FC<Props> = ({ title, icon, children }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex-shrink-0 text-blue-400">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};

export default ActivityCard;