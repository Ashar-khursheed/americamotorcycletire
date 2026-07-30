import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#121212] border border-[#222222] rounded-lg overflow-hidden flex flex-col justify-between animate-pulse">
      {/* Image Skeleton */}
      <div className="relative bg-[#1A1A1A] h-64 w-full flex items-center justify-center p-6">
        <div className="w-3/4 h-3/4 bg-[#262626] rounded-md" />
        <div className="absolute top-3 left-3 w-16 h-4 bg-[#262626] rounded" />
        <div className="absolute top-3 right-3 w-20 h-4 bg-[#262626] rounded" />
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-[#262626] rounded w-full" />
          <div className="h-5 bg-[#262626] rounded w-3/4" />
          <div className="h-3 bg-[#222222] rounded w-full mt-3" />
          <div className="h-3 bg-[#222222] rounded w-5/6" />
        </div>

        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="h-7 bg-[#262626] rounded w-24" />
            <div className="h-4 bg-[#222222] rounded w-16" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-[#262626] rounded" />
            <div className="h-10 bg-[#262626] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
