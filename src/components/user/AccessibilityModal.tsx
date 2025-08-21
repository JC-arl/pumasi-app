import { useState, useEffect } from 'react';
import { X, Eye, Volume2, Type, Palette, Zap, Users } from 'lucide-react';
import { 
  getAccessibilitySettings, 
  saveAccessibilitySettings, 
  toggleElderlyMode,
  type AccessibilitySettings 
} from '../../utils/accessibilityUtils';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityModal({ isOpen, onClose }: AccessibilityModalProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => getAccessibilitySettings());

  useEffect(() => {
    if (isOpen) {
      setSettings(getAccessibilitySettings());
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof AccessibilitySettings, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveAccessibilitySettings(newSettings);
  };

  const handleElderlyModeToggle = () => {
    const newSettings = toggleElderlyMode();
    setSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6" style={{color: '#133E87'}} />
              <h2 className="text-xl font-semibold text-gray-900">접근성 설정</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 고령자 모드 */}
            <div className="rounded-lg p-6 border" style={{background: 'linear-gradient(to right, #F3F3E0, #CBDCEB)', borderColor: '#608BC1'}}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 mt-1" style={{color: '#133E87'}} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">고령자 친화 모드</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      큰 글씨, 단순한 화면, 느린 애니메이션으로 편리하게 이용하세요
                    </p>
                    <div className="flex items-center space-x-2 text-xs" style={{color: '#133E87'}}>
                      <Zap className="h-4 w-4" />
                      <span>자동으로 최적화된 설정이 적용됩니다</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleElderlyModeToggle}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  style={{
                    backgroundColor: settings.isElderlyMode ? '#133E87' : '#E5E7EB',
                    '--tw-ring-color': '#133E87'
                  } as React.CSSProperties}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.isElderlyMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 폰트 크기 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Type className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">글자 크기</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 'small', label: '작게', sample: '가' },
                  { value: 'medium', label: '보통', sample: '가' },
                  { value: 'large', label: '크게', sample: '가' },
                  { value: 'extra-large', label: '매우 크게', sample: '가' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange('fontSize', option.value)}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      settings.fontSize === option.value
                        ? ''
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={settings.fontSize === option.value ? {
                      borderColor: '#133E87',
                      backgroundColor: '#CBDCEB',
                      color: '#133E87'
                    } : {}}
                  >
                    <div className={`font-bold mb-1 ${
                      option.value === 'small' ? 'text-sm' :
                      option.value === 'medium' ? 'text-base' :
                      option.value === 'large' ? 'text-lg' : 'text-xl'
                    }`}>
                      {option.sample}
                    </div>
                    <div className="text-xs text-gray-600">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 기타 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                <Palette className="h-5 w-5 text-gray-600" />
                <span>화면 설정</span>
              </h3>
              
              {/* 고대비 모드 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">고대비 모드</div>
                  <div className="text-sm text-gray-600">텍스트와 배경의 대비를 높여 가독성을 향상시킵니다</div>
                </div>
                <button
                  onClick={() => handleSettingChange('highContrast', !settings.highContrast)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  style={{backgroundColor: settings.highContrast ? '#133E87' : '#E5E7EB'}}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 애니메이션 감소 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">애니메이션 감소</div>
                  <div className="text-sm text-gray-600">화면 전환과 움직임을 최소화합니다</div>
                </div>
                <button
                  onClick={() => handleSettingChange('reduceMotion', !settings.reduceMotion)}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  style={{backgroundColor: settings.reduceMotion ? '#133E87' : '#E5E7EB'}}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* 도움말 */}
            <div className="rounded-lg p-4" style={{backgroundColor: '#F3F3E0', borderColor: '#CBDCEB', border: '1px solid'}}>
              <div className="flex items-start space-x-3">
                <Volume2 className="h-5 w-5 mt-0.5" style={{color: '#133E87'}} />
                <div className="text-sm">
                  <div className="font-medium mb-1" style={{color: '#133E87'}}>사용법 안내</div>
                  <div className="text-gray-700">
                    • <strong>고령자 친화 모드</strong>: 한 번에 모든 설정이 자동으로 적용됩니다<br/>
                    • <strong>개별 설정</strong>: 필요에 따라 원하는 기능만 선택할 수 있습니다<br/>
                    • 설정은 자동으로 저장되며, 다음 방문 시에도 유지됩니다
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t" style={{backgroundColor: '#F3F3E0'}}>
            <button
              onClick={onClose}
              className="px-6 py-2 text-white rounded-lg font-medium transition-colors"
              style={{backgroundColor: '#133E87'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#608BC1'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#133E87'}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}