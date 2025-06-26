import React from 'react';
import { ThemeEditor } from '../theme';
import type { ApplicationSetting } from '@/types/settings';

interface AppearancePanelProps {
  settings: ApplicationSetting[];
  onRefresh: () => void;
}

export const AppearancePanel: React.FC<AppearancePanelProps> = ({ 
  settings, 
  onRefresh 
}) => {
  return <ThemeEditor settings={settings} onRefresh={onRefresh} />;
};