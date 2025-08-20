// src/hooks/useSpeechToText.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function useSpeechToText({
  lang = 'en-IN',
  continuous = true,
  interimResults = true,
  autoStart = false,
  onResult, // optional callback(finalTranscript, interimTranscript)
} = {}) {
  const Recognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition || null);

  const isSupported = useMemo(() => Boolean(Recognition), [Recognition]);
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupported) return;
    const r = new Recognition();
    r.lang = lang;
    r.continuous = continuous;
    r.interimResults = interimResults;

    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);

    r.onerror = (e) => {
      setError(e.error || 'speech_error');
      setListening(false);
    };

    r.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += txt;
        else interim += txt;
      }
      setInterimTranscript(interim);
      if (final) {
        setFinalTranscript((prev) => (prev ? `${prev} ${final}` : final));
      }
      onResult?.(final, interim);
    };

    recognitionRef.current = r;
    return () => {
      try {
        r.onresult = r.onend = r.onerror = null;
        r.abort();
      } catch {}
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Recognition, lang, continuous, interimResults, isSupported, onResult]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
    } catch {
      // can throw if already started; ignore
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  }, []);

  const reset = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  useEffect(() => {
    if (autoStart && isSupported) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isSupported]);

  return {
    isSupported,
    listening,
    transcript: `${finalTranscript}${interimTranscript ? ' ' + interimTranscript : ''}`.trim(),
    finalTranscript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
