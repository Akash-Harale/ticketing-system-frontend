// Shared sub-components used across admin feature panels

import React from 'react';

// ── Section card wrapper ──────────────────────────────────────────────────────
export function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-3 rounded-t-2xl border-b border-gray-100 bg-gray-50/30 px-6 py-4">
        <span className="text-indigo-650 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50/70 ring-4 ring-indigo-50/30">
          <Icon className="h-4.5 w-4.5 text-indigo-600" />
        </span>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Action badge ──────────────────────────────────────────────────────────────
export function ActionBadge({ action }: { action: string }) {
  const colours: Record<string, string> = {
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-150 ring-1 ring-emerald-600/10',
    READ: 'bg-blue-50 text-blue-700 border-blue-150 ring-1 ring-blue-600/10',
    UPDATE: 'bg-amber-50 text-amber-700 border-amber-150 ring-1 ring-amber-600/10',
    DELETE: 'bg-rose-50 text-rose-700 border-rose-150 ring-1 ring-rose-600/10',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${colours[action] ?? 'border-gray-200 bg-gray-50 text-gray-600'}`}
    >
      {action}
    </span>
  );
}

// ── Error message helper ──────────────────────────────────────────────────────
export function getErrMsg(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
