import { FC } from "react";

export const TransactionsSkeleton: FC = () => {
  const renderSkeletonRow = () => (
    <div className="flex flex-col gap-1 pb-4">
      <div className="flex gap-4 justify-between">
        <div className="flex flex-col gap-2">
          <div className="bg-gray-200 rounded-md w-24 h-4 animate-pulse"></div>
          <div className="bg-gray-200 rounded-md w-16 h-4 animate-pulse"></div>
        </div>
        <div className="flex items-center">
          <div className="bg-gray-200 rounded-full w-6 h-6 animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-gray-200 rounded-md w-24 h-4 animate-pulse"></div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="bg-gray-200 rounded-md w-28 h-5 animate-pulse"></div>
        <div className="bg-gray-200 rounded-md w-20 h-5 animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white/50 rounded-2xl p-4">
          {renderSkeletonRow()}
        </div>
      ))}
    </div>
  );
};
