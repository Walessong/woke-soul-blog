import { contextBridge, ipcRenderer } from 'electron';
import type { StudioConfig, StudioPost } from './shared';

contextBridge.exposeInMainWorld('studio', {
  config: { get: () => ipcRenderer.invoke('config:get'), save: (config: StudioConfig) => ipcRenderer.invoke('config:save', config) },
  chooseRepository: () => ipcRenderer.invoke('dialog:repo'),
  status: () => ipcRenderer.invoke('status:get'),
  posts: { list: () => ipcRenderer.invoke('posts:list'), save: (post: StudioPost) => ipcRenderer.invoke('posts:save', post), delete: (filename: string) => ipcRenderer.invoke('posts:delete', filename) },
  importImages: () => ipcRenderer.invoke('images:import'),
  publish: (filename: string, images: string[]) => ipcRenderer.invoke('publish', filename, images),
  openExternal: (url: string) => ipcRenderer.invoke('openExternal', url),
});
