// 품앗이 브랜드 컬러 시스템
export const colors = {
  // Primary brand colors
  primary: {
    main: '#328E6E',      // 메인 버튼색
    light: '#67AE6E',     // 은은한 강조색 1
    lighter: '#90C67C',   // 은은한 강조색 2
    accent: '#E1EEBC',    // 기타 강조색
  },
  
  // UI 컬러 매핑
  button: {
    primary: '#328E6E',
    primaryHover: '#2a7659',
    primaryLight: '#67AE6E',
    primaryLightHover: '#5a9962',
  },
  
  background: {
    primary: '#E1EEBC',
    light: '#f0f7e8',
    card: '#ffffff',
  },
  
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    accent: '#328E6E',
  },
  
  border: {
    primary: '#328E6E',
    light: '#90C67C',
    accent: '#E1EEBC',
  },
  
  status: {
    success: '#67AE6E',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#328E6E',
  }
};

// Tailwind 클래스 매핑
export const colorClasses = {
  button: {
    primary: 'bg-[#328E6E] hover:bg-[#2a7659] text-white',
    secondary: 'bg-[#67AE6E] hover:bg-[#5a9962] text-white',
    outline: 'border-[#328E6E] text-[#328E6E] hover:bg-[#328E6E] hover:text-white',
    accent: 'bg-[#E1EEBC] hover:bg-[#d4e5a8] text-[#328E6E]',
  },
  
  background: {
    primary: 'bg-[#E1EEBC]',
    light: 'bg-[#f0f7e8]',
    card: 'bg-white',
  },
  
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    accent: 'text-[#328E6E]',
  },
  
  border: {
    primary: 'border-[#328E6E]',
    light: 'border-[#90C67C]',
    accent: 'border-[#E1EEBC]',
  }
};