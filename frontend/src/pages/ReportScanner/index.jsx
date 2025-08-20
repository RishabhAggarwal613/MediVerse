// src/pages/ReportScanner/index.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import UploadDropzone from './components/UploadDropzone.jsx';
import UploadProgress from './components/UploadProgress.jsx';
import AnalysisView from './components/AnalysisView.jsx';
import Button from '@/components/ui/Button.jsx';
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import { uploadReport, analyzeReport } from '@/services/reportClient.js';
import { getErrorMessage, formatBytes } from '@/lib/utils.js';
import { reportFileSchema } from '@/lib/validators.js';

export default function ReportScannerPage() {
  const [file, setFile] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | uploading | analyzing | done | error
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [err, setErr] = useState('');
  const abortRef = useRef(null);

  useEffect(() => {
    document.title = 'Report Scanner • MediVerse';
    return () => abortRef.current?.abort?.();
  }, []);

  const canReset = useMemo(() => phase === 'done' || phase === 'error', [phase]);

  function resetAll() {
    abortRef.current?.abort?.();
    setFile(null);
    setUploadId(null);
    setProgress(0);
    setPhase('idle');
    setResult(null);
    setMeta(null);
    setErr('');
  }

  async function startFlow(selectedFile, setDropError) {
    // validate file
    const parsed = reportFileSchema.safeParse(selectedFile);
    if (!parsed.success) {
      setDropError?.(parsed.error?.errors?.[0]?.message || 'Invalid file');
      return;
    }
    setFile(selectedFile);
    setErr('');
    setResult(null);
    setMeta({ name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });

    // upload
    setPhase('uploading');
    setProgress(0);
    try {
      abortRef.current?.abort?.();
      abortRef.current = new AbortController();
      const data = await uploadReport(selectedFile, {
        signal: abortRef.current.signal,
        onUploadProgress: (e) => {
          if (!e.total) return;
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        },
      });
      setUploadId(data.uploadId);

      // analyze
      setPhase('analyzing');
      const res = await analyzeReport({ uploadId: data.uploadId }, abortRef.current.signal);
      setResult(res.analysis || res);
      setPhase('done');
    } catch (e) {
      setErr(getErrorMessage(e, 'Failed to scan the report'));
      setPhase('error');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Scan your lab report"
          description="Drop a PDF, PNG or JPG. We’ll extract ranges, flags, and a summary."
          actions={canReset ? <Button variant="outline" onClick={resetAll}>Scan another</Button> : null}
        />
        <CardContent className="space-y-4">
          {phase === 'idle' && <UploadDropzone onFile={startFlow} />}

          {phase === 'uploading' && (
            <>
              <div className="rounded-xl border border-[#1A1F1D] bg-[#0F1412] p-4 text-sm text-gray-300">
                <p>
                  Uploading <span className="text-gray-100">{meta?.name}</span> •{' '}
                  {formatBytes(meta?.size || 0)}
                </p>
              </div>
              <UploadProgress progress={progress} label="Uploading your file…" />
            </>
          )}

          {phase === 'analyzing' && (
            <UploadProgress progress={100} label="Analyzing your report…" />
          )}

          {phase === 'error' && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {err}
              <div className="mt-3">
                <Button variant="outline" onClick={resetAll}>Try again</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {phase === 'done' && <AnalysisView result={result} />}
    </div>
  );
}
