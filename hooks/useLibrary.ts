import { useState } from 'react';
import type { RecordingMeta } from '@/types';

export function useLibrary() {
  const [recordings] = useState<RecordingMeta[]>([]);
  const [loading] = useState(false);

  const refresh = async () => {};
  const deleteRecording = async (_id: string) => {};

  return { recordings, loading, refresh, deleteRecording };
}
