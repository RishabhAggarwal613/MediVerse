// src/components/ui/Button.jsx
import { forwardRef } from 'react';
import clsx from 'clsx';
import Spinner from './Spinner.jsx';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-emerald-500 text-black hover:bg-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,.25)]',
  outline:
    'border border-[#1A1F1D] bg-transparent text-gray-100 hover:bg-emerald-500/10',
  ghost:
    'bg-transparent text-gray-200 hover:bg-white/5',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-[0.95rem]',
  lg: 'h-12 px-5 text-base',
};

const Button = forwardRef(
  ({ as: Comp = 'button', className, variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <Comp
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Spinner className="h-4 w-4 border-2" /> : leftIcon}
        <span>{children}</span>
        {rightIcon}
      </Comp>
    );
  }
);

export default Button;
