import { useState } from 'react';
import type { Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/storage';

export function useSettings() {
  const [settings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading] = useState(false);

  const updateSettings = async (_partial: Partial<Settings>) => {};

  return { settings, loading, updateSettings };
}
