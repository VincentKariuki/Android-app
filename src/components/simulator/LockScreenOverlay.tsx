import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface LockScreenOverlayProps {
  onUnlock: () => void;
}

export const LockScreenOverlay: React.FC<LockScreenOverlayProps> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const mins = String(time.getMinutes()).padStart(2, '0');
  const dateStr = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onUnlock}
      className="absolute inset-0 z-50 bg-black text-neutral-300 flex flex-col justify-between items-center py-16 px-6 select-none cursor-pointer animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-1.5 opacity-40 text-xs font-mono">
        <Lock className="w-3.5 h-3.5" />
        <span>locked</span>
      </div>

      <div className="text-center">
        <div className="text-7xl font-extralight tracking-tighter text-neutral-100">
          {hours}:{mins}
        </div>
        <div className="text-sm font-light text-neutral-400 mt-2 tracking-wide">
          {dateStr}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 opacity-50 text-xs font-mono animate-pulse">
        <Unlock className="w-4 h-4" />
        <span className="text-[10px] tracking-wider uppercase">Tap or click to wake</span>
      </div>
    </div>
  );
};
