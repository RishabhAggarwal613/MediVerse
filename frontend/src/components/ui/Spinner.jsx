// src/components/ui/Spinner.jsx
export default function Spinner({ className = '' }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent text-emerald-500 ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}
