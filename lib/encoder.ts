import type { AudioFormat } from '@/types';

export function encodeWav(buffer: AudioBuffer): Blob {
  throw new Error('Not implemented');
}

export async function encodeMp3(buffer: AudioBuffer): Promise<Blob> {
  throw new Error('Not implemented');
}

export async function encodeAudio(
  buffer: AudioBuffer,
  format: AudioFormat,
): Promise<Blob> {
  if (format === 'wav') return encodeWav(buffer);
  return encodeMp3(buffer);
}
