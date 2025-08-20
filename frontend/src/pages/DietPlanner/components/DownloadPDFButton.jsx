// src/pages/DietPlanner/components/DownloadPDFButton.jsx
import { useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import { downloadDietPdf } from '@/services/dietClient.js';
import { downloadBlob, getErrorMessage } from '@/lib/utils.js';

export default function DownloadPDFButton({ planId, className }) {
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    if (!planId) return;
    setLoading(true);
    try {
      const blob = await downloadDietPdf({ planId });
      downloadBlob(blob, `diet-plan-${planId}.pdf`);
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to download PDF'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className={className} onClick={onDownload} loading={loading} disabled={!planId}>
      Download PDF
    </Button>
  );
}
