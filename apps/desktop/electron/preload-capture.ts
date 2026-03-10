import { contextBridge, ipcRenderer } from 'electron';
import { desktopCapturer } from 'electron';

contextBridge.exposeInMainWorld('captureAPI', {
  getSources: (opts: { types: string[] }) => desktopCapturer.getSources(opts),
  onCaptureRequest: (fn: () => void) => {
    ipcRenderer.on('do-capture', () => fn());
  },
  sendResult: (result: { base64?: string; error?: string }) => {
    ipcRenderer.send('capture-result', result);
  },
});
