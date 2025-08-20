// src/pages/ReportScanner/components/UploadProgress.jsx
export default function UploadProgress({ progress = 0, label = 'Uploading…' }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className="surface p-5">
      <p className="text-sm text-gray-300">{label}</p>
      <div className="mt-3 h-2 w-full rounded-full bg-[#0B0F10]">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs text-gray-400">{pct}%</p>
    </div>
  );
}
