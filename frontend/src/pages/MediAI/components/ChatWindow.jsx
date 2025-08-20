// src/pages/MediAi/components/ChatWindow.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';
import QuickReplies from './QuickReplies.jsx';
import MessageInput from './MessageInput.jsx';

function Bubble({ role, content }) {
  const mine = role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
          mine
            ? 'bg-emerald-500 text-black'
            : 'bg-[#0F1412] text-gray-100 border border-[#1A1F1D]'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default function ChatWindow({
  messages = [],
  onPickQuick,
  onSend,
  loading = false,
}) {
  return (
    <Card className="flex h-[65vh] flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        {/* Messages list */}
        <div className="thin-scroll flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm text-gray-400">
              <div>
                <p className="text-gray-300">Start a conversation with MediAI</p>
                <p className="mt-1 text-gray-500">Your chats are private and won’t be shared.</p>
              </div>
            </div>
          ) : (
            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
          )}
        </div>

        {/* Quick replies */}
        <QuickReplies onPick={onPickQuick} />

        {/* Composer */}
        <div className="border-t border-[#1A1F1D] pt-3">
          <MessageInput onSend={onSend} disabled={loading} />
        </div>
      </CardContent>
    </Card>
  );
}
