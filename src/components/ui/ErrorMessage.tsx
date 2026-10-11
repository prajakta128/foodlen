import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  fullHeight?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  action,
  fullHeight = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullHeight ? 'min-h-screen' : 'py-12'} px-4`}>
      <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>}
      <p className="text-gray-600 text-center mb-6 max-w-sm">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default ErrorMessage;
