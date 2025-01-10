import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { checkForUpdate, resolveHtmlPath } from './util';
import { cleanup, manageNetworkSwitch, startServers, stopServers } from './nodeServers/webAppServer';
import os from 'os';
import { managerBrowser } from './browserManager';
import { initializeAndInstallRootCA } from './certificateManagement/generateCertificats';
import { checkIfRootCAExistsInRegistry, checkIfRootCAFileExists } from './certificateManagement/checkCertificates';
import { checkDnsIsSet } from './dnsManagement/checkDns';
import { createDNSControllerMac, createDNSControllerTask, resetDNSEntries, setLocalhostAsPrimaryDNS } from './dnsManagement/dns2';
import Store from 'electron-store';
import fsSync from 'fs'




const schema = {
  "rpc": {
    type: "object",
    default: {
      "ethereum": "https://eth.llamarpc.com",
      "binance": "https://binance.llamarpc.com",
      "ethereumclassic": "https://etc.rivet.link",
      "avalanche": "https://avalanche-c-chain-rpc.publicnode.com",
      "arbitrum": "https://arbitrum.llamarpc.com",
      "optimism": "https://optimism.llamarpc.com",
      "fantom": "https://fantom-rpc.publicnode.com",
      "polygon": "https://polygon-bor-rpc.publicnode.com",
    }
  },
  "onboardingStatus": {
    type: "boolean",
    default: false
  },
}

export const store = new Store({ schema });

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val);
});




ipcMain.on('native', async (event, data) => {
  const { event: eventName, data: eventData } = data;
  switch (eventName) {
    case "openBrowser":
      managerBrowser(eventData)
      break;

    case "installDNS":
      let installDNSBool;
      if (os.platform() === 'win32') {
        installDNSBool = await createDNSControllerTask();
      } else {
        installDNSBool = await createDNSControllerMac();
      }
      if (installDNSBool) {
        event.reply('dnsInitialized', 'true');
      } else {
        event.reply('dnsInitialized', 'false');
      }
      break;
    case "installRootCA":
      const installCABool = await initializeAndInstallRootCA();
      if (installCABool) {
        event.reply('rootCAInitialized', 'true');
      } else if (installCABool === false) {
        event.reply('rootCAInitialized', 'false');
      }
      break;
    case "toggleNetwork":
      if (eventData === 'turn-on') {
        if (!await checkIfRootCAExistsInRegistry() || !await checkIfRootCAFileExists()) {
          await new Promise((resolve) => setTimeout(() => {
            event.reply('rootCAInitialized', 'false');
            resolve(1);
          }, 1000));
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        const installDNSBool = await setLocalhostAsPrimaryDNS();
        if (!installDNSBool) {
          await new Promise((resolve) => setTimeout(() => {
            event.reply('dnsInitialized', 'false');
            resolve(1);
          }, 1000));
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));


        await checkForUpdate();
        await startServers();

        event.reply('network-status', 'on');
        await manageNetworkSwitch(event);
      } else if (eventData === 'turn-off') {
        await cleanup();
        event.reply('network-status', 'off');
      }
      break;
    case "getStatusForConfiguration":
      const certificateStatus = await checkIfRootCAExistsInRegistry() && await checkIfRootCAFileExists();
      const dnsStatus = await setLocalhostAsPrimaryDNS()
      event.reply('configuration-status', JSON.stringify({ certificateStatus, dnsStatus }));
      break;
    default:
      break;
  }
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const platform = os.platform();
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  await checkForUpdate();
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 640,
    height: 680,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webviewTag: true,
      devTools: true,
    },
    minWidth: 640,
    minHeight: 680,
    title: "Frigid",
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff00',
      symbolColor: '#FFFFFF',
      height: 45,
    },
    backgroundColor: 'transparent',
    trafficLightPosition: {
      x: 17,
      y: 17,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      if (os.platform() === 'darwin') {
        /*  const nativeImage = require('electron').nativeImage;
         const image = nativeImage.createFromPath('./assets/macIcon.png');
         app.dock.setIcon(image); */
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('before-quit', () => {
  cleanup(); // Your cleanup function
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
  cleanup();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        createWindow();
      }
    });
  })
  .catch(console.log);

var link;
app.on('open-url', function (event, data) {
  event.preventDefault();
  link = data;
});

app.setAsDefaultProtocolClient('frigid');

export const getLink = () => link;
