import type { ExtensionMessage } from '@/types';

export const PORT_NAME = 'chromewave-port';

export function connectToBackground(): chrome.runtime.Port {
  return chrome.runtime.connect({ name: PORT_NAME });
}

export function sendMessage(port: chrome.runtime.Port, msg: ExtensionMessage): void {
  port.postMessage(msg);
}

export function onMessage(
  port: chrome.runtime.Port,
  handler: (msg: ExtensionMessage) => void,
): void {
  port.onMessage.addListener(handler);
}
