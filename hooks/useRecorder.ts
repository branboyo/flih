import { useState } from 'react';
import type { RecordingState } from '@/types';

const INITIAL_STATE: RecordingState = {
  status: 'idle',
  elapsed: 0,
  maxDuration: 300,
  streamId: null,
};

export function useRecorder() {
  const [state] = useState<RecordingState>(INITIAL_STATE);
  const [audioBlob] = useState<Blob | null>(null);

  const startRecording = async () => {};
  const stopRecording = async () => {};

  return { state, startRecording, stopRecording, audioBlob };
}
