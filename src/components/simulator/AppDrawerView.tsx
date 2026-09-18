import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppInfo, LauncherTheme, getAppDisplayName } from '../../types';
import { Search, X, ArrowDown, Star, EyeOff, Plus, Check } from 'lucide-react';

interface AppDrawerViewProps {
  allApps: AppInfo[];
  essentialPackages: string[];
  theme: LauncherTheme;
  showPackageNames?: boolean;
  onAppClick: (app: AppInfo) => void;
  onAppLongClick: (app: AppInfo) => void;
  onToggleEssential: (app: AppInfo) => void;
  onHideApp: (app: AppInfo) => void;
  onClose: () => void;
}

export const AppDrawerView: React.FC<AppDrawerViewProps> = ({
  allApps,
  essentialPackages,
  theme,
  showPackageNames = false,
  onAppClick,
  onAppLongClick,
  onToggleEssential,
  onHideApp,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [selectedAppForAction, setSelectedAppForAction] = useState<AppInfo | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isLight = theme === 'light';
  const bgColor = isLight ? 'bg-white' : 'bg-black';
  const textColor = isLight ? 'text-neutral-900' : 'text-neutral-100';
  const subTextColor = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const borderColor = isLight ? 'border-neutral-200' : 'border-neutral-800';

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter visible apps
  const visibleApps = useMemo(() => {
    return allApps.filter((a) => !a.isHidden);
  }, [allApps]);

  const filteredApps = useMemo(() => {
    if (!query.trim()) return visibleApps;
    const q = query.toLowerCase().trim();
    return visibleApps.filter(
      (app) =>
        getAppDisplayName(app).toLowerCase().includes(q) ||
        app.label.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q)
    );
  }, [visibleApps, query]);

  // Handle single result enter to launch
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredApps.length > 0) {
        onAppClick(filteredApps[0]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={`absolute inset-0 z-30 ${bgColor} ${textColor} flex flex-col transition-all duration-200 select-none`}>
      {/* Search Header */}
      <div className={`pt-12 px-6 pb-3 border-b ${borderColor} flex items-center gap-3`}>
        <Search className={`w-4 h-4 ${subTextColor}`} />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="search apps..."
          className="flex-1 bg-transparent text-base font-mono outline-none placeholder:text-neutral-500 lowercase"
        />
        {query ? (
          <button
            onClick={() => setQuery('')}
            className={`p-1 rounded-full ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'}`}
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className={`text-xs font-mono px-2 py-1 rounded ${subTextColor} ${isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'}`}
          >
            esc
          </button>
        )}
      </div>

      {/* App List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {filteredApps.length === 0 ? (
          <div className="py-16 text-center">
            <p className={`text-sm font-mono ${subTextColor}`}>no apps found for &quot;{query}&quot;</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isEssential = essentialPackages.includes(app.packageName);
            return (
              <div
                key={app.packageName}
                className={`group flex items-center justify-between py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-neutral-100' : 'hover:bg-neutral-900'
                }`}
                onClick={() => onAppClick(app)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedAppForAction(app);
                }}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <span className="text-lg font-light tracking-wide lowercase block truncate">
                    {getAppDisplayName(app)}
                  </span>
                  {showPackageNames && (
                    <span className={`text-[10px] font-mono ${subTextColor} block truncate`}>
                      {app.packageName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleEssential(app);
                    }}
                    title={isEssential ? 'Remove from home' : 'Add to home'}
                    className={`p-1.5 rounded text-xs ${
                      isEssential
                        ? 'text-white bg-neutral-800'
                        : `${subTextColor} hover:text-current hover:bg-neutral-800/40`
                    }`}
                  >
                    <Plus className={`w-3.5 h-3.5 ${isEssential ? 'rotate-45' : ''} transition-transform`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppForAction(app);
                    }}
                    title="Options"
                    className={`p-1.5 rounded ${subTextColor} hover:text-current hover:bg-neutral-800/40`}
                  >
                    •••
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer Bottom Close Gesture Hint */}
      <div
        className={`py-3 flex flex-col items-center justify-center cursor-pointer border-t ${borderColor} ${
          isLight ? 'hover:bg-neutral-50' : 'hover:bg-neutral-950'
        }`}
        onClick={onClose}
      >
        <ArrowDown className={`w-4 h-4 ${subTextColor}`} />
        <span className={`text-[10px] font-mono ${subTextColor} mt-0.5`}>swipe down or tap to close</span>
      </div>

      {/* Context Menu Modal when user clicks ••• */}
      {selectedAppForAction && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in duration-100">
          <div
            className={`w-full max-w-xs rounded-2xl p-4 border shadow-2xl ${
              isLight ? 'bg-white text-neutral-900 border-neutral-200' : 'bg-neutral-950 text-neutral-100 border-neutral-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <div>
                <h4 className="text-sm font-medium lowercase">{getAppDisplayName(selectedAppForAction)}</h4>
                {showPackageNames && (
                  <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[200px]">
                    {selectedAppForAction.packageName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedAppForAction(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-current"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <button
                onClick={() => {
                  onToggleEssential(selectedAppForAction);
                  setSelectedAppForAction(null);
                }}
                className="w-full py-2 px-3 rounded text-left flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
              >
                <span>
                  {essentialPackages.includes(selectedAppForAction.packageName)
                    ? 'Remove from essential home apps'
                    : 'Add to essential home apps'}
                </span>
                <Star className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <button
                onClick={() => {
                  const target = selectedAppForAction;
                  setSelectedAppForAction(null);
                  onAppLongClick(target);
                }}
                className="w-full py-2 px-3 rounded text-left flex items-center justify-between hover:bg-neutral-800/40 transition-colors"
              >
                <span>Rename custom label</span>
                <span className="text-neutral-400">✎</span>
              </button>

              <button
                onClick={() => {
                  onHideApp(selectedAppForAction);
                  setSelectedAppForAction(null);
                }}
                className="w-full py-2 px-3 rounded text-left flex items-center justify-between text-neutral-400 hover:text-red-400 hover:bg-neutral-800/40 transition-colors"
              >
                <span>Hide from app drawer</span>
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
