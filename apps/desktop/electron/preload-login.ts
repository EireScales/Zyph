import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('loginAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  login: (payload: { email: string; password: string; apiBaseUrl: string }) =>
    ipcRenderer.invoke('login', payload),
});
