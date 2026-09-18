import React, { useState, useEffect } from 'react';
import {
  AppInfo,
  LauncherSettings,
  SpaceConfig,
} from './types';
import {
  INITIAL_APPS,
  INITIAL_SPACES,
  DEFAULT_SETTINGS,
} from './data/defaultApps';
import { PhoneFrame } from './components/simulator/PhoneFrame';
import { AndroidCodeStudio } from './components/code-guide/AndroidCodeStudio';
import {
  Smartphone,
  Code2,
  Columns,
  RotateCcw,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';

export default function App() {
  // Local persistence for realistic interactive simulation
  const [allApps, setAllApps] = useState<AppInfo[]>(() => {
    try {
      const saved = localStorage.getItem('blank_spaces_apps');
      if (saved) {
        const parsed: AppInfo[] = JSON.parse(saved);
        // Merge with INITIAL_APPS to ensure clean custom names (e.g. 'notes' instead of package name)
        return parsed.map((app) => {
          const defaultApp = INITIAL_APPS.find((a) => a.packageName === app.packageName);
          return {
            ...app,
            customName: app.customName || defaultApp?.customName || app.label.toLowerCase(),
          };
        });
      }
      return INITIAL_APPS;
    } catch {
      return INITIAL_APPS;
    }
  });

  const [spaces, setSpaces] = useState<SpaceConfig[]>(() => {
    try {
      const saved = localStorage.getItem('blank_spaces_spaces');
      return saved ? JSON.parse(saved) : INITIAL_SPACES;
    } catch {
      return INITIAL_SPACES;
    }
  });

  const [settings, setSettings] = useState<LauncherSettings>(() => {
    try {
      const saved = localStorage.getItem('blank_spaces_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          showPackageNames: parsed.showPackageNames ?? false,
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Current view mode: 'simulator' | 'code' | 'split'
  const [viewMode, setViewMode] = useState<'simulator' | 'code' | 'split'>('simulator');
  const [resetNotice, setResetNotice] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('blank_spaces_apps', JSON.stringify(allApps));
  }, [allApps]);

  useEffect(() => {
    localStorage.setItem('blank_spaces_spaces', JSON.stringify(spaces));
  }, [spaces]);

  useEffect(() => {
    localStorage.setItem('blank_spaces_settings', JSON.stringify(settings));
  }, [settings]);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<LauncherSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Update a single app
  const handleUpdateApp = (updatedApp: AppInfo) => {
    setAllApps((prev) =>
      prev.map((app) => (app.packageName === updatedApp.packageName ? updatedApp : app))
    );
  };

  // Toggle essential status in current active space
  const handleToggleEssential = (app: AppInfo) => {
    setSpaces((prev) =>
      prev.map((space) => {
        if (space.id === settings.activeSpaceId) {
          const exists = space.appPackageNames.includes(app.packageName);
          const newPackageNames = exists
            ? space.appPackageNames.filter((p) => p !== app.packageName)
            : [...space.appPackageNames, app.packageName];
          return { ...space, appPackageNames: newPackageNames };
        }
        return space;
      })
    );
  };

  // Hide app from drawer
  const handleHideApp = (app: AppInfo) => {
    setAllApps((prev) =>
      prev.map((a) =>
        a.packageName === app.packageName ? { ...a, isHidden: !a.isHidden } : a
      )
    );
  };

  // Reset to factory defaults
  const handleResetDefaults = () => {
    setAllApps(INITIAL_APPS);
    setSpaces(INITIAL_SPACES);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('blank_spaces_apps');
    localStorage.removeItem('blank_spaces_spaces');
    localStorage.removeItem('blank_spaces_settings');
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2500);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-neutral-800">
      {/* Top Application Bar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl border border-neutral-700 bg-neutral-900 flex items-center justify-center font-mono text-sm font-semibold tracking-tighter">
              _
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium tracking-tight">
                  blank spaces
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-neutral-800 text-neutral-400 bg-neutral-900/60 uppercase tracking-wider">
                  Android Launcher
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono hidden sm:block">
                Pure text • No icons • Zero colors • Distraction-free
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800/80 text-xs font-mono">
            <button
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'simulator'
                  ? 'bg-neutral-100 text-black font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                viewMode === 'code'
                  ? 'bg-neutral-100 text-black font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kotlin Code &amp; Guide</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`hidden lg:flex px-3 py-1.5 rounded-lg items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-neutral-100 text-black font-medium shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              title="Reset Launcher to Defaults"
              className="p-2 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {resetNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RotateCcw className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{resetNotice ? 'Reset!' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {viewMode === 'simulator' && (
          <div className="py-2">
            <PhoneFrame
              allApps={allApps}
              settings={settings}
              spaces={spaces}
              onUpdateSettings={handleUpdateSettings}
              onUpdateApp={handleUpdateApp}
              onToggleEssential={handleToggleEssential}
              onHideApp={handleHideApp}
              onResetDefaults={handleResetDefaults}
            />
          </div>
        )}

        {viewMode === 'code' && (
          <div className="py-2">
            <AndroidCodeStudio />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-5 sticky top-24">
              <PhoneFrame
                allApps={allApps}
                settings={settings}
                spaces={spaces}
                onUpdateSettings={handleUpdateSettings}
                onUpdateApp={handleUpdateApp}
                onToggleEssential={handleToggleEssential}
                onHideApp={handleHideApp}
                onResetDefaults={handleResetDefaults}
              />
            </div>
            <div className="col-span-7">
              <AndroidCodeStudio />
            </div>
          </div>
        )}
      </main>

      {/* Footer Note */}
      <footer className="border-t border-neutral-900 py-6 px-4 sm:px-6 mt-auto text-center font-mono text-xs text-neutral-600">
        <p>
          Inspired by Blank Spaces &amp; Olauncher • Pure Android Jetpack Compose • Zero Tracking • Apache 2.0
        </p>
      </footer>
    </div>
  );
}
