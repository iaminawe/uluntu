/**
 * Accessibility utilities for theme system
 * Ensures WCAG 2.1 AA compliance and provides keyboard navigation support
 */

/**
 * WCAG 2.1 contrast ratio requirements
 */
export const WCAG_CONTRAST_RATIOS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Calculate relative luminance
   */
  getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG standards
   */
  meetsWCAG(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    fontSize: number = 16,
    fontWeight: number = 400
  ): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

    if (level === 'AA') {
      return ratio >= (isLargeText ? WCAG_CONTRAST_RATIOS.AA_LARGE : WCAG_CONTRAST_RATIOS.AA_NORMAL);
    } else {
      return ratio >= (isLargeText ? WCAG_CONTRAST_RATIOS.AAA_LARGE : WCAG_CONTRAST_RATIOS.AAA_NORMAL);
    }
  },

  /**
   * Suggest a better color if contrast is insufficient
   */
  suggestAccessibleColor(
    foreground: string,
    background: string,
    targetRatio: number = WCAG_CONTRAST_RATIOS.AA_NORMAL
  ): string {
    const currentRatio = this.getContrastRatio(foreground, background);
    if (currentRatio >= targetRatio) return foreground;

    const bgRgb = this.hexToRgb(background);
    const fgRgb = this.hexToRgb(foreground);
    if (!bgRgb || !fgRgb) return foreground;

    const bgLuminance = this.getLuminance(bgRgb);
    const targetLuminance = bgLuminance > 0.5
      ? (bgLuminance + 0.05) / targetRatio - 0.05
      : targetRatio * (bgLuminance + 0.05) - 0.05;

    // Adjust foreground color to meet target luminance
    const factor = targetLuminance / this.getLuminance(fgRgb);
    const adjustedRgb = {
      r: Math.min(255, Math.max(0, Math.round(fgRgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(fgRgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(fgRgb.b * factor))),
    };

    return `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g
      .toString(16)
      .padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`;
  },
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardNav = {
  /**
   * Common keyboard keys
   */
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
  } as const,

  /**
   * Handle keyboard navigation for list items
   */
  handleListKeyboard(
    event: React.KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onSelect: (index: number) => void,
    options?: {
      horizontal?: boolean;
      wrap?: boolean;
      onEscape?: () => void;
    }
  ): void {
    const { horizontal = false, wrap = true, onEscape } = options || {};
    const key = event.key;
    let newIndex = currentIndex;

    switch (key) {
      case this.KEYS.ARROW_UP:
      case (horizontal ? this.KEYS.ARROW_LEFT : null):
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = wrap ? itemCount - 1 : 0;
        }
        break;

      case this.KEYS.ARROW_DOWN:
      case (horizontal ? this.KEYS.ARROW_RIGHT : null):
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= itemCount) {
          newIndex = wrap ? 0 : itemCount - 1;
        }
        break;

      case this.KEYS.HOME:
        event.preventDefault();
        newIndex = 0;
        break;

      case this.KEYS.END:
        event.preventDefault();
        newIndex = itemCount - 1;
        break;

      case this.KEYS.ESCAPE:
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;

      default:
        return;
    }

    if (newIndex !== currentIndex) {
      onSelect(newIndex);
    }
  },

  /**
   * Trap focus within a container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstFocusable?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
};

/**
 * ARIA utilities
 */
export const AriaUtils = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Build ARIA label from multiple sources
   */
  buildLabel(...parts: (string | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
  },

  /**
   * Common ARIA attributes for interactive elements
   */
  interactiveProps(
    role: string,
    label: string,
    options?: {
      pressed?: boolean;
      expanded?: boolean;
      selected?: boolean;
      disabled?: boolean;
      describedBy?: string;
      controls?: string;
    }
  ): Record<string, any> {
    const props: Record<string, any> = {
      role,
      'aria-label': label,
    };

    if (options) {
      if (typeof options.pressed === 'boolean') {
        props['aria-pressed'] = options.pressed;
      }
      if (typeof options.expanded === 'boolean') {
        props['aria-expanded'] = options.expanded;
      }
      if (typeof options.selected === 'boolean') {
        props['aria-selected'] = options.selected;
      }
      if (typeof options.disabled === 'boolean') {
        props['aria-disabled'] = options.disabled;
      }
      if (options.describedBy) {
        props['aria-describedby'] = options.describedBy;
      }
      if (options.controls) {
        props['aria-controls'] = options.controls;
      }
    }

    return props;
  },
};

/**
 * Screen reader utilities
 */
export const ScreenReaderUtils = {
  /**
   * Visually hidden but screen reader accessible styles
   */
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  } as const,

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};

/**
 * Focus management utilities
 */
export const FocusUtils = {
  /**
   * Save and restore focus
   */
  saveFocus(): { restore: () => void } {
    const activeElement = document.activeElement as HTMLElement;
    return {
      restore: () => {
        if (activeElement && typeof activeElement.focus === 'function') {
          activeElement.focus();
        }
      },
    };
  },

  /**
   * Focus first focusable element in container
   */
  focusFirst(container: HTMLElement): void {
    const focusable = container.querySelector<HTMLElement>(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  },

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    if (element.tabIndex >= 0) return true;
    
    const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    return focusableTags.includes(element.tagName) && !element.hasAttribute('disabled');
  },
};