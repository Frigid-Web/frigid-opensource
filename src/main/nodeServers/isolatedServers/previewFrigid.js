import express, { Express, Request, Response } from 'express';
import { previewStructure } from '../memStore';
import { traverseAndReconstruct } from '../reconstructRequest';
import fs from 'fs';
import { getAppPathway } from '../../util';
import { app } from 'electron';
const mime = require('mime');
import path from 'path';
const asar = require('@electron/asar');
const previewFrigid = express();


let pathway;
let root;
if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
    root = app.getAppPath();
} else if (getAppPathway()) {
    pathway = getAppPathway() + '/../../'
    root = getAppPathway() + '/../../'
} else {
    throw new Error('PORTABLE_EXECUTABLE_DIR is not defined in production mode');
}

function extractHexString(hexString) {
    // Find the first occurrence of '7B' and '7D'
    let start = hexString.indexOf('7b');
    if (start == -1) {
        start = hexString.indexOf('7B');
    }
    let end = hexString.lastIndexOf('7d');
    if (end == -1) {
        end = hexString.lastIndexOf('7D');
    }
    if (start === -1 || end === -1) {
        throw new Error('Hex string does not contain required start or end markers.');
    }

    return hexString.slice(start + 2, end);
}


const recombineFile = (pathway) => {
    let combinedBuffers = [];

    const traverseAndReadChunks = (currentPath) => {
        const items = fs.readdirSync(currentPath).sort((a, b) => {
            return a - b;
        });
        items.forEach(item => {
            const itemPath = path.join(currentPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                traverseAndReadChunks(itemPath); // Recurse into the directory
            } else if (stats.isFile() && item === 'chunk.txt') {
                let hexData = fs.readFileSync(itemPath, 'utf-8');
                const buffer = Buffer.from(extractHexString(hexData), 'hex');
                combinedBuffers.push(buffer);
            }
        });
    };

    traverseAndReadChunks(pathway);

    const combinedData = Buffer.concat(combinedBuffers);
    return combinedData;
}

previewFrigid.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }
    else {
        next();
    }
})



previewFrigid.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
})


export const processPreviewRequest = (req, res) => {
    const host = req.hostname;
    const hostPath = decodeURIComponent(req.path);
    const domainWithUnderscore = host.replace(/\./g, '_');
    const filePath = root + '/previews/' + domainWithUnderscore + '/preview'
    if (fs.existsSync(filePath) === true) {
        let splitPaths = hostPath.split('/')
        splitPaths = splitPaths.filter(item => item !== "");

        let fileResponse = null
        if (splitPaths.length == 0) {
            //Page render
            try {
                fileResponse = { data: recombineFile(filePath + '/index.html'), mime: 'text/html' };
            } catch (error) {
                console.log(error)
                fileResponse = null
            }
        }
        else {
            const splitPaths = hostPath.split('/');
            const lastSegment = splitPaths[splitPaths.length - 1];
            const hasExtension = path.extname(lastSegment) !== '';
            console.log(hasExtension)
            if (hasExtension) {
                //Assets
                try {
                    let newHostPath = hostPath
                    // console.log(req.path)
                    // if(req.headers.referer != undefined){
                    //     const refererHeader = req.headers.referer;
                    //     const referer = new URL(refererHeader);
                    //     const path = referer.pathname;
                    //     let pathToRemove = path.split('/')
                    //     pathToRemove.pop()
                    //     newHostPath = hostPath.replace(pathToRemove.join('/'), '')
                    // }
                    const type = mime.getType(newHostPath) || 'application/octet-stream';
                    fileResponse = { data: recombineFile(filePath + '/' + newHostPath), mime: type };
                } catch (error) {
                    console.log(error)
                    fileResponse = null
                }

            }
            else {
                try {
                    fileResponse = { data: recombineFile(filePath + '/' + hostPath + '.html'), mime: 'text/html' };
                } catch (error) {
                    try {
                        fileResponse = { data: recombineFile(filePath + '/index.html'), mime: 'text/html' };
                    } catch (error) {
                        fileResponse = null
                    }
                }

            }
        }
        if (fileResponse != null && fileResponse.data != null) {
            res.setHeader('Content-Type', fileResponse.mime);
            res.send(fileResponse.data);
            return;
        }
        else {
            res.status(404).send('Resource not found')
        }


    }
    else {
        res.status(404).send('Resource not found')
    }
}



previewFrigid.get('*', (req, res) => {
    processPreviewRequest(req, res)
})


export default previewFrigid;
