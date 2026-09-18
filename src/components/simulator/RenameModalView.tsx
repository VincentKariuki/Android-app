import React, { useState } from 'react';
import { AppInfo, LauncherTheme } from '../../types';
import { Trash2, Edit3, ShieldAlert, Sparkles, Check, X } from 'lucide-react';

interface RenameModalViewProps {
  app: AppInfo;
  theme: LauncherTheme;
  onSave: (customName: string, isFrictionEnabled: boolean) => void;
  onRemoveFromHome: () => void;
  onClose: () => void;
}

export const RenameModalView: React.FC<RenameModalViewProps> = ({
  app,
  theme,
  onSave,
  onRemoveFromHome,
  onClose,
}) => {
  const [customName, setCustomName] = useState(app.customName || app.label.toLowerCase());
  const [friction, setFriction] = useState(!!app.isFrictionEnabled);
  const isLight = theme === 'light';

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xs rounded-2xl p-5 border shadow-2xl ${
          isLight
            ? 'bg-white text-neutral-900 border-neutral-200'
            : 'bg-neutral-950 text-neutral-100 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/40 mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 opacity-70" />
            <span className="text-xs font-mono font-medium lowercase">edit home app</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-current hover:bg-neutral-500/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-neutral-400 font-mono block mb-1">
              Custom display name (lowercase)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value.toLowerCase())}
              placeholder="e.g. read, audio, notes"
              autoFocus
              className={`w-full px-3 py-2 text-sm font-mono rounded-lg border outline-none ${
                isLight
                  ? 'bg-neutral-50 border-neutral-300 focus:border-black'
                  : 'bg-neutral-900 border-neutral-700 focus:border-white'
              }`}
            />
            <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
              Default system name: {app.label}
            </span>
          </div>

          <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-800/60 cursor-pointer">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <div>
                <div className="text-xs font-medium">Mindful Friction</div>
                <div className="text-[10px] text-neutral-500">
                  Pause countdown before opening
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={friction}
              onChange={(e) => setFriction(e.target.checked)}
              className="accent-white cursor-pointer"
            />
          </label>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                onSave(customName.trim(), friction);
                onClose();
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                isLight
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={() => {
                onRemoveFromHome();
                onClose();
              }}
              className="py-2 px-3 rounded-lg text-xs font-mono text-red-400 border border-red-900/40 hover:bg-red-950/30 transition-colors flex items-center gap-1"
              title="Remove from home screen"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
