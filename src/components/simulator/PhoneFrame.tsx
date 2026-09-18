import React, { useState } from 'react';
import {
  AppInfo,
  LauncherSettings,
  SpaceConfig,
  LauncherTheme,
} from '../../types';
import { HomeScreenView } from './HomeScreenView';
import { AppDrawerView } from './AppDrawerView';
import { SettingsModalView } from './SettingsModalView';
import { SimulatedAppView } from './SimulatedAppView';
import { FrictionModalView } from './FrictionModalView';
import { RenameModalView } from './RenameModalView';
import { LockScreenOverlay } from './LockScreenOverlay';
import {
  Maximize2,
  Minimize2,
  Lock,
  Menu,
  RotateCcw,
  Sliders,
  Sparkles,
  Smartphone,
} from 'lucide-react';

interface PhoneFrameProps {
  allApps: AppInfo[];
  settings: LauncherSettings;
  spaces: SpaceConfig[];
  onUpdateSettings: (newSettings: Partial<LauncherSettings>) => void;
  onUpdateApp: (updatedApp: AppInfo) => void;
  onToggleEssential: (app: AppInfo) => void;
  onHideApp: (app: AppInfo) => void;
  onResetDefaults: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  allApps,
  settings,
  spaces,
  onUpdateSettings,
  onUpdateApp,
  onToggleEssential,
  onHideApp,
  onResetDefaults,
}) => {
  // Navigation & Modal states inside phone
  const [activeView, setActiveView] = useState<'home' | 'drawer'>('home');
  const [runningApp, setRunningApp] = useState<AppInfo | null>(null);
  const [appPendingFriction, setAppPendingFriction] = useState<AppInfo | null>(null);
  const [appForRename, setAppForRename] = useState<AppInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullBleed, setIsFullBleed] = useState(false);

  // Active space resolution
  const activeSpace = spaces.find((s) => s.id === settings.activeSpaceId) || spaces[0];

  // Essential apps for the active space
  const essentialApps = allApps.filter((app) =>
    activeSpace.appPackageNames.includes(app.packageName)
  );

  // Handle clicking an app to launch
  const handleAppLaunch = (app: AppInfo) => {
    // Check if intentional friction should be triggered
    if (settings.enableFriction && app.isFrictionEnabled) {
      setAppPendingFriction(app);
    } else {
      setRunningApp(app);
      setActiveView('home');
    }
  };

  // Quick gestures: swipe left / right
  const handleSwipeGesture = (direction: 'left' | 'right') => {
    const targetPkg =
      direction === 'left' ? settings.swipeLeftAction : settings.swipeRightAction;
    const targetApp = allApps.find((a) => a.packageName === targetPkg);
    if (targetApp) {
      handleAppLaunch(targetApp);
    }
  };

  // Determine theme styling
  const isLight = settings.theme === 'light';
  const phoneBg =
    settings.theme === 'black'
      ? 'bg-black'
      : settings.theme === 'dark'
        ? 'bg-neutral-950'
        : 'bg-white';

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-5xl mx-auto">
      {/* Phone Device Container */}
      <div
        className={`relative transition-all duration-300 ${
          isFullBleed
            ? 'w-full max-w-md h-[780px] rounded-2xl shadow-xl'
            : 'w-[360px] sm:w-[380px] h-[740px] sm:h-[780px] rounded-[48px] p-3 shadow-2xl ring-12 ring-neutral-900 bg-neutral-950'
        }`}
      >
        {/* Hardware details (Speaker & Camera Punch Hole) */}
        {!isFullBleed && (
          <>
            {/* Camera punch-hole */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-neutral-900 ring-2 ring-neutral-800 z-50 pointer-events-none" />
            {/* Top speaker grill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-neutral-800 z-50 pointer-events-none" />
          </>
        )}

        {/* Screen Canvas */}
        <div
          className={`relative w-full h-full ${phoneBg} overflow-hidden transition-colors duration-300 ${
            isFullBleed ? 'rounded-2xl' : 'rounded-[38px]'
          }`}
        >
          {/* Main Home Screen */}
          <HomeScreenView
            essentialApps={essentialApps}
            settings={settings}
            activeSpace={activeSpace}
            onAppClick={handleAppLaunch}
            onAppLongClick={(app) => setAppForRename(app)}
            onOpenDrawer={() => setActiveView('drawer')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLockPhone={() => setIsLocked(true)}
            onSwipeGesture={handleSwipeGesture}
          />

          {/* App Drawer (Animated full screen over home) */}
          {activeView === 'drawer' && (
            <AppDrawerView
              allApps={allApps}
              essentialPackages={activeSpace.appPackageNames}
              theme={settings.theme}
              showPackageNames={settings.showPackageNames}
              onAppClick={handleAppLaunch}
              onAppLongClick={(app) => setAppForRename(app)}
              onToggleEssential={onToggleEssential}
              onHideApp={onHideApp}
              onClose={() => setActiveView('home')}
            />
          )}

          {/* Simulated Running App */}
          {runningApp && (
            <SimulatedAppView
              app={runningApp}
              theme={settings.theme}
              showPackageNames={settings.showPackageNames}
              onClose={() => setRunningApp(null)}
            />
          )}

          {/* Mindful Friction Dialog */}
          {appPendingFriction && (
            <FrictionModalView
              app={appPendingFriction}
              seconds={settings.frictionSeconds}
              theme={settings.theme}
              onProceed={() => {
                const target = appPendingFriction;
                setAppPendingFriction(null);
                setRunningApp(target);
              }}
              onCancel={() => setAppPendingFriction(null)}
            />
          )}

          {/* Rename / Edit App Dialog */}
          {appForRename && (
            <RenameModalView
              app={appForRename}
              theme={settings.theme}
              onSave={(newName, friction) => {
                onUpdateApp({
                  ...appForRename,
                  customName: newName,
                  isFrictionEnabled: friction,
                });
                setAppForRename(null);
              }}
              onRemoveFromHome={() => {
                onToggleEssential(appForRename);
                setAppForRename(null);
              }}
              onClose={() => setAppForRename(null)}
            />
          )}

          {/* In-Launcher Settings Dialog */}
          {isSettingsOpen && (
            <SettingsModalView
              settings={settings}
              spaces={spaces}
              allApps={allApps}
              onUpdateSettings={onUpdateSettings}
              onResetDefaults={onResetDefaults}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}

          {/* Lock Screen Standby Screen */}
          {isLocked && <LockScreenOverlay onUnlock={() => setIsLocked(false)} />}
        </div>
      </div>

      {/* Companion Control Dock & Quick Actions (Desktop / Tablet) */}
      <div className="flex flex-col gap-4 w-full max-w-xs lg:w-72">
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
            <span className="text-neutral-400 font-medium">Simulator Controls</span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Live</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveView(activeView === 'home' ? 'drawer' : 'home')}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition-colors"
            >
              <span>{activeView === 'home' ? 'Open App Drawer' : 'Close to Home'}</span>
              <Menu className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition-colors"
            >
              <span>Launcher Settings</span>
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={() => setIsLocked(!isLocked)}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition-colors"
            >
              <span>{isLocked ? 'Wake / Unlock Phone' : 'Lock Phone (Double-Tap)'}</span>
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={() => setIsFullBleed(!isFullBleed)}
              className="w-full py-2 px-3 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 flex items-center justify-between transition-colors"
            >
              <span>{isFullBleed ? 'Show Device Frame' : 'Full-Bleed View'}</span>
              {isFullBleed ? <Minimize2 className="w-3.5 h-3.5 text-neutral-400" /> : <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />}
            </button>
          </div>
        </div>

        {/* Spaces Switcher Quick Dock */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs font-mono">
          <div className="text-neutral-400 mb-2 font-medium">Quick Spaces Switch</div>
          <div className="grid grid-cols-3 gap-1.5">
            {spaces.map((sp) => (
              <button
                key={sp.id}
                onClick={() => onUpdateSettings({ activeSpaceId: sp.id })}
                className={`py-1.5 px-2 rounded-lg text-center text-[11px] capitalize transition-colors ${
                  settings.activeSpaceId === sp.id
                    ? 'bg-white text-black font-medium'
                    : 'bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Minimalist Principles Card */}
        <div className="bg-neutral-900/30 border border-neutral-800/40 rounded-2xl p-4 text-xs text-neutral-400 space-y-2">
          <div className="flex items-center gap-1.5 text-neutral-300 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>Interactive Tips</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] font-mono leading-relaxed">
            <li>Tap any app name to launch it.</li>
            <li>Right-click or hold an app to rename.</li>
            <li>Double-click empty space to lock screen.</li>
            <li>Swipe up on bottom handle for drawer.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
