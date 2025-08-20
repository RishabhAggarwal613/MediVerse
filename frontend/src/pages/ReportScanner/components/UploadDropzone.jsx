// src/pages/ReportScanner/components/UploadDropzone.jsx
import { useCallback, useRef, useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import { MIME } from '@/lib/constants.js';

export default function UploadDropzone({ onFile }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const accept = MIME.REPORTS.join(',');

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0];
      if (!file) return;
      setError('');
      onFile?.(file, setError);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`surface grid place-items-center px-6 py-12 text-center ${dragOver ? 'ring-2 ring-emerald-500/60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div>
        <p className="text-lg font-semibold text-gray-100">Drop your lab report</p>
        <p className="mt-1 text-sm text-gray-400">PDF, PNG, or JPG • max 10 MB</p>
        <div className="mt-4 flex justify-center gap-3">
          <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Browse…
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
