import React, { useState, useEffect, useRef } from 'react';
import { AppInfo, LauncherSettings, SpaceConfig, getAppDisplayName } from '../../types';
import { ChevronUp, Battery, Wifi, Signal } from 'lucide-react';

interface HomeScreenViewProps {
  essentialApps: AppInfo[];
  settings: LauncherSettings;
  activeSpace?: SpaceConfig;
  onAppClick: (app: AppInfo) => void;
  onAppLongClick: (app: AppInfo) => void;
  onOpenDrawer: () => void;
  onOpenSettings: () => void;
  onLockPhone: () => void;
  onSwipeGesture: (direction: 'left' | 'right') => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  essentialApps,
  settings,
  activeSpace,
  onAppClick,
  onAppLongClick,
  onOpenDrawer,
  onOpenSettings,
  onLockPhone,
  onSwipeGesture,
}) => {
  const [time, setTime] = useState(new Date());
  const [battery] = useState(84); // simulated battery level
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isLight = settings.theme === 'light';
  const textColor = isLight ? 'text-neutral-900' : 'text-neutral-100';
  const subTextColor = isLight ? 'text-neutral-500' : 'text-neutral-400';

  // Format time
  const formatTime = () => {
    const hours = settings.timeFormat === '12h' 
      ? time.getHours() % 12 || 12 
      : String(time.getHours()).padStart(2, '0');
    const mins = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Format date: e.g. "Friday, September 18"
  const formatDate = () => {
    return time.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Alignment classes
  const alignClass =
    settings.alignment === 'center'
      ? 'items-center text-center'
      : settings.alignment === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  // Font size classes
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'compact':
        return 'text-lg sm:text-xl py-1.5';
      case 'large':
        return 'text-2xl sm:text-3xl py-3';
      case 'huge':
        return 'text-3xl sm:text-4xl py-3.5';
      case 'normal':
      default:
        return 'text-xl sm:text-2xl py-2';
    }
  };

  // Font family classes
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'mono':
        return 'font-mono';
      case 'serif':
        return 'font-serif';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // Double-tap handler for empty background space to trigger screen lock
  const handleBackgroundClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 320;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onLockPhone();
    }
    lastTapRef.current = now;
  };

  // Handle touch gestures for swipe up, swipe left, swipe right
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartRef.current.x;
    const diffY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (diffY < -60 && Math.abs(diffX) < 80) {
      // Swiped up -> Open drawer
      onOpenDrawer();
    } else if (diffX < -70 && Math.abs(diffY) < 60) {
      // Swiped left
      onSwipeGesture('left');
    } else if (diffX > 70 && Math.abs(diffY) < 60) {
      // Swiped right
      onSwipeGesture('right');
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between select-none ${textColor} ${getFontFamilyClass()}`}
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        // Long press / right click on empty space opens settings
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
          e.preventDefault();
          onOpenSettings();
        }
      }}
    >
      {/* Top Bar: Status Bar (if enabled) + Clock/Date Widget */}
      <div className="w-full pt-2 px-6">
        {/* Status Bar */}
        {settings.showStatusBar && (
          <div className="flex items-center justify-between text-[11px] font-mono opacity-60 mb-6 px-1">
            <span>{formatTime()}</span>
            <div className="flex items-center gap-2">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span>{battery}%</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Space indicator pill if in a named space */}
        {activeSpace && activeSpace.id !== 'focus' && (
          <div className="mb-4">
            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded border border-neutral-700/50 opacity-50">
              {activeSpace.name} space
            </span>
          </div>
        )}

        {/* Clock & Date Widget */}
        <div className={`flex flex-col ${alignClass} transition-all`}>
          {settings.showClock && (
            <div className="text-5xl sm:text-6xl font-light tracking-tight select-none">
              {formatTime()}
            </div>
          )}
          {settings.showDate && (
            <div className={`text-xs sm:text-sm ${subTextColor} font-normal mt-1 tracking-wide`}>
              {formatDate()}
            </div>
          )}
          {settings.showBattery && !settings.showStatusBar && (
            <div className={`text-[11px] ${subTextColor} font-mono mt-1 opacity-75`}>
              {battery}% battery
            </div>
          )}
        </div>
      </div>

      {/* Center / Lower-Center: The Essential Apps Text List */}
      <div className={`w-full px-8 my-auto flex flex-col ${alignClass} py-6`}>
        <div className="w-full flex flex-col space-y-1">
          {essentialApps.length === 0 ? (
            <div className="py-8 text-center text-xs opacity-50 font-mono">
              no essential apps selected
              <br />
              <span className="text-[10px] mt-1 block">swipe up to add from drawer</span>
            </div>
          ) : (
            essentialApps.map((app) => {
              const displayName = getAppDisplayName(app).toLowerCase();
              return (
                <button
                  key={app.packageName}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppClick(app);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAppLongClick(app);
                  }}
                  title="Click to launch, right-click / long-press to rename"
                  className={`w-full group font-light tracking-wide transition-all lowercase text-current block outline-none ${getFontSizeClass()} ${
                    settings.alignment === 'center'
                      ? 'text-center'
                      : settings.alignment === 'right'
                        ? 'text-right'
                        : 'text-left'
                  } hover:opacity-70 active:scale-[0.98]`}
                >
                  <span className="inline-block relative">
                    {displayName}
                    {/* Subtle underline on hover */}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-current group-hover:w-full transition-all duration-200" />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Drawer Hint / Swipe-up indicator */}
      <div className="w-full pb-6 pt-2 flex flex-col items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDrawer();
          }}
          className={`flex flex-col items-center gap-0.5 text-xs font-mono ${subTextColor} hover:text-current hover:opacity-100 transition-opacity active:translate-y-[-2px]`}
          title="Open App Drawer"
        >
          <ChevronUp className="w-4 h-4 animate-bounce" />
          <span className="text-[11px] tracking-widest lowercase opacity-60">apps</span>
        </button>

        {/* Home gesture indicator pill */}
        <div className="mt-3 w-28 h-1 rounded-full bg-neutral-700/30" />
      </div>
    </div>
  );
};
