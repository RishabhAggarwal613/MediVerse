// src/components/ui/Modal.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export default function Modal({ open, onClose, title, children, actions, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      aria-modal="true"
      role="dialog"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className={clsx(
          'relative z-10 w-[92vw] max-w-lg rounded-2xl border border-[#1A1F1D] bg-[#0F1412] p-5 shadow-xl',
          className
        )}
      >
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="mt-3">{children}</div>
        {actions && <div className="mt-5 flex justify-end gap-3">{actions}</div>}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-gray-400 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
