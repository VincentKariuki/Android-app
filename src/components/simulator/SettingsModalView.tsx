import React, { useState } from 'react';
import {
  LauncherSettings,
  LauncherTheme,
  TextAlignment,
  FontSizeOption,
  FontFamilyOption,
  SpaceConfig,
  AppInfo,
  getAppDisplayName,
} from '../../types';
import {
  Settings as SettingsIcon,
  X,
  Smartphone,
  Eye,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface SettingsModalViewProps {
  settings: LauncherSettings;
  spaces: SpaceConfig[];
  allApps: AppInfo[];
  onUpdateSettings: (newSettings: Partial<LauncherSettings>) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

export const SettingsModalView: React.FC<SettingsModalViewProps> = ({
  settings,
  spaces,
  allApps,
  onUpdateSettings,
  onResetDefaults,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'look' | 'spaces' | 'friction' | 'system'>('look');
  const [showDefaultHelper, setShowDefaultHelper] = useState(false);

  const isLight = settings.theme === 'light';
  const bgColor = isLight ? 'bg-white' : 'bg-neutral-950';
  const textColor = isLight ? 'text-neutral-900' : 'text-neutral-100';
  const subTextColor = isLight ? 'text-neutral-500' : 'text-neutral-400';
  const borderColor = isLight ? 'border-neutral-200' : 'border-neutral-800';
  const activeTabBg = isLight ? 'bg-neutral-100 text-black' : 'bg-neutral-900 text-white';

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-h-[90%] sm:max-w-sm mx-auto rounded-t-3xl sm:rounded-2xl border ${borderColor} ${bgColor} ${textColor} flex flex-col overflow-hidden shadow-2xl`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 opacity-70" />
            <h3 className="text-sm font-mono font-medium lowercase">launcher settings</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${subTextColor} hover:text-current hover:bg-neutral-800/40`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b ${borderColor} text-xs font-mono px-3 py-1.5 gap-1 overflow-x-auto`}>
          {[
            { id: 'look', label: 'Appearance' },
            { id: 'spaces', label: 'Spaces' },
            { id: 'friction', label: 'Friction' },
            { id: 'system', label: 'About & Default' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id ? activeTabBg : `${subTextColor} hover:text-current`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {activeTab === 'look' && (
            <div className="space-y-5">
              {/* Theme */}
              <div>
                <label className={`block font-mono mb-2 ${subTextColor}`}>Color Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'black', label: 'OLED Black', preview: 'bg-black text-white border-neutral-700' },
                    { id: 'dark', label: 'Slate Dark', preview: 'bg-neutral-900 text-neutral-100 border-neutral-700' },
                    { id: 'light', label: 'Clean White', preview: 'bg-white text-black border-neutral-300' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id as LauncherTheme })}
                      className={`p-2.5 rounded-xl border text-center font-mono text-[11px] flex flex-col items-center gap-1.5 transition-all ${
                        settings.theme === t.id ? 'ring-2 ring-neutral-400' : 'opacity-70 hover:opacity-100'
                      } ${t.preview}`}
                    >
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                        {settings.theme === t.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className={`block font-mono mb-2 ${subTextColor}`}>Text Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', icon: AlignLeft, label: 'Left' },
                    { id: 'center', icon: AlignCenter, label: 'Center' },
                    { id: 'right', icon: AlignRight, label: 'Right' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onUpdateSettings({ alignment: item.id as TextAlignment })}
                        className={`py-2 px-3 rounded-lg border ${borderColor} flex items-center justify-center gap-2 font-mono transition-colors ${
                          settings.alignment === item.id
                            ? isLight ? 'bg-black text-white' : 'bg-white text-black'
                            : `${subTextColor} hover:text-current`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className={`block font-mono mb-2 ${subTextColor}`}>Home Font Scale</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['compact', 'normal', 'large', 'huge'] as FontSizeOption[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onUpdateSettings({ fontSize: sz })}
                      className={`py-2 rounded-lg border ${borderColor} font-mono text-[11px] capitalize transition-colors ${
                        settings.fontSize === sz
                          ? isLight ? 'bg-black text-white' : 'bg-white text-black'
                          : `${subTextColor} hover:text-current`
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className={`block font-mono mb-2 ${subTextColor}`}>Typography Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'sans', label: 'Clean Sans' },
                    { id: 'mono', label: 'Jetpack Mono' },
                    { id: 'serif', label: 'Minimal Serif' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateSettings({ fontFamily: f.id as FontFamilyOption })}
                      className={`py-2 px-2 rounded-lg border ${borderColor} font-mono text-[11px] transition-colors ${
                        settings.fontFamily === f.id
                          ? isLight ? 'bg-black text-white' : 'bg-white text-black'
                          : `${subTextColor} hover:text-current`
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Widgets Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/40">
                <label className={`block font-mono ${subTextColor}`}>Home Widgets & Labels</label>
                {[
                  { key: 'showClock', label: 'Display Digital Clock', value: settings.showClock },
                  { key: 'showDate', label: 'Display Full Date', value: settings.showDate },
                  { key: 'showBattery', label: 'Display Battery Percentage', value: settings.showBattery },
                  { key: 'showStatusBar', label: 'Show Android Status Bar', value: settings.showStatusBar },
                  { key: 'showPackageNames', label: 'Show Technical Package IDs (e.g. com.google.android...)', value: settings.showPackageNames },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${borderColor} cursor-pointer`}
                  >
                    <span className="font-mono text-xs">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={item.value}
                      onChange={(e) => onUpdateSettings({ [item.key]: e.target.checked })}
                      className="accent-white cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'spaces' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 opacity-70" />
                <p className={`font-mono text-[11px] ${subTextColor}`}>
                  Spaces let you switch home apps depending on context (e.g., Deep Focus vs. Work).
                </p>
              </div>

              <div className="space-y-2">
                {spaces.map((sp) => {
                  const isActive = settings.activeSpaceId === sp.id;
                  return (
                    <div
                      key={sp.id}
                      onClick={() => onUpdateSettings({ activeSpaceId: sp.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? `${borderColor} ${isLight ? 'bg-neutral-100' : 'bg-neutral-900'} ring-1 ring-neutral-400`
                          : `${borderColor} opacity-70 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium font-mono text-sm lowercase">{sp.name}</span>
                        {isActive && <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Active</span>}
                      </div>
                      <p className={`text-[11px] ${subTextColor} mt-1`}>{sp.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sp.appPackageNames.map((pkg) => {
                          const app = allApps.find((a) => a.packageName === pkg);
                          return (
                            <span
                              key={pkg}
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border ${borderColor} lowercase`}
                            >
                              {app ? getAppDisplayName(app) : pkg.split('.').pop()}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'friction' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 opacity-70" />
                <p className={`font-mono text-[11px] ${subTextColor}`}>
                  Intentional Friction inserts a conscious breathing pause before opening distracting apps (e.g. social feeds).
                </p>
              </div>

              <label className={`flex items-center justify-between p-3 rounded-xl border ${borderColor} cursor-pointer`}>
                <div>
                  <div className="font-medium font-mono">Enable Mindful Pause</div>
                  <div className={`text-[11px] ${subTextColor}`}>Show countdown timer prior to app launch</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableFriction}
                  onChange={(e) => onUpdateSettings({ enableFriction: e.target.checked })}
                  className="accent-white cursor-pointer"
                />
              </label>

              <div>
                <label className={`block font-mono mb-2 ${subTextColor}`}>Pause Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 5].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => onUpdateSettings({ frictionSeconds: sec })}
                      className={`py-2 rounded-lg border ${borderColor} font-mono text-center transition-colors ${
                        settings.frictionSeconds === sec
                          ? isLight ? 'bg-black text-white' : 'bg-white text-black'
                          : `${subTextColor} hover:text-current`
                      }`}
                    >
                      {sec} Seconds
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border ${borderColor} space-y-2`}>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 opacity-70" />
                  <span className="font-medium font-mono">Default Android Launcher</span>
                </div>
                <p className={`text-[11px] ${subTextColor} leading-relaxed`}>
                  On a real device, pressing the Home button or choosing &ldquo;Always&rdquo; sets this app as your system home screen.
                </p>
                <button
                  onClick={() => setShowDefaultHelper(true)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-mono flex items-center justify-center gap-2 ${
                    isLight ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <span>Simulate &ldquo;Set as Default&rdquo; Intent</span>
                </button>
              </div>

              <div className={`p-3 rounded-xl border ${borderColor} space-y-1.5`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 opacity-70" />
                  <span className="font-medium font-mono">Zero Tracking Philosophy</span>
                </div>
                <p className={`text-[11px] ${subTextColor} leading-relaxed`}>
                  Blank Spaces requires zero internet permissions. No analytics, no telemetry, no ad SDKs. All preferences are stored locally in Android DataStore.
                </p>
              </div>

              <button
                onClick={onResetDefaults}
                className="w-full py-2 text-xs font-mono text-neutral-400 hover:text-current flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} flex justify-end`}>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-mono ${
              isLight ? 'bg-black text-white hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Simulated System Default Launcher Dialog */}
      {showDefaultHelper && (
        <div className="absolute inset-0 z-60 bg-black/80 flex items-center justify-center p-6 animate-in fade-in">
          <div
            className={`w-full max-w-xs rounded-2xl p-5 border shadow-2xl ${
              isLight ? 'bg-white text-neutral-900 border-neutral-300' : 'bg-neutral-900 text-white border-neutral-700'
            }`}
          >
            <h4 className="text-sm font-medium font-mono">Select a Home app</h4>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Intent: <code className="text-[10px]">android.provider.Settings.ACTION_HOME_SETTINGS</code>
            </p>

            <div className="space-y-2 mb-4">
              <div className="p-3 rounded-xl border border-neutral-700 bg-neutral-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium font-mono">Blank Spaces Launcher</div>
                  <div className="text-[10px] text-neutral-400">com.blankspaces.launcher</div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="p-3 rounded-xl border border-neutral-800 opacity-60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono">Pixel Launcher (System default)</div>
                  <div className="text-[10px] text-neutral-500">com.google.android.apps.nexuslauncher</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert('Blank Spaces is now simulated as your default Android home app!');
                  setShowDefaultHelper(false);
                }}
                className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-mono font-medium"
              >
                Always
              </button>
              <button
                onClick={() => setShowDefaultHelper(false)}
                className="py-2 px-3 rounded-lg border border-neutral-700 text-xs font-mono"
              >
                Just Once
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
