// src/components/ui/Input.jsx
import { forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const base =
  'w-full rounded-xl border bg-[#0B0F10] border-[#1A1F1D] px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-emerald-500/60';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      type = 'text',
      className,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [show, setShow] = useState(false);
    const isPassword = type === 'password';

    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label htmlFor={id} className="mb-1 inline-block text-sm text-gray-300">
            {label}
          </label>
        )}

        <div className={clsx('flex items-center gap-2')}>
          {leftAddon && <div className="text-gray-400">{leftAddon}</div>}

          <div className="relative flex-1">
            <input
              id={id}
              ref={ref}
              type={isPassword ? (show ? 'text' : 'password') : type}
              className={clsx(
                base,
                error && 'border-red-500/60 focus:ring-red-500/50 pr-9'
              )}
              aria-invalid={!!error}
              {...props}
            />
            {isPassword && (
              <button
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
              >
                {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            )}
          </div>

          {rightAddon && <div className="text-gray-400">{rightAddon}</div>}
        </div>

        {(error || helperText) && (
          <p className={clsx('mt-1 text-xs', error ? 'text-red-400' : 'text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

export default Input;
