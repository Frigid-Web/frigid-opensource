import express, { Express, Request, Response } from 'express';
import https from 'https';
import http from 'http';
import { generateCertificateForDomain, initializeAndInstallRootCA } from '../certificateManagement/generateCertificats';
import * as tls from 'tls';
import { resetDNSEntries, startDNSServer, stopDNSServer } from '../dnsManagement/dns2';
import { Interface } from 'readline';
import { traverseAndReconstruct } from './reconstructRequest';
import devFrigid, { devFrigidWebsocketUpgrade } from './isolatedServers/devFrigid';
import web3Domains from './isolatedServers/web3domains';
import previewFrigid from './isolatedServers/previewFrigid';
import WebSocket, { WebSocketServer } from 'ws';
import { checkDnsIsSet } from '../dnsManagement/checkDns';
import apiFrigid from './isolatedServers/apiFrigid';
import { store } from '../main';
import localFrigid from './isolatedServers/localFrigid';
import startFrigid from './isolatedServers/startFrigid';
import pingPongFrigid from './isolatedServers/pingPongFrigid';
import { dialog, app as electronApp } from 'electron';
import { getAppPathway } from '../util';
import path from 'path';

const app = express();
const pingPongServer = express();

let pathway;
let root;
if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
    root = electronApp.getAppPath();
} else if (getAppPathway()) {
    pathway = getAppPathway()
    root = path.resolve(getAppPathway() + '/../../')
} else {
    throw new Error('PORTABLE_EXECUTABLE_DIR is not defined in production mode');
}




let PORT_HTTP = 80;
let PORT_HTTPS = 443;

let serverHttp = null;
let serverHttps = null;

let localWs = null;


if (process.env.NODE_ENV == 'development') {
    localWs = new WebSocket.Server({ noServer: true });
}

let manageNetworkSwitchInterval = null;


export const manageNetworkSwitch = async (ipcMain) => {
    if (manageNetworkSwitchInterval != null) clearInterval(manageNetworkSwitchInterval);

    manageNetworkSwitchInterval = setInterval(async () => {
        try {
            const results = await fetch('http://ping.frigid');
            if (results.status != 200) {
                dialog.showMessageBox({ message: "Frigid network closed due to network conditions.", title: "Frigid Network Closed" })

                ipcMain.reply('network-status', 'off');
                cleanup();
            }
        } catch (error) {
            dialog.showMessageBox({ message: "Frigid network closed due to network conditions.", title: "Frigid Network Closed" })

            ipcMain.reply('network-status', 'off');
            cleanup();
        }
    }, 30 * 1000);
};

const routeWebsocketRequest = (req, socket, head) => {
    if (process.env.NODE_ENV == 'development') {
        if (req.url == '/ws') {
            if (localWs != null) {
                localWs.handleUpgrade(req, socket, head, function done(ws) {
                    localWs.emit('connection', ws, req);
                });
                return;
            }
        }
    }
    if (req.url == '/') {
        const host = req['headers']['host'] || '';
        const domainSuffix = host.split('.').pop();
        if (domainSuffix === 'frigid') {
            console.log('frigid socket');
            switch (host) {
                case 'dev.frigid': devFrigidWebsocketUpgrade(req, socket, head); break;
                default: break;
            }
        }
    } else {
        socket.destroy();
    }
};

app.use(async (req, res, next) => {
    const host = req.hostname;
    const domainSuffix = host.split('.').pop() || '';
    const hostPath = req.path;
    const appInfo = await store.get('chainAppInfo');
    const web3domainSuffixes = appInfo.domains;
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return;
    }
    if (domainSuffix === 'frigid') {
        if (host == 'local.frigid' && process.env.NODE_ENV == 'development') {
            localFrigid(req, res, next);
            return;
        }
        if (host == 'mediainfo.frigid' && process.env.NODE_ENV == 'development') {
            const wasmPath = path.resolve(root, 'assets', 'MediaInfoModule.wasm');

            // Ensure the correct MIME type is set for .wasm files
            res.setHeader('Content-Type', 'application/wasm');

            res.sendFile(wasmPath, (err) => {
                if (err) {
                    console.error('Error sending WASM file:', err);
                    res.status(err.status).end();
                }
            });
       
      
            return 
        }
        if (host.includes('.preview.frigid')) {
            previewFrigid(req, res, next);
            return;
        }
        switch (host) {
            case 'ping.frigid': pingPongFrigid(req, res, next); break;
            case 'dev.frigid': devFrigid(req, res, next); break;
            case 'api.frigid': apiFrigid(req, res, next); break;
            case 'start.frigid': startFrigid(req, res, next); break;
            default: break;
        }
    } else if (web3domainSuffixes[domainSuffix] != undefined) {
        web3Domains(req, res, next);
    }
    return;
});


pingPongServer.use(async (req, res, next) => {
    const host = req.hostname;
    const domainSuffix = host.split('.').pop() || '';
    const appInfo = await store.get('chainAppInfo');
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
        return;
    }

    if (domainSuffix === 'frigid') {
        if(host == 'mediainfo.frigid'){
            const wasmPath = path.resolve(root, 'assets', 'MediaInfoModule.wasm');

            // Ensure the correct MIME type is set for .wasm files
            res.setHeader('Content-Type', 'application/wasm');

            res.sendFile(wasmPath, (err) => {
                if (err) {
                    console.error('Error sending WASM file:', err);
                    res.status(err.status).end();
                }
            });
       
      
            return 
        }
        switch (host) {
            case 'ping.frigid': pingPongFrigid(req, res, next); break;
            default: break;
        }
    }
    return;
});

export const startServers = async () => {
    // HTTP Server
    if (process.env.NODE_ENV == 'development') {
        if (!serverHttp) {
            serverHttp = http.createServer(app).listen(PORT_HTTP, () => {
                console.log(`HTTP Server running on port ${PORT_HTTP}`);
            });
            serverHttp.on('upgrade', routeWebsocketRequest);
        }
    }
    else {
        if (!serverHttp) {
            serverHttp = http.createServer(pingPongServer).listen(PORT_HTTP, () => {
                console.log(`HTTP Server running on port ${PORT_HTTP}`);
            });
            serverHttp.on('upgrade', routeWebsocketRequest);
        }
    }

    // HTTPS Server
    if (!serverHttps) {
        await startDNSServer();

        const domain = 'localhost';
        const { key, cert, ca } = await generateCertificateForDomain(domain) || {};

        if (!key || !cert) {
            throw new Error('Failed to generate certificate for the server domain.');
        }

        const options = {
            key: key,
            cert: cert,
            SNICallback: async (domain, cb) => {
                const certDetails = await generateCertificateForDomain(domain);
                if (!certDetails) {
                    throw new Error(`Failed to generate certificate for domain: ${domain}`);
                }
                const ctx = tls.createSecureContext({ key: certDetails.key, cert: certDetails.cert });
                cb(null, ctx);
            }
        };

        serverHttps = https.createServer(options, app).listen(PORT_HTTPS, () => {
            console.log(`HTTPS Server running on port ${PORT_HTTPS}`);
        });

        serverHttps.on('upgrade', routeWebsocketRequest);
    }
};

export const stopServers = () => {
    if (serverHttp) {
        serverHttp.close();
        serverHttp = null;
    }
    if (serverHttps) {
        serverHttps.close();
        serverHttps = null;
    }
    console.log('Servers Stopped');
};

export const cleanup = async () => {
    if (manageNetworkSwitchInterval != null) clearInterval(manageNetworkSwitchInterval);
    manageNetworkSwitchInterval = null;
    resetDNSEntries();
    stopServers();
    stopDNSServer();
};

process.on('exit', () => {
    cleanup(); // Synchronous call, assuming cleanup is quick and does not need to await
});

// Ctrl+C and other external interrupts
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down...');
    await cleanup();
    process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await cleanup();
    process.exit(1);
});

// SIGTERM signal (sent by tools like Kubernetes during pod shutdown)
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await cleanup();
    process.exit(1);
});
