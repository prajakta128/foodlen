import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message, fullHeight = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'min-h-screen' : 'py-12'} px-4`}>
      <svg className="animate-spin h-10 w-10 text-emerald-600 mb-4" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && <p className="text-gray-600 text-center">{message}</p>}
    </div>
  );
};

export default LoadingState;
