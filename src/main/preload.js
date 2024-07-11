import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  ipcRenderer: {
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel, func) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    sendMessage(channel, event, data) {
      if (channel === 'native') {
        ipcRenderer.send(channel, { event, data });
      }
    },
  },
  store: {
    get(key) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(key, val) {
      ipcRenderer.send('electron-store-set', key, val);
    },
  },
};

// Expose the modified electronHandler object to the WebView through contextBridge.
contextBridge.exposeInMainWorld('electron', electronHandler);
