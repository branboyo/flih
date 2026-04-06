import { useState } from 'react';
import type { EditorState } from '@/types';

const INITIAL_STATE: EditorState = {
  recordingId: null,
  audioBuffer: null,
  trimStart: 0,
  trimEnd: 0,
  isPlaying: false,
  isProcessing: false,
};

export function useAudioEditor() {
  const [state] = useState<EditorState>(INITIAL_STATE);

  const loadRecording = async (_id: string) => {};
  const setTrimStart = (_time: number) => {};
  const setTrimEnd = (_time: number) => {};
  const applyEffect = async (_effectId: string) => {};
  const play = () => {};
  const pause = () => {};

  return { state, loadRecording, setTrimStart, setTrimEnd, applyEffect, play, pause };
}
