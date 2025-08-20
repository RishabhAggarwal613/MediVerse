// src/pages/MediAi/components/MessageInput.jsx
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import useSpeechToText from '@/hooks/useSpeechToText.js';

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const formRef = useRef(null);

  const {
    isSupported,
    listening,
    transcript,
    start,
    stop,
    reset,
  } = useSpeechToText({ lang: 'en-IN', interimResults: true });

  useEffect(() => {
    if (transcript) setValue((v) => (v ? v + ' ' + transcript : transcript));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  function submit(e) {
    e?.preventDefault?.();
    const text = value.trim();
    if (!text || disabled) return;
    onSend?.(text);
    setValue('');
    reset();
  }

  return (
    <form ref={formRef} onSubmit={submit} className="flex w-full items-end gap-2">
      <div className="flex-1">
        <Input
          label={null}
          placeholder="Ask about your symptoms, reports, diet, or wearables…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
        />
      </div>

      {isSupported && (
        <Button
          type="button"
          variant="outline"
          onClick={listening ? stop : start}
          disabled={disabled}
          aria-pressed={listening}
          title={listening ? 'Stop voice input' : 'Start voice input'}
        >
          {listening ? 'Stop' : 'Voice'}
        </Button>
      )}

      <Button type="submit" disabled={disabled}>
        Send
      </Button>
    </form>
  );
}
