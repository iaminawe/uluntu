import React, { useState, useRef, useCallback } from 'react';

interface TouchGestureProps {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: () => void;
  onTap?: () => void;
  threshold?: number;
  longPressThreshold?: number;
  className?: string;
  children: React.ReactNode;
}

interface TouchInfo {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

/**
 * Touch gesture component for mobile drag operations
 * Provides swipe and long press gestures for menu item interactions
 */
export const TouchGestures: React.FC<TouchGestureProps> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  onTap,
  threshold = 50,
  longPressThreshold = 500,
  className = '',
  children
}) => {
  const [touchInfo, setTouchInfo] = useState<TouchInfo | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const newTouchInfo: TouchInfo = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY
    };

    setTouchInfo(newTouchInfo);

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        // Add haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([50, 50, 50]);
        }
        onLongPress();
      }, longPressThreshold);
    }

    // Prevent default to avoid scrolling interference
    e.preventDefault();
  }, [onLongPress, longPressThreshold]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchInfo) return;

    const touch = e.touches[0];
    if (!touch) return;

    setTouchInfo(prev => prev ? {
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY
    } : null);

    // Cancel long press if significant movement
    const deltaX = Math.abs(touch.clientX - touchInfo.startX);
    const deltaY = Math.abs(touch.clientY - touchInfo.startY);

    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = undefined;
      }
    }

    e.preventDefault();
  }, [touchInfo]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchInfo) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }

    const deltaX = touchInfo.currentX - touchInfo.startX;
    const deltaY = touchInfo.currentY - touchInfo.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const duration = Date.now() - touchInfo.startTime;

    // Determine gesture type
    if (absDeltaX > threshold || absDeltaY > threshold) {
      // Swipe gesture
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (duration < 300 && onTap) {
      // Quick tap
      onTap();
    }

    setTouchInfo(null);
    e.preventDefault();
  }, [touchInfo, threshold, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onTap]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
    setTouchInfo(null);
  }, []);

  return (
    <div
      ref={elementRef}
      className={`touch-none select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none'
      }}
    >
      {children}
    </div>
  );
};

export default TouchGestures;