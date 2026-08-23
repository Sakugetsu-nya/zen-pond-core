"use client";

import type { ReactNode } from "react";

export function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center pl-[5.5rem] pr-4 sm:pl-4">
      <div className="glass pointer-events-auto w-full max-w-full rounded-3xl p-5 sm:max-w-md sm:p-6 zen-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-medium text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-[13px] text-white/60 transition-colors hover:text-white"
          >
            关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
