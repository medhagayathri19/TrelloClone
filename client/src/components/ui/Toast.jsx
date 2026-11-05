import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-brand-600 flex-shrink-0" />,
};

const borderColors = {
  success: 'border-emerald-200 bg-white/95',
  error: 'border-rose-200 bg-white/95',
  info: 'border-brand-200 bg-white/95',
};

export const Toast = ({ id, message, type = 'info', duration = 3500, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
        borderColors[type] || borderColors.info
      } text-slate-800 text-sm max-w-sm w-full`}
    >
      {icons[type] || icons.info}
      <p className="flex-1 font-medium leading-tight">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;

