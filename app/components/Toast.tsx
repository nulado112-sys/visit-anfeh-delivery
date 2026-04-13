"use client";

import { useEffect, useState } from "react";
import { useLang, t } from "../context/language";

export type ToastMessage = { id: number; name: string };

let listeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(name: string) {
  const msg = { id: Date.now(), name };
  listeners.forEach((fn) => fn(msg));
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { lang } = useLang();
  const T = t[lang];

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts((prev) => {
        if (prev.find((t) => t.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 2500);
    };
    if (!listeners.includes(handler)) listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2.5 rounded-2xl bg-[#0C2B35] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-up"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1AABBD] text-xs">✓</span>
          <span className="max-w-[200px] truncate">{toast.name}</span>
          <span className="text-slate-400 font-normal">{T.toast_added}</span>
        </div>
      ))}
    </div>
  );
}
