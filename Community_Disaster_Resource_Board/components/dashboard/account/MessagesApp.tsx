"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "../../../lib/client-auth";
import { Badge } from "../ui";

export interface ConvSummary {
  id: string; title: string; verified: boolean; category: "requests" | "posts" | "support";
  preview: string; at: number; unread: number; reported: boolean; escalated: boolean;
}
interface Msg { id: string; text: string; at: number; flagged: boolean; mine: boolean }
interface ConvDetail extends ConvSummary {
  about: { ref: string; text: string } | null; fulfilled: boolean; staff: boolean; messages: Msg[]; notes: { by: string; text: string; at: number }[];
}

const chips = [{ key: "all", label: "All" }, { key: "requests", label: "Requests" }, { key: "posts", label: "Posts" }, { key: "support", label: "Support" }] as const;

const clock = (t: number) => new Date(t).toLocaleTimeString("en-GB", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" });
function when(t: number) {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (m < 60) return `${m} min`;
  if (m < 24 * 60) return `${Math.round(m / 60)} h`;
  return m < 48 * 60 ? "Yesterday" : new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function MessagesApp({ initial, staff }: { initial: ConvSummary[]; staff: boolean }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState<(typeof chips)[number]["key"]>("all");
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [showThread, setShowThread] = useState(false);
  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    try { const r = await fetch("/api/messages", { cache: "no-store" }); if (r.ok) setList(((await r.json()) as { conversations: ConvSummary[] }).conversations); } catch {}
  }, []);
  const loadConv = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/messages/${id}`, { cache: "no-store" });
      if (r.ok) { setConv(((await r.json()) as { conversation: ConvDetail }).conversation); setList((l) => l.map((c) => (c.id === id ? { ...c, unread: 0 } : c))); }
    } catch {}
  }, []);

  useEffect(() => { if (selected) loadConv(selected); else setConv(null); }, [selected, loadConv]);
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") { refreshList(); if (selected) loadConv(selected); } }, 15000);
    return () => clearInterval(t);
  }, [selected, refreshList, loadConv]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [conv?.messages.length]);

  async function act(body: Record<string, unknown>, after?: () => void) {
    if (!selected) return;
    setBusy(true); setError(null);
    const r = await postJson<{ error?: string }>(`/api/messages/${selected}`, body);
    setBusy(false);
    if (!r.ok) { setError(r.data.error ?? "That didn’t work. Please try again."); return; }
    after?.();
    await Promise.all([loadConv(selected), refreshList()]);
  }

  const shown = list.filter((c) => filter === "all" || c.category === filter);
  const mine = conv && !conv.staff;

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-xl border border-line bg-white lg:h-[700px] lg:grid-cols-[320px_minmax(0,1fr)_260px]">
      {/* ---- list ---- */}
      <section aria-label="Conversations" className={`flex flex-col border-line lg:border-r ${showThread ? "hidden lg:flex" : "flex"}`}>
        <div role="group" aria-label="Filter conversations" className="flex flex-wrap gap-2 p-4">
          {chips.map((c) => (
            <button key={c.key} type="button" aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}
              className={`rounded-full border px-4 py-1.5 text-[14px] font-bold ${filter === c.key ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy"}`}>{c.label}</button>
          ))}
        </div>
        <ul className="flex-1 overflow-y-auto border-t border-line">
          {shown.map((c) => (
            <li key={c.id} className="border-b border-line">
              <button type="button" onClick={() => { setSelected(c.id); setShowThread(true); }} aria-current={selected === c.id}
                className={`block w-full border-l-4 px-4 py-4 text-left ${selected === c.id ? "border-l-navy bg-[#eef3fb]" : "border-l-transparent hover:bg-canvas"}`}>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[16px] font-bold">{c.title}</span>
                  <span className="shrink-0 text-[13px] text-muted">{when(c.at)}</span>
                </span>
                <span className="mt-1 block truncate text-[14px] text-muted">{c.preview}</span>
                {c.unread > 0 && <span className="mt-2 inline-block rounded-full bg-alert px-2.5 py-0.5 text-[12px] font-bold text-white">{c.unread} new</span>}
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="p-6 text-[15px] text-muted">No conversations here yet.</li>}
        </ul>
      </section>

      {/* ---- thread ---- */}
      <section aria-label="Conversation" className={`flex-col lg:flex ${showThread ? "flex" : "hidden"}`}>
        {!conv ? (
          <p className="p-8 text-[16px] text-muted">Choose a conversation to read it.</p>
        ) : (
          <>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <button type="button" onClick={() => setShowThread(false)} className="mb-2 text-[14px] font-bold underline underline-offset-2 lg:hidden">← All conversations</button>
                <h2 className="flex flex-wrap items-center gap-2 text-[19px] font-bold">
                  {conv.title}
                  {conv.verified && <span className="rounded-md bg-navy px-2 py-0.5 text-[12px] font-bold text-white">✓ Verified</span>}
                </h2>
                <p className="mt-1 text-[14px] text-muted">{conv.about ? `About request ${conv.about.ref}` : conv.category === "support" ? "Support" : "Conversation"}</p>
              </div>
              {mine && conv.category === "requests" && conv.about && (
                <button type="button" disabled={conv.fulfilled || busy} onClick={() => act({ action: "fulfill" })}
                  className="rounded-lg border-2 border-navy px-4 py-2.5 text-[15px] font-bold hover:bg-navy hover:text-white disabled:opacity-60">
                  {conv.fulfilled ? "✓ Fulfilled" : "Mark fulfilled"}
                </button>
              )}
            </header>

            <p className="mx-5 mt-4 rounded-lg bg-warn-soft px-4 py-2.5 text-[14px] text-[#6b3a07]">▲ Phone numbers stay hidden. Messages are sent through the platform.</p>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite" aria-label="Messages">
              {conv.messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${m.mine ? "bg-navy text-white" : "bg-canvas text-navy"}`}>
                    <p className="whitespace-pre-wrap break-words text-[16px] leading-6">{m.text}</p>
                    <p className={`mt-1 flex items-center gap-3 text-[13px] ${m.mine ? "text-[#c9d6e3]" : "text-muted"}`}>
                      {clock(m.at)}
                      {m.flagged && <span className="font-bold">⚑ Flagged</span>}
                      {conv.staff && !m.flagged && (
                        <button type="button" onClick={() => act({ action: "flag", messageId: m.id })} className="font-bold underline underline-offset-2">Flag message</button>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottom} />
            </div>

            {error && <p role="alert" className="mx-5 mb-2 rounded-lg border border-[#e8b4ae] bg-alert-soft p-2.5 text-[14px] font-bold text-alert">{error}</p>}
            <form className="flex gap-3 border-t border-line p-4"
              onSubmit={(e) => { e.preventDefault(); if (text.trim()) act({ action: "send", text }, () => setText("")); }}>
              <label htmlFor="msg" className="sr-only">Write a message</label>
              <input id="msg" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Write a message" autoComplete="off"
                className="min-w-0 flex-1 rounded-lg border border-[#b9c6d3] px-4 py-3 text-[16px] placeholder:text-muted" />
              <button type="submit" disabled={busy || !text.trim()} className="rounded-lg bg-navy px-6 py-3 text-[16px] font-bold text-white hover:bg-navy-soft disabled:opacity-60">Send</button>
            </form>
          </>
        )}
      </section>

      {/* ---- details ---- */}
      <aside aria-label="Details" className={`border-line p-5 lg:block lg:border-l ${showThread ? "block border-t lg:border-t-0" : "hidden"}`}>
        {conv && (
          <>
            <p className="text-[14px] font-bold text-muted">Details</p>
            {conv.about ? (
              <>
                <p className="mt-3 text-[17px] font-bold">Request {conv.about.ref}</p>
                <p className="mt-1 text-[14px] text-muted">{conv.about.text}</p>
                <p className="mt-3">{conv.fulfilled ? <Badge tone="ok">✓ Fulfilled</Badge> : <Badge tone="warn">▲ Matched</Badge>}</p>
              </>
            ) : (
              <p className="mt-3 text-[16px] font-bold">{conv.category === "support" ? "Support conversation" : "Conversation"}</p>
            )}
            {conv.escalated && <p className="mt-3"><Badge tone="alert">Escalated</Badge></p>}

            {conv.staff && (
              <div className="mt-6">
                <p className="text-[14px] font-bold text-muted">Staff tools</p>
                <button type="button" disabled={busy || conv.escalated} onClick={() => act({ action: "escalate" })}
                  className="mt-3 w-full rounded-lg border-2 border-navy px-3 py-2 text-[14px] font-bold hover:bg-navy hover:text-white disabled:opacity-60">
                  {conv.escalated ? "Escalated to coordinator" : "Escalate to coordinator"}
                </button>
                <p className="mt-4 text-[14px] font-bold">Internal notes</p>
                <p className="text-[12px] text-muted">Only moderators and admins can see these.</p>
                <ul className="mt-2 space-y-2">
                  {conv.notes.map((n, i) => (
                    <li key={i} className="rounded-lg bg-canvas p-2.5 text-[13px] leading-5"><strong>{n.by}</strong> · {clock(n.at)}<br />{n.text}</li>
                  ))}
                </ul>
                <form className="mt-2" onSubmit={(e) => { e.preventDefault(); if (note.trim()) act({ action: "note", text: note }, () => setNote("")); }}>
                  <label htmlFor="note" className="sr-only">Add an internal note</label>
                  <textarea id="note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-lg border border-[#b9c6d3] p-2 text-[14px]" />
                  <button type="submit" disabled={busy || !note.trim()} className="mt-1 rounded-lg bg-navy px-3 py-1.5 text-[13px] font-bold text-white disabled:opacity-60">Add note</button>
                </form>
              </div>
            )}

            {mine && (
              <p className="mt-6 text-[14px]">
                {conv.reported ? (
                  <span className="text-muted">Reported. Our team can now read this conversation.</span>
                ) : (
                  <button type="button" onClick={() => { if (confirm("Report this conversation? Moderators will be able to read it.")) act({ action: "report" }); }}
                    className="text-muted underline underline-offset-2 hover:text-navy">Report this conversation</button>
                )}
              </p>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
