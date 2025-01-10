import express, { Express, Request, Response } from 'express';
const { createProxyMiddleware } = require('http-proxy-middleware');
import cors from 'cors';
import { app } from 'electron';
import { getAppPathway } from '../../util';
import fs from 'fs';
import path from 'path';
const mime = require('mime');


const startFrigid = express();

let pathway;
let root;
if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
    root = app.getAppPath();
} else if (getAppPathway()) {
    pathway = getAppPathway()
    root = path.resolve(getAppPathway() + '/../../')
} else {
    throw new Error('PORTABLE_EXECUTABLE_DIR is not defined in production mode');
}


let allowedOrigins = ['http://start.frigid', 'https://start.frigid'];
if (process.env.NODE_ENV == 'development') {
    allowedOrigins.push('http://localhost:1212')
    allowedOrigins.push('http://localhost')
}
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};




startFrigid.use(cors(corsOptions));

startFrigid.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

    next();
});



startFrigid.use(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }

    if (process.env.NODE_ENV === 'production') {

        const hostPath = decodeURIComponent(req.path);
        let splitPaths = hostPath.split('/')
        splitPaths = splitPaths.filter(item => item !== "");
        let fileResponse = null
        if (splitPaths.length == 0) {
            //Page render
            fileResponse = { data: fs.readFileSync(path.resolve(pathway + '/renderer/index.html')), mime: 'text/html' };
        }
        else {
            let hasExtension = splitPaths[splitPaths.length - 1].includes('.')
            if (hasExtension) {
                let newHostPath = hostPath

                if(req.headers.referer != undefined){
                    const refererHeader = req.headers.referer;
                    const referer = new URL(refererHeader);
                    const path = referer.pathname;
                    let pathToRemove = path.split('/')
                    pathToRemove.pop()
                    newHostPath = hostPath.replace(pathToRemove.join('/'), '')
                }
                const type = mime.getType(newHostPath) || 'application/octet-stream';
                fileResponse = { data: fs.readFileSync(path.resolve(pathway + '/renderer' + newHostPath)), mime: type };

            }
            else {
                fileResponse = { data: fs.readFileSync(path.resolve(pathway + '/renderer/index.html')), mime: 'text/html' };

            }
        }

        if (fileResponse != null) {
            res.setHeader('Content-Type', fileResponse.mime);
            res.send(fileResponse.data);
            return;
        }
        else {
            res.status(404).send('Resource not found')
        }

        return; // Stop further processing
    }
    else {

        const upgradeHeader = req.headers.upgrade;
        const target = upgradeHeader && upgradeHeader.toLowerCase() === 'websocket'
            ? 'ws://localhost:1212/ws-hmr'
            : 'http://localhost:1212';

        // Create and return the proxy middleware
        const proxy = createProxyMiddleware({
            target: target,
            changeOrigin: true,
            ws: upgradeHeader && upgradeHeader.toLowerCase() === 'websocket',
            logLevel: 'debug',
        });

        return proxy(req, res);
    }
    
})






export default startFrigid;
