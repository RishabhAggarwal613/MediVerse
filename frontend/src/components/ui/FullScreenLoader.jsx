// src/components/ui/FullScreenLoader.jsx
import Spinner from './Spinner.jsx';

export default function FullScreenLoader({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0B0F10]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#1A1F1D] bg-[#0F1412] px-6 py-6">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-gray-300">{message}</p>
      </div>
    </div>
  );
}
