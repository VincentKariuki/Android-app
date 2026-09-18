export interface AppInfo {
  packageName: string;
  activityName: string;
  label: string;
  customName?: string;
  displayName?: string;
  isEssential?: boolean;
  isHidden?: boolean;
  isFrictionEnabled?: boolean;
  category?: 'system' | 'communication' | 'productivity' | 'media' | 'social' | 'tools';
}

export function getAppDisplayName(app: AppInfo): string {
  if (app.customName && app.customName.trim()) {
    return app.customName.trim();
  }
  return app.label;
}

export type TextAlignment = 'left' | 'center' | 'right';
export type FontSizeOption = 'compact' | 'normal' | 'large' | 'huge';
export type FontFamilyOption = 'sans' | 'mono' | 'serif';
export type LauncherTheme = 'dark' | 'light' | 'black';

export interface SpaceConfig {
  id: string;
  name: string;
  description: string;
  appPackageNames: string[];
}

export interface LauncherSettings {
  theme: LauncherTheme;
  alignment: TextAlignment;
  fontSize: FontSizeOption;
  fontFamily: FontFamilyOption;
  showClock: boolean;
  showDate: boolean;
  showBattery: boolean;
  showStatusBar: boolean;
  showPackageNames: boolean;
  timeFormat: '12h' | '24h';
  enableFriction: boolean;
  frictionSeconds: number;
  swipeLeftAction: string; // package name or 'phone' or 'none'
  swipeRightAction: string; // package name or 'camera' or 'none'
  activeSpaceId: string;
  hideNavigationBar: boolean;
}

export interface AndroidCodeFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'markdown';
  category: 'manifest' | 'gradle' | 'model' | 'data' | 'ui' | 'theme' | 'docs';
  description: string;
  content: string;
}
