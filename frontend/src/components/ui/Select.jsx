// src/components/ui/Select.jsx
import { forwardRef, useId } from 'react';
import clsx from 'clsx';

const Select = forwardRef(
  ({ label, error, helperText, className, children, ...props }, ref) => {
    const id = useId();
    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label htmlFor={id} className="mb-1 inline-block text-sm text-gray-300">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={clsx(
            'w-full rounded-xl border border-[#1A1F1D] bg-[#0B0F10] px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500/60',
            error && 'border-red-500/60 focus:ring-red-500/50'
          )}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {(error || helperText) && (
          <p className={clsx('mt-1 text-xs', error ? 'text-red-400' : 'text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

export default Select;
