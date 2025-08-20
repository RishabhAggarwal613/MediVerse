// src/pages/MediAi/index.js
import { useEffect, useMemo, useRef, useState } from 'react';
import SafetyBanner from './components/SafetyBanner.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import { askAI } from '@/services/aiClient.js';
import FullScreenLoader from '@/components/ui/FullScreenLoader.jsx';
import { getErrorMessage } from '@/lib/utils.js';

let nextId = 1;

export default function MediAiPage() {
  const [messages, setMessages] = useState(() => [
    {
      id: nextId++,
      role: 'assistant',
      content:
        'Hi! I’m MediAI. Describe your symptom or upload a report in the Scanner. I can also guide diet and wearable insights.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    document.title = 'MediAI • MediVerse';
    return () => {
      abortRef.current?.abort?.();
    };
  }, []);

  const context = useMemo(
    () => ({
      history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
    }),
    [messages]
  );

  function handlePickQuick(text) {
    handleSend(text);
  }

  async function handleSend(text) {
    const userMsg = { id: nextId++, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      abortRef.current?.abort?.();
      abortRef.current = new AbortController();

      const res = await askAI(
        { message: text, context },
        abortRef.current.signal
      );

      const replyText =
        typeof res?.reply === 'string'
          ? res.reply
          : 'Sorry, I could not process that right now. Please try again.';
      setMessages((prev) => [...prev, { id: nextId++, role: 'assistant', content: replyText }]);
    } catch (e) {
      const msg = getErrorMessage(e, 'Network error');
      setMessages((prev) => [
        ...prev,
        { id: nextId++, role: 'assistant', content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <SafetyBanner />
      <ChatWindow
        messages={messages}
        onPickQuick={handlePickQuick}
        onSend={handleSend}
        loading={loading}
      />
      {false && <FullScreenLoader />} {/* reserved for future streaming state */}
    </div>
  );
}
