import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[480px] shadow-luxury animate-pulse">
      {/* Image area */}
      <div className="h-64 bg-slate-900 shimmer relative" />
      
      {/* Content area */}
      <div className="p-5 flex flex-col flex-grow">
        {/* City tag */}
        <div className="w-16 h-3 bg-slate-800 rounded shimmer mb-3" />
        
        {/* Title */}
        <div className="w-3/4 h-5 bg-slate-800 rounded shimmer mb-3" />
        
        {/* Description line 1 */}
        <div className="w-full h-3 bg-slate-800 rounded shimmer mb-2" />
        
        {/* Description line 2 */}
        <div className="w-5/6 h-3 bg-slate-800 rounded shimmer mb-6" />
        
        {/* Specs bar */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-900/60 pt-4 mb-6">
          <div className="h-4 bg-slate-800 rounded shimmer" />
          <div className="h-4 bg-slate-800 rounded shimmer" />
          <div className="h-4 bg-slate-800 rounded shimmer" />
        </div>
        
        {/* Price/Button row */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-auto">
          <div className="flex flex-col gap-1">
            <div className="w-10 h-2 bg-slate-800 rounded shimmer" />
            <div className="w-24 h-5 bg-slate-800 rounded shimmer" />
          </div>
          <div className="w-24 h-8 bg-slate-800 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
};

const SkeletonList = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
};

export { SkeletonCard, SkeletonList };
