export async function requestTabCapture(tabId: number): Promise<string> {
  throw new Error('Not implemented');
}

export async function startMediaStream(streamId: string): Promise<MediaStream> {
  throw new Error('Not implemented');
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  throw new Error('Not implemented');
}

export function stopRecorder(recorder: MediaRecorder): Promise<Blob> {
  throw new Error('Not implemented');
}
