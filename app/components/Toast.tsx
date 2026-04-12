"use client";

import { useEffect, useState } from "react";

export type ToastMessage = { id: number; name: string };

let listeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(name: string) {
  const msg = { id: Date.now(), name };
  listeners.forEach((fn) => fn(msg));
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 2500);
    };
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2.5 rounded-2xl bg-[#0C2B35] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-up"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1AABBD] text-xs">✓</span>
          <span className="max-w-[200px] truncate">{t.name}</span>
          <span className="text-slate-400 font-normal">added</span>
        </div>
      ))}
    </div>
  );
}
