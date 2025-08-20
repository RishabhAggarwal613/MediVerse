// src/components/ui/Card.jsx
import clsx from 'clsx';

export default function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[#1A1F1D] bg-[#0F1412] shadow-[0_0_0_1px_rgba(26,31,29,.2)_inset,0_10px_30px_rgba(0,0,0,.35)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, title, description, actions, children }) {
  return (
    <div className={clsx('flex items-start justify-between gap-3 p-5', className)}>
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
        {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
        {children}
      </div>
      {actions}
    </div>
  );
}

export function CardContent({ className, children }) {
  return <div className={clsx('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={clsx('border-t border-[#1A1F1D] p-5', className)}>{children}</div>;
}
