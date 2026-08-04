import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
        {/* Inner reverse spinner for visual interest */}
        <div 
          className="absolute h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/10 border-t-emerald-400" 
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} 
        />
      </div>
      <p className="text-xs font-semibold tracking-wide text-zinc-400 animate-pulse">
        Verifying Session...
      </p>
    </div>
  );
}
