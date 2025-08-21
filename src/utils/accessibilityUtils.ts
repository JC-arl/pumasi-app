export interface AccessibilitySettings {
  isElderlyMode: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface AccessibilityBackup {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
}

const ACCESSIBILITY_KEY = 'accessibilitySettings';
const ACCESSIBILITY_BACKUP_KEY = 'accessibilityBackup';

const defaultSettings: AccessibilitySettings = {
  isElderlyMode: false,
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
};

// 접근성 설정 조회
export const getAccessibilitySettings = (): AccessibilitySettings => {
  const data = localStorage.getItem(ACCESSIBILITY_KEY);
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

// 접근성 설정 저장
export const saveAccessibilitySettings = (settings: AccessibilitySettings): void => {
  localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(settings));
  applyAccessibilitySettings(settings);
};

// 백업 저장
const saveBackup = (settings: AccessibilitySettings): void => {
  const backup: AccessibilityBackup = {
    fontSize: settings.fontSize,
    highContrast: settings.highContrast,
    reduceMotion: settings.reduceMotion,
  };
  localStorage.setItem(ACCESSIBILITY_BACKUP_KEY, JSON.stringify(backup));
};

// 백업 복원
const restoreFromBackup = (): AccessibilityBackup => {
  const data = localStorage.getItem(ACCESSIBILITY_BACKUP_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // 백업이 없으면 기본 설정 반환
  return {
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
  };
};

// 고령자 모드 토글
export const toggleElderlyMode = (): AccessibilitySettings => {
  const currentSettings = getAccessibilitySettings();
  
  if (!currentSettings.isElderlyMode) {
    // 고령자 모드 활성화 - 현재 설정을 백업하고 고령자 설정 적용
    saveBackup(currentSettings);
    const newSettings: AccessibilitySettings = {
      ...currentSettings,
      isElderlyMode: true,
      fontSize: 'large',
      reduceMotion: true,
    };
    saveAccessibilitySettings(newSettings);
    return newSettings;
  } else {
    // 고령자 모드 해제 - 백업된 설정으로 복원
    const backup = restoreFromBackup();
    const newSettings: AccessibilitySettings = {
      ...backup,
      isElderlyMode: false,
    };
    saveAccessibilitySettings(newSettings);
    return newSettings;
  }
};

// 접근성 설정을 DOM에 적용
export const applyAccessibilitySettings = (settings: AccessibilitySettings): void => {
  const root = document.documentElement;
  
  // 고령자 모드 클래스 적용
  if (settings.isElderlyMode) {
    root.classList.add('elderly-mode');
  } else {
    root.classList.remove('elderly-mode');
  }
  
  // 폰트 크기 적용
  root.classList.remove('text-small', 'text-medium', 'text-large', 'text-extra-large');
  root.classList.add(`text-${settings.fontSize}`);
  
  // 고대비 모드
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
  
  // 애니메이션 감소
  if (settings.reduceMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
};

// 초기화 함수 (앱 시작 시 호출)
export const initializeAccessibility = (): void => {
  const settings = getAccessibilitySettings();
  applyAccessibilitySettings(settings);
};