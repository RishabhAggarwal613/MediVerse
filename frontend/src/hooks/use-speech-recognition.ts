"use client";

import * as React from "react";

/**
 * Subset of Web Speech API instance typings — some TS `lib.dom` builds omit
 * `SpeechRecognition` / `SpeechRecognitionEvent` while keeping result types.
 */
type WebSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((ev: WebSpeechRecognitionResultEvent) => void) | null;
  onerror: ((ev: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type WebSpeechRecognitionResultEvent = Event & {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
};

type WebSpeechRecognitionErrorEvent = Event & {
  readonly error: string;
};

/** BCP-47 tags for Web Speech API — engine quality varies by browser/OS. */
export const SPEECH_RECOGNITION_LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", label: "French" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "zh-CN", label: "Chinese (Mandarin)" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "ar-SA", label: "Arabic" },
  { value: "bn-IN", label: "Bengali (India)" },
  { value: "ta-IN", label: "Tamil (India)" },
  { value: "te-IN", label: "Telugu (India)" },
  { value: "mr-IN", label: "Marathi (India)" },
  { value: "pa-IN", label: "Punjabi (India)" },
  { value: "ur-PK", label: "Urdu" },
];

export function getSpeechRecognitionConstructor(): (new () => WebSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => WebSpeechRecognition;
      webkitSpeechRecognition?: new () => WebSpeechRecognition;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type UseSpeechRecognitionOptions = {
  lang: string;
  onFinal: (text: string) => void;
};

export type UseSpeechRecognitionResult = {
  supported: boolean;
  listening: boolean;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
};

function mapSpeechError(code: string): string {
  switch (code) {
    case "not-allowed":
      return "Microphone permission denied. Allow mic access in your browser settings, or type instead.";
    case "no-speech":
      return "No speech detected. Try again or speak closer to the mic.";
    case "audio-capture":
      return "No microphone found. Check your device settings.";
    case "network":
      return "Voice recognition needs a network connection in this browser.";
    case "aborted":
      return "";
    case "service-not-allowed":
      return "Voice recognition is not allowed. Check browser settings.";
    default:
      return "Voice input failed. You can type your message instead.";
  }
}

export function useSpeechRecognition({
  lang,
  onFinal,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const [listening, setListening] = React.useState(false);
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<WebSpeechRecognition | null>(null);
  const onFinalRef = React.useRef(onFinal);
  onFinalRef.current = onFinal;

  const [supported, setSupported] = React.useState(false);
  React.useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionConstructor()));
  }, []);

  const stop = React.useCallback(() => {
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.stop();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
    setInterimTranscript("");
  }, []);

  const start = React.useCallback(() => {
    setError(null);
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setError("Voice input is not supported in this browser.");
      return;
    }
    stop();
    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: WebSpeechRecognitionResultEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const row = event.results[i];
        const piece = row[0]?.transcript ?? "";
        if (row.isFinal) {
          const t = piece.trim();
          if (t) onFinalRef.current(t);
        } else {
          interim += piece;
        }
      }
      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (ev: WebSpeechRecognitionErrorEvent) => {
      const msg = mapSpeechError(ev.error);
      if (msg) setError(msg);
      if (ev.error !== "aborted") setListening(false);
      setInterimTranscript("");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setInterimTranscript("");
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Could not start voice input.");
      setListening(false);
    }
  }, [lang, stop]);

  React.useEffect(() => () => stop(), [stop]);

  return {
    supported,
    listening,
    interimTranscript,
    error,
    start,
    stop,
  };
}
