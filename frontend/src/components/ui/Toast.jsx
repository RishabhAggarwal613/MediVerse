// src/components/ui/Toast.jsx
import { useEffect } from 'react';
import clsx from 'clsx';

export default function Toast({ type = 'info', onClose, children }) {
  useEffect(() => {
    const id = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(id);
  }, [onClose]);

  const styles =
    type === 'success'
      ? 'bg-emerald-600 text-black'
      : type === 'error'
      ? 'bg-red-600 text-white'
      : type === 'warning'
      ? 'bg-amber-600 text-black'
      : 'bg-[#0F1412] text-gray-100 border border-[#1A1F1D]';

  return (
    <div className={clsx('rounded-xl px-3 py-2 text-sm shadow-lg', styles)} role="status">
      <div className="flex items-center justify-between gap-4">
        <span>{children}</span>
        <button
          onClick={onClose}
          className="opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-md px-1"
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

