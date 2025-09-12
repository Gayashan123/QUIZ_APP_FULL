import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorMessage({ message, onRetry, className = "" }) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-red-100 border border-red-400 text-red-700 rounded-md p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0" />
        <p className="text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm font-medium transition-colors duration-200"
          aria-label="Retry"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  );
}
