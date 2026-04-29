"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Bot } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  createAiChatSession,
  fetchAiChatMessages,
  fetchAiChatSessions,
  fetchDailyHealthTip,
  sendAiChatMessage,
} from "@/lib/api/ai";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import type { AiChatMessageDto, AiChatSessionDto, SendAiChatMessagesResponseDto } from "@/types/ai";

function isUserRole(role: string) {
  return role?.toUpperCase() === "USER";
}

/** Normalize createdAt whether API sends ISO string or structured date parts. */
function parseCreatedAt(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    try {
      return new Date(
        Date.UTC(raw[0] as number, (raw[1] as number) - 1, raw[2] as number),
      ).toISOString();
    } catch {
      return "";
    }
  }
  return "";
}

function formatTs(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

type SendResult = { data: SendAiChatMessagesResponseDto; sessionId: number };

export default function PatientAiAssistantPage() {
  const qc = useQueryClient();
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null);
  const [pendingOutgoing, setPendingOutgoing] = React.useState<string | null>(null);
  const lastFailedDraft = React.useRef("");
  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);

  const sessionsQ = useQuery({
    queryKey: ["ai", "sessions"],
    queryFn: () => fetchAiChatSessions(),
  });

  const messagesQ = useQuery({
    queryKey: ["ai", "sessions", activeSessionId, "messages"],
    queryFn: () => fetchAiChatMessages(activeSessionId as number),
    enabled: typeof activeSessionId === "number",
    staleTime: 10_000,
  });

  const tipQ = useQuery({
    queryKey: ["ai", "health-tip"],
    queryFn: () => fetchDailyHealthTip(),
    retry: 1,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    const list = sessionsQ.data;
    if (!list?.length || activeSessionId !== null) return;
    setActiveSessionId(list[0].id);
  }, [sessionsQ.data, activeSessionId]);

  const [draft, setDraft] = React.useState("");

  const createMut = useMutation({
    mutationFn: () => createAiChatSession(),
    onSuccess: (sess) => {
      void qc.invalidateQueries({ queryKey: ["ai", "sessions"] });
      setActiveSessionId(sess.id);
      qc.setQueryData<AiChatMessageDto[]>(
        ["ai", "sessions", sess.id, "messages"],
        [],
      );
    },
  });

  const sendMut = useMutation({
    mutationFn: async ({
      sessionIdHint,
      content,
    }: {
      sessionIdHint: number | null;
      content: string;
    }): Promise<SendResult> => {
      let sessionId = sessionIdHint;
      if (sessionId === null) {
        const s = await createAiChatSession();
        qc.setQueryData<AiChatSessionDto[]>(["ai", "sessions"], (prev) => {
          const p = [...(prev ?? [])];
          if (!p.some((x) => x.id === s.id)) p.unshift(s);
          return p;
        });
        setActiveSessionId(s.id);
        sessionId = s.id;
      }
      const data = await sendAiChatMessage(sessionId, content);
      return { data, sessionId };
    },
    onMutate: ({ content }) => {
      setPendingOutgoing(content);
    },
    onSuccess: ({ data, sessionId }) => {
      setPendingOutgoing(null);
      qc.setQueryData<AiChatMessageDto[]>(
        ["ai", "sessions", sessionId, "messages"],
        (prev) => {
          const p = [...(prev ?? [])];
          const ids = new Set(p.map((m) => m.id));
          if (!ids.has(data.userMessage.id)) p.push(data.userMessage);
          if (!ids.has(data.assistantMessage.id)) p.push(data.assistantMessage);
          return p.sort(
            (a, b) =>
              new Date(parseCreatedAt(a.createdAt) || String(a.createdAt)).getTime() -
              new Date(parseCreatedAt(b.createdAt) || String(b.createdAt)).getTime(),
          );
        },
      );
      void qc.invalidateQueries({ queryKey: ["ai", "sessions"] });
      void qc.invalidateQueries({ queryKey: ["ai", "sessions", sessionId, "messages"] });
    },
    onError: () => {
      setPendingOutgoing(null);
      if (lastFailedDraft.current) {
        setDraft(lastFailedDraft.current);
      }
    },
  });

  React.useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messagesQ.data, pendingOutgoing, sendMut.isPending]);

  function submitMessage() {
    const text = draft.trim();
    if (!text || sendMut.isPending) return;
    lastFailedDraft.current = text;
    setDraft("");
    sendMut.mutate({ sessionIdHint: activeSessionId, content: text });
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMessage();
  }

  const sessions = sessionsQ.data ?? [];
  const msgs = messagesQ.data ?? [];
  const activeMeta = sessions.find((s) => s.id === activeSessionId);
  const composerDisabled = sendMut.isPending;

  return (
    <AppPageShell variant="patient">
      <Container className="relative z-[1] max-w-6xl py-8">
        <AppPageHeader
          role="patient"
          pill="Wellness AI"
          icon={Bot}
          title="Health assistant"
          description="General health literacy — not medical advice. For emergencies, seek urgent care immediately."
          className="mb-8"
        />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="space-y-4">
          <div className="surface-app space-y-4 p-4 shadow-md">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Today&apos;s tip</p>
            {tipQ.isPending && (
              <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
            )}
            {tipQ.error && (
              <p className="mt-2 text-sm text-destructive">{unwrapApiErrorMessage(tipQ.error)}</p>
            )}
            {tipQ.data && (
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{tipQ.data.tip}</p>
            )}
            {tipQ.data && (
              <p className="mt-3 text-xs text-muted-foreground">
                Day {tipQ.data.dayUtc} ({tipQ.data.timezone})
              </p>
            )}
          </div>

          <div className="surface-app p-4 shadow-md">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Conversations</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={createMut.isPending}
                onClick={() => createMut.mutate()}
              >
                {createMut.isPending ? "…" : "New chat"}
              </Button>
            </div>
            {sessionsQ.error && (
              <p className="mt-2 text-sm text-destructive">
                {unwrapApiErrorMessage(sessionsQ.error)}
              </p>
            )}
            <ul className="mt-3 max-h-[min(40vh,320px)] space-y-1 overflow-y-auto pr-1">
              {sessions.map((s) => {
                const sel = s.id === activeSessionId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActiveSessionId(s.id)}
                      className={
                        sel
                          ? "w-full rounded-xl bg-brand-100 px-3 py-2 text-left text-sm font-medium text-brand-900 dark:bg-brand-500/20 dark:text-brand-100"
                          : "w-full rounded-xl px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/60"
                      }
                    >
                      <span className="line-clamp-2">
                        {s.title?.trim() || `Chat #${s.id}`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {!sessionsQ.isPending && sessions.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                Type below — a conversation is created on first message.
              </p>
            )}
          </div>
        </aside>

        <section className="surface-app flex min-h-[min(72vh,680px)] flex-col overflow-hidden p-0 shadow-md">
          <header className="shrink-0 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur">
            <p className="text-sm font-semibold">
              {activeMeta?.title?.trim() || (activeSessionId ? "Conversation" : "New message")}
            </p>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            {messagesQ.error && (
              <p className="mx-4 mt-3 shrink-0 text-sm text-destructive">
                {unwrapApiErrorMessage(messagesQ.error)}
              </p>
            )}

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messagesQ.isPending &&
                activeSessionId !== null &&
                msgs.length === 0 &&
                !pendingOutgoing && (
                  <p className="text-sm text-muted-foreground">Loading messages…</p>
                )}

              {activeSessionId === null &&
                sessionsQ.isSuccess &&
                sessions.length === 0 &&
                !pendingOutgoing && (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-background/50 px-6 py-10 text-center text-sm text-muted-foreground">
                    <p className="font-medium text-foreground/80">Start a conversation</p>
                    <p>Type below — your first question creates this chat automatically.</p>
                  </div>
                )}

              {activeSessionId !== null &&
                msgs.length === 0 &&
                !messagesQ.isPending &&
                !messagesQ.isFetching &&
                !pendingOutgoing && (
                  <p className="rounded-xl border border-dashed border-border/50 bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
                    Ask anything about general wellness. Not a substitute for professional care.
                  </p>
                )}

              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={
                    isUserRole(m.role) ? "flex justify-end" : "flex justify-start"
                  }
                >
                  <div
                    className={
                      isUserRole(m.role)
                        ? "max-w-[min(100%,85%)] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white shadow-sm dark:bg-brand-500"
                        : "max-w-[min(100%,90%)] rounded-2xl rounded-bl-md border border-border/60 bg-background px-4 py-2.5 text-sm shadow-sm"
                    }
                  >
                    <div className="font-sans leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                    <p
                      className={
                        isUserRole(m.role)
                          ? "mt-1.5 text-right text-[11px] text-white/70"
                          : "mt-1.5 text-[11px] text-muted-foreground"
                      }
                    >
                      {formatTs(parseCreatedAt(m.createdAt) || String(m.createdAt))}
                    </p>
                  </div>
                </div>
              ))}

              {pendingOutgoing && (
                <div className="flex justify-end">
                  <div className="max-w-[min(100%,85%)] rounded-2xl rounded-br-md bg-brand-600/90 px-4 py-2.5 text-sm text-white shadow-sm ring-2 ring-brand-400/30 dark:bg-brand-500/90">
                    <div className="font-sans leading-relaxed whitespace-pre-wrap break-words">
                      {pendingOutgoing}
                    </div>
                    <p className="mt-1.5 text-right text-[11px] text-white/60">Sending…</p>
                  </div>
                </div>
              )}

              {sendMut.isPending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-border/60 bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="inline-block animate-pulse [animation-delay:150ms]">●</span>
                      <span className="inline-block animate-pulse [animation-delay:300ms]">●</span>
                    </span>
                    <span className="ml-2">Assistant is typing…</span>
                  </div>
                </div>
              )}
              <div ref={scrollAnchorRef} aria-hidden className="h-px w-full shrink-0" />
            </div>

            {sendMut.isError && (
              <div className="shrink-0 border-t border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive">
                {unwrapApiErrorMessage(sendMut.error)}
              </div>
            )}

            <form
              onSubmit={handleFormSubmit}
              className="shrink-0 border-t border-border/60 bg-background/90 p-4 backdrop-blur"
            >
              <div className="flex gap-2">
                <textarea
                  className="max-h-[180px] min-h-[72px] flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm shadow-sm outline-none ring-brand-600/25 focus:ring-2 disabled:opacity-55"
                  placeholder="Message the assistant…"
                  rows={3}
                  value={draft}
                  disabled={composerDisabled}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitMessage();
                    }
                  }}
                />
                <Button
                  type="submit"
                  className="self-end"
                  disabled={composerDisabled || !draft.trim()}
                >
                  Send
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Enter to send · Shift+Enter for new line
              </p>
            </form>
          </div>
        </section>
      </div>
    </Container>
    </AppPageShell>
  );
}
