import React, { useState, useEffect } from 'react';
import { AppInfo, LauncherTheme, getAppDisplayName } from '../../types';
import { Sparkles, X, ArrowRight } from 'lucide-react';

interface FrictionModalViewProps {
  app: AppInfo;
  seconds: number;
  theme: LauncherTheme;
  onProceed: () => void;
  onCancel: () => void;
}

export const FrictionModalView: React.FC<FrictionModalViewProps> = ({
  app,
  seconds,
  theme,
  onProceed,
  onCancel,
}) => {
  const [countdown, setCountdown] = useState(seconds);
  const isLight = theme === 'light';

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs rounded-2xl p-6 text-center border shadow-2xl transition-all ${
          isLight
            ? 'bg-white text-neutral-900 border-neutral-200'
            : 'bg-neutral-950 text-neutral-100 border-neutral-800'
        }`}
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-full border border-neutral-700/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 opacity-70" />
          </div>
        </div>

        <h3 className="text-base font-light tracking-wide lowercase">pause & breathe</h3>
        <p className="text-xs text-neutral-400 mt-1">
          opening <span className="font-medium text-current lowercase">{getAppDisplayName(app)}</span>
        </p>

        <div className="my-6">
          <div className="text-5xl font-extralight tracking-tight font-mono">
            {countdown > 0 ? countdown : 'ready'}
          </div>
          <p className="text-[11px] text-neutral-500 mt-2 font-mono">Is this intentional?</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onProceed}
            disabled={countdown > 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider flex items-center justify-center gap-2 transition-all ${
              countdown > 0
                ? 'opacity-30 cursor-not-allowed border border-neutral-800'
                : isLight
                  ? 'bg-neutral-900 text-white hover:bg-black active:scale-95'
                  : 'bg-white text-neutral-950 hover:bg-neutral-200 active:scale-95'
            }`}
          >
            <span>Proceed to App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 px-4 rounded-xl text-xs font-mono tracking-wider text-neutral-400 hover:text-current hover:bg-neutral-500/10 transition-colors"
          >
            Cancel (Stay Mindful)
          </button>
        </div>
      </div>
    </div>
  );
};
