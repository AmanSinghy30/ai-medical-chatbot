import React, { useState } from 'react';
import { PhoneCall, AlertTriangle, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative z-50 bg-rose-600 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
            <AlertTriangle className="h-3 w-3" />
          </span>
          <p>
            Severe chest pain, breathing trouble, or sudden weakness?{' '}
            <a href="tel:911" className="inline-flex items-center gap-0.5 font-bold underline underline-offset-2 hover:text-rose-100">
              <PhoneCall className="h-3 w-3" /> Call 911 immediately
            </a>
          </p>
        </div>
        <button onClick={() => setVisible(false)} aria-label="Dismiss" className="rounded p-1 text-rose-100 transition-colors hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
