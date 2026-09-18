import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES } from '../../data/androidProjectSource';
import { AndroidCodeFile } from '../../types';
import JSZip from 'jszip';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Folder,
  File,
  Code2,
  BookOpen,
  ShieldAlert,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AndroidCodeStudio: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'guide' | 'policy'>('files');

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Export full Android project as a ZIP
  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();

      // Add each project file
      ANDROID_PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      // Add standard gradle wrapper properties
      zip.file(
        'gradle/wrapper/gradle-wrapper.properties',
        `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
      );

      // Add root build.gradle.kts and settings.gradle.kts
      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "BlankSpacesLauncher"
include(":app")`
      );

      zip.file(
        'build.gradle.kts',
        `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'blank-spaces-minimalist-launcher-android.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP export', err);
      alert('Failed to generate ZIP. You can still copy code directly from the files tab.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Studio Header */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-neutral-300" />
            <h2 className="text-lg font-mono font-medium text-neutral-100">
              Android Kotlin Architecture Studio
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Production-grade Jetpack Compose, DataStore, and Intent handling source files (Android 8.0 - 15+).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating ZIP...' : 'Export Android Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-mono gap-4 px-2">
        <button
          onClick={() => setActiveTab('files')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'files'
              ? 'border-white text-white font-medium'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>Source Code Files ({ANDROID_PROJECT_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'guide'
              ? 'border-white text-white font-medium'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Implementation Blueprint (Phases 1-8)</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'policy'
              ? 'border-white text-white font-medium'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Play Store Package Visibility & Permissions</span>
        </button>
      </div>

      {/* Tab 1: Source Code Explorer */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* File Tree Explorer */}
          <div className="md:col-span-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex flex-col h-[650px] overflow-hidden">
            <div className="text-xs font-mono text-neutral-400 mb-3 flex items-center justify-between pb-2 border-b border-neutral-800">
              <span>PROJECT STRUCTURE</span>
              <span className="text-[10px] uppercase text-neutral-500">app / src</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs pr-1">
              {ANDROID_PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left py-2 px-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-white text-black font-medium'
                        : 'text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                    <div className="truncate flex-1">
                      <div className="truncate text-xs">{file.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-neutral-600' : 'text-neutral-500'}`}>
                        {file.path}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Code Viewer */}
          <div className="md:col-span-8 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Code Bar Header */}
            <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
              <div className="min-w-0 pr-4">
                <span className="text-xs font-mono font-medium text-neutral-200 block truncate">
                  {selectedFile.path}
                </span>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {selectedFile.description}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="py-1.5 px-3 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 bg-black font-mono text-xs leading-relaxed text-neutral-200 selection:bg-neutral-800">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Implementation Blueprint (Phases 1-8) */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                phase: 'Phase 1: Project Setup & Launcher Declaration',
                summary: 'Manifest Intent-Filter & Theme',
                details: [
                  'Declare MainActivity with category android.intent.category.HOME and DEFAULT.',
                  'Add launchMode="singleTask" and stateNotNeeded="true" so Android maintains the launcher instance cleanly.',
                  'Include <queries> with action MAIN and category LAUNCHER in AndroidManifest.xml for Android 11+ visibility.',
                  'Set pure pitch-black theme with transparent system status and navigation bars.',
                ],
              },
              {
                phase: 'Phase 2: Core Data Layer & App Queries',
                summary: 'PackageManager & DataStore',
                details: [
                  'Define AppInfo(label, packageName, activityName, customName, isHidden).',
                  'Query launchable apps via packageManager.queryIntentActivities(Intent(ACTION_MAIN).addCategory(CATEGORY_LAUNCHER)).',
                  'Exclude self package from the list to avoid launcher recursion.',
                  'Persist user selected essential apps and custom renames using Jetpack DataStore Preferences.',
                  'Register BroadcastReceiver for PACKAGE_ADDED and PACKAGE_REMOVED to auto-update installed apps.',
                ],
              },
              {
                phase: 'Phase 3: Home Screen UI (Blank Spaces Look)',
                summary: 'Pure Text-Only Essential List',
                details: [
                  'Zero icons, zero colors, zero red notification badges or counter dots.',
                  'Top widget: 56sp digital clock, localized weekday/date, optional battery indicator.',
                  'Center or left/right aligned LazyColumn of essential apps with customizable font scale.',
                  'Launch apps with ComponentName(packageName, activityName) and FLAG_ACTIVITY_NEW_TASK.',
                  'Gesture detectors: double-tap empty space to lock; swipe up to open drawer; swipe left/right for phone/camera.',
                ],
              },
              {
                phase: 'Phase 4: Searchable App Drawer',
                summary: 'Instant Query Filtering',
                details: [
                  'Full-screen text list with auto-focused BasicTextField search input.',
                  'Instant case-insensitive filtering across display label and package name.',
                  'Pressing Enter on keyboard auto-launches if only 1 match remains.',
                  'Long-press menu allows: Add to essential home list, rename custom label, or hide app from drawer.',
                ],
              },
              {
                phase: 'Phase 5: Mindful Friction & Spaces',
                summary: 'Conscious Digital Wellbeing',
                details: [
                  'Optional 3-second breathing countdown before launching designated addictive apps (e.g. social feeds).',
                  'Contextual Spaces: switch between "Focus", "Work", and "Personal" home app profiles.',
                  'Settings screen with alignment toggles, font scaling, monochrome OLED black / white switch.',
                  'Default home app intent helper: Settings.ACTION_HOME_SETTINGS.',
                ],
              },
              {
                phase: 'Phase 6: Edge Cases & Testing',
                summary: 'Robustness & Distribution',
                details: [
                  'Handle uninstalled packages gracefully with fallback getLaunchIntentForPackage.',
                  'Support Work Profile / Managed Profile apps via LauncherApps API if needed.',
                  'Test on Samsung One UI, Google Pixel, Xiaomi MIUI/HyperOS for default launcher intent capture.',
                  'F-Droid, GitHub APK releases, and Google Play Store submission preparedness.',
                ],
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-mono font-medium text-neutral-200">{step.phase}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Step {idx + 1}</span>
                </div>
                <div className="text-xs text-neutral-300 font-mono">{step.summary}</div>
                <ul className="space-y-1.5 text-xs text-neutral-400 font-mono">
                  {step.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-neutral-600 mt-1">•</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Google Play Policies & Package Visibility */}
      {activeTab === 'policy' && (
        <div className="space-y-5">
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-mono text-sm font-medium">
              <ShieldAlert className="w-5 h-5" />
              <span>Android 11+ Package Visibility (API 30–35) Guidance</span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-mono">
              In Android 11 (API level 30) and later, Google introduced package visibility restrictions to protect user privacy.
              Apps can no longer see all installed applications by default.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-neutral-800 bg-black/40 space-y-2">
                <div className="text-xs font-mono font-medium text-emerald-400">
                  Approach A: Intent-Based &lt;queries&gt; (Recommended)
                </div>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  In `AndroidManifest.xml`, declare:
                </p>
                <pre className="p-2.5 rounded bg-neutral-900 text-[11px] font-mono text-neutral-300 overflow-x-auto">
{`<queries>
    <intent>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent>
</queries>`}
                </pre>
                <p className="text-xs text-neutral-400 font-mono">
                  ✓ Full access to all launchable apps on the device.<br />
                  ✓ Does NOT require a Google Play sensitive permission declaration form.<br />
                  ✓ Fast review and zero rejection risk.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-black/40 space-y-2">
                <div className="text-xs font-mono font-medium text-blue-400">
                  Approach B: QUERY_ALL_PACKAGES Permission
                </div>
                <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                  Required only if you query non-launchable background services or work accounts:
                </p>
                <pre className="p-2.5 rounded bg-neutral-900 text-[11px] font-mono text-neutral-300 overflow-x-auto">
{`<uses-permission
    android:name="android.permission.QUERY_ALL_PACKAGES" />`}
                </pre>
                <p className="text-xs text-neutral-400 font-mono">
                  ℹ Allowed on Google Play ONLY if app core functionality is a Home Launcher.<br />
                  ℹ You must submit the Declaration Form in Google Play Console citing &ldquo;Default Launcher / Home screen&rdquo;.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 text-xs font-mono space-y-2 text-neutral-400">
              <span className="text-neutral-200 font-medium block">Google Play Submission Checklist for Launchers:</span>
              <ul className="list-disc pl-5 space-y-1">
                <li>Clearly indicate in title/description: &ldquo;Minimalist text-only home screen launcher&rdquo;.</li>
                <li>Verify your privacy policy specifies zero personal data collection or analytics.</li>
                <li>Test that pressing Android&apos;s physical or gesture Home button reliably returns to the launcher screen.</li>
                <li>Provide clean handling when users uninstall an essential app from their system.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
