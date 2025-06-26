import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Smartphone, 
  Tablet, 
  Monitor,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ThemePreset } from '@/lib/themes/presets';
import { ColorUtils, ScreenReaderUtils, AriaUtils, KeyboardNav } from '@/lib/utils/accessibility';

interface AccessibleThemePreviewProps {
  theme: ThemePreset;
  isActive?: boolean;
  onSelect?: () => void;
  showAccessibilityInfo?: boolean;
  animationDelay?: number;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const AccessibleThemePreview: React.FC<AccessibleThemePreviewProps> = ({
  theme,
  isActive = false,
  onSelect,
  showAccessibilityInfo = true,
  animationDelay = 0,
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [contrastResults, setContrastResults] = useState<{
    textContrast: number;
    buttonContrast: number;
    passes: boolean;
  } | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const labelId = AriaUtils.generateId('theme-preview');
  const descriptionId = AriaUtils.generateId('theme-description');

  // Calculate contrast ratios
  useEffect(() => {
    const textContrast = ColorUtils.getContrastRatio(theme.configurations.colors.text, theme.configurations.colors.background);
    const buttonContrast = ColorUtils.getContrastRatio('#FFFFFF', theme.configurations.colors.primary);
    
    const passesTextContrast = ColorUtils.meetsWCAG(
      theme.configurations.colors.text,
      theme.configurations.colors.background,
      'AA',
      parseInt(theme.configurations.typography.font_size_base),
      400 // Normal font weight
    );
    
    const passesButtonContrast = buttonContrast >= 4.5;
    
    setContrastResults({
      textContrast,
      buttonContrast,
      passes: passesTextContrast && passesButtonContrast,
    });
  }, [theme]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case KeyboardNav.KEYS.ENTER:
      case KeyboardNav.KEYS.SPACE:
        event.preventDefault();
        onSelect?.();
        ScreenReaderUtils.announce(`Selected ${theme.name} theme`);
        break;
        
      case 'd':
      case 'D':
        // Quick device switching
        const devices: DeviceType[] = ['mobile', 'tablet', 'desktop'];
        const currentIndex = devices.indexOf(device);
        const nextDevice = devices[(currentIndex + 1) % devices.length];
        setDevice(nextDevice);
        ScreenReaderUtils.announce(`Switched to ${nextDevice} preview`);
        break;
        
      case 'v':
      case 'V':
        // Toggle preview visibility
        setShowPreview(!showPreview);
        ScreenReaderUtils.announce(`Preview ${!showPreview ? 'shown' : 'hidden'}`);
        break;
    }
  };

  const deviceSizes = {
    mobile: { width: 320, height: 568, scale: 0.5 },
    tablet: { width: 768, height: 1024, scale: 0.3 },
    desktop: { width: 1366, height: 768, scale: 0.25 },
  };

  const currentDeviceSize = deviceSizes[device];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animationDelay }}
      className={`
        relative rounded-lg border-2 transition-all duration-300
        ${isActive 
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-offset-2' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
        ${onSelect ? 'cursor-pointer' : ''}
      `}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={onSelect ? 0 : -1}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      aria-pressed={isActive}
      ref={previewRef}
    >
      {/* Theme Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 id={labelId} className="font-semibold text-gray-900 flex items-center gap-2">
              {theme.name}
              {isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex"
                >
                  <Check className="h-4 w-4 text-blue-600" aria-label="Currently selected" />
                </motion.span>
              )}
            </h3>
            <p id={descriptionId} className="text-sm text-gray-600 mt-1">
              {theme.description}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(!showPreview);
              ScreenReaderUtils.announce(`Preview ${!showPreview ? 'shown' : 'hidden'}`);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Color Swatches */}
        <div className="flex gap-2 mt-3" role="group" aria-label="Theme colors">
          {Object.entries({
            Primary: theme.configurations.colors.primary,
            Secondary: theme.configurations.colors.secondary,
            Success: theme.configurations.colors.success,
            Background: theme.configurations.colors.background,
          }).map(([name, color]) => (
            <div
              key={name}
              className="group relative"
              role="img"
              aria-label={`${name} color: ${color}`}
            >
              <div
                className="w-10 h-10 rounded-lg border border-gray-300 shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: color }}
              />
              <span className="sr-only">{name}: {color}</span>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {/* Device Selector */}
              <div className="flex justify-center gap-2 mb-4" role="group" aria-label="Device preview options">
                {(['mobile', 'tablet', 'desktop'] as const).map((deviceType) => {
                  const Icon = deviceType === 'mobile' ? Smartphone : deviceType === 'tablet' ? Tablet : Monitor;
                  return (
                    <button
                      key={deviceType}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDevice(deviceType);
                        ScreenReaderUtils.announce(`Switched to ${deviceType} preview`);
                      }}
                      className={`
                        p-2 rounded-lg transition-all
                        ${device === deviceType
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                      aria-label={`View ${deviceType} preview`}
                      aria-pressed={device === deviceType}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>

              {/* Device Frame */}
              <motion.div
                key={device}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative mx-auto bg-gray-900 rounded-2xl p-2 shadow-xl"
                style={{
                  width: `${currentDeviceSize.width * currentDeviceSize.scale}px`,
                  height: `${currentDeviceSize.height * currentDeviceSize.scale}px`,
                }}
                role="img"
                aria-label={`${theme.name} theme preview on ${device}`}
              >
                {/* Screen */}
                <div
                  className="w-full h-full rounded-xl overflow-hidden"
                  style={{ backgroundColor: theme.configurations.colors.background }}
                >
                  {/* Mini UI Preview */}
                  <div 
                    className="h-full flex flex-col p-3"
                    style={{ 
                      transform: `scale(${currentDeviceSize.scale})`,
                      transformOrigin: 'top left',
                      width: `${100 / currentDeviceSize.scale}%`,
                      height: `${100 / currentDeviceSize.scale}%`,
                    }}
                  >
                    {/* Header */}
                    <header 
                      className="p-4 -m-3 mb-4"
                      style={{ backgroundColor: theme.configurations.colors.surface }}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="font-bold text-lg"
                          style={{ color: theme.configurations.colors.primary }}
                        >
                          Logo
                        </div>
                        <button
                          className="px-4 py-2 rounded text-white text-sm"
                          style={{ 
                            backgroundColor: theme.configurations.colors.primary,
                            borderRadius: theme.configurations.borders.radius_md
                          }}
                        >
                          Sign In
                        </button>
                      </div>
                    </header>
                    
                    {/* Content */}
                    <main className="flex-1 space-y-4">
                      <div 
                        className="p-4 rounded-lg"
                        style={{ 
                          backgroundColor: theme.configurations.colors.surface,
                          borderRadius: theme.configurations.borders.radius_lg,
                          boxShadow: theme.configurations.shadows.shadow_md
                        }}
                      >
                        <h2 
                          className="font-semibold text-lg mb-2"
                          style={{ color: theme.configurations.colors.text }}
                        >
                          Welcome
                        </h2>
                        <p 
                          className="text-sm"
                          style={{ color: theme.configurations.colors.text_muted }}
                        >
                          Experience our beautiful theme system
                        </p>
                      </div>
                    </main>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Accessibility Info */}
            {showAccessibilityInfo && contrastResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="px-4 pb-4"
              >
                <div className={`
                  rounded-lg p-3 text-sm
                  ${contrastResults.passes 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-amber-50 border border-amber-200'
                  }
                `}>
                  <div className="flex items-start gap-2">
                    {contrastResults.passes ? (
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${contrastResults.passes ? 'text-green-900' : 'text-amber-900'}`}>
                        Accessibility {contrastResults.passes ? 'Passed' : 'Warning'}
                      </p>
                      <ul className={`mt-1 space-y-1 ${contrastResults.passes ? 'text-green-700' : 'text-amber-700'}`}>
                        <li>
                          Text contrast: {contrastResults.textContrast.toFixed(2)}:1
                          {contrastResults.textContrast >= 4.5 ? ' ✓' : ' (min 4.5:1)'}
                        </li>
                        <li>
                          Button contrast: {contrastResults.buttonContrast.toFixed(2)}:1
                          {contrastResults.buttonContrast >= 4.5 ? ' ✓' : ' (min 4.5:1)'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <div className="px-4 pb-3">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Info className="h-3 w-3" />
          Press D for device, V for preview toggle
        </p>
      </div>
    </motion.div>
  );
};