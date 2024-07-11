import express, { Express, Request, Response } from 'express';
const { createProxyMiddleware } = require('http-proxy-middleware');
import fs from 'fs';
import fsPromise from 'fs/promises';
import { getAppPathway, resolveHtmlPath } from '../../util';
import path from 'path';
import { WebSocketServer } from 'ws';
import { file } from 'jszip';
import fse from 'fs-extra';
import { app, dialog } from 'electron';
import { rimraf } from 'rimraf'
import os from 'os';
import cors from 'cors';
import _ from 'lodash';
import { processPreviewRequest } from './previewFrigid';
import { processWeb3Request } from './web3domains';
import crc32 from 'crc/crc32';

const mime = require('mime');
const decompress = require('decompress');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();


let pathway;
let root;
if (process.env.NODE_ENV === 'development') {
    pathway = __dirname;
    root = app.getAppPath();
} else if (getAppPathway()) {
    pathway = getAppPathway()
    root = getAppPathway() + '/../../'
} else {
    throw new Error('PORTABLE_EXECUTABLE_DIR is not defined in production mode');
}


async function deleteFolderRecursive(directoryPath) {
    if (os.platform() === 'win32') {
        await rimraf.windows(directoryPath)
    }
    else if (os.platform() === 'darwin') {
        await rimraf.rimraf(directoryPath)
    }
}


let allowedOrigins = ['http://dev.frigid', 'https://dev.frigid'];
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




const devFrigid = express();
devFrigid.use(cors(corsOptions));


devFrigid.use((req, res, next) => {
    const host = req.hostname;
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

    next();
});



devFrigid.post('/api/preview', async (req, res) => {
    express.json()(req, res, async () => {
        const { domain } = req.body;

        const domainWithUnderscore = domain.replace(/\./g, '_');
        const domainPath = path.join(root + '/previews/', domainWithUnderscore + '/preview');
        if (fs.existsSync(domainPath) === true) {
            res.json({ status: 'success' });
        }
        else {
            res.json({ status: 'failure' });
        }


        return
    })
})


devFrigid.post('/api/preview/delete', async (req, res) => {
    express.json()(req, res, async () => {
        const { domain } = req.body;

        const domainWithUnderscore = domain.replace(/\./g, '_');
        const domainPath = path.join(root + '/previews/', domainWithUnderscore);

        if (fs.existsSync(domainPath) === true) {
            await deleteFolderRecursive(domainPath);
            res.json({ status: 'success' });
        }
        else {
            res.json({ status: 'failure' });
        }
        return
    })
})

devFrigid.use(async (req, res) => {
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
            fileResponse = { data: fs.readFileSync(pathway + '/renderer/index.html'), mime: 'text/html' };
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
                fileResponse = { data: fs.readFileSync(pathway + '/renderer' + newHostPath), mime: type };

            }
            else {
                fileResponse = { data: fs.readFileSync(pathway + '/renderer/index.html'), mime: 'text/html' };

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




const MAX_CHUNK_SIZE = 50 * 1000; // 100,000 bytes - changed to 50,000 bytes
const FOLDER_OVERHEAD = 150; // Folder name size in bytes

// Helper function to split a file into chunks
function chunkFile(filePath, currentFolderPath) {
    return new Promise(async (resolve, reject) => {
        try {
            let newDirectory = path.join(currentFolderPath, path.basename(filePath.toLowerCase()));
            fse.emptyDirSync(newDirectory);
            const fileStream = fse.createReadStream(filePath, { highWaterMark: MAX_CHUNK_SIZE });
            let chunkIndex = 0;

            fileStream.on('data', async (chunk) => {
                fileStream.pause(); // Pause reading until we've processed this chunk


                if (chunkIndex >= (Math.floor((MAX_CHUNK_SIZE / 1) / FOLDER_OVERHEAD) - 1)) {
                    fse.emptyDirSync(newDirectory + '/' + chunkIndex);
                    newDirectory = newDirectory + '/' + chunkIndex;
                    chunkIndex = 0;
                }
                let chunkDirectoryIndex = path.join(newDirectory, chunkIndex.toString());
                fse.emptyDirSync(chunkDirectoryIndex);
                const chunkFileName = `chunk.txt`;
                const chunkFilePath = path.join(chunkDirectoryIndex, chunkFileName);

                fse.writeFileSync(chunkFilePath, '7b' + chunk.toString('hex') + '7d');
                chunkIndex++;
                fileStream.resume();

            });

            fileStream.on('end', async () => {
                console.log('File has been split into chunks successfully.');
            });

            fileStream.on('error', async (err) => {
                console.error('An error occurred while reading the file:', err);
            });

            fileStream.on('close', async () => {
                console.log('Stream closed');
                if(!fse.existsSync(newDirectory + '/0')){
                    await rimraf(newDirectory)
                };
                resolve()
            });

        } catch (error) {
            console.error('An error occurred while splitting the file:', error);
            reject(error);
        }
    });
}

// Recursive function to process a directory
async function processDirectory(sourceDir, destDir) {
    try {
        const items = fse.readdirSync(sourceDir);
        let currentFolderPath = path.join(destDir);

        for (let item of items) {
            const itemPath = path.join(sourceDir, item);
            const stats = fse.statSync(itemPath);
            if (stats.isFile()) {
                await chunkFile(itemPath, currentFolderPath);
            } else if (stats.isDirectory()) {
                const folderName = path.basename(itemPath.toLowerCase());
                if (!folderName.startsWith('.')) {
                    const newSourceDir = itemPath;
                    const newDestDir = path.join(currentFolderPath, item);
                    fse.emptyDirSync(newDestDir);
                    await processDirectory(newSourceDir, newDestDir);
                }
            }
        }
    } catch (error) {
        console.error('An error occurred while processing the directory:', error);
    }
}

async function startProcessing(sourceDir, destDir) {
    try {
        fse.emptyDirSync(destDir);
        await processDirectory(sourceDir, destDir);
    } catch (error) {
        console.error('An error occurred while processing the directory:', error);
    }
}

const moveContentsUp = async (dir) => {
    try {
        const files = await fs.promises.readdir(dir);

        if (files.length === 1) {
            const singleItemPath = path.join(dir, files[0]);
            const stats = await fs.promises.stat(singleItemPath);

            if (stats.isDirectory()) {
                const innerFiles = await fs.promises.readdir(singleItemPath);
                for (const file of innerFiles) {
                    const srcPath = path.join(singleItemPath, file);
                    const destPath = path.join(dir, file);
                    await fs.promises.rename(srcPath, destPath);
                }
                await fs.promises.rmdir(singleItemPath);
            }
        }
    } catch (error) {
        console.error('Error moving contents up:', error);

    }

};


// Function to recursively map directory structure
function mapDirectory(directoryPath, sizeTracker) {
    const result = {};

    const items = fs.readdirSync(directoryPath);
    items.forEach(item => {
        const fullPath = path.join(directoryPath, item);
        if (item.includes('.')) {
            let fileMime = mime.getType(item);
            if (fileMime == null) {
                result[item] = mapDirectory(fullPath, sizeTracker);
            } else {
                result[item] = null;
                sizeTracker.size += 128; // Assuming each file entry represents 128 bytes
            }
        } else {
            result[item] = mapDirectory(fullPath, sizeTracker);
        }
    });
    return result;
}

// Function to split JSON into chunks of specified size
function splitJSON(obj, maxBytes) {
    const chunks = [];
    let currentChunk = {};
    let currentSize = 128 + 13;

    function traverseAndAddEntries(subObj, currentPath, chunk) {
        for (const key in subObj) {
            const entryValue = subObj[key];
            const entrySize = entryValue === null ? 128 : Buffer.byteLength(JSON.stringify({ [key]: entryValue }), 'utf8');

            if (currentSize + entrySize > maxBytes) {
                chunks.push(JSON.parse(JSON.stringify(currentChunk)));
                currentChunk = JSON.parse(JSON.stringify(getPathwayChunk(currentPath.concat(key))));
                currentSize = getChunkSize(currentChunk);
            }

            if (entryValue === null) {

                setEntry(currentChunk, currentPath.concat(key), null);
                currentSize += 128;
            } else if (typeof entryValue === 'object' && entryValue !== null) {

                setEntry(currentChunk, currentPath.concat(key), {});
                currentSize += Buffer.byteLength(JSON.stringify({ [key]: {} }), 'utf8');
                traverseAndAddEntries(entryValue, currentPath.concat(key), currentChunk);
            } else {

                setEntry(currentChunk, currentPath.concat(key), entryValue);
                currentSize += entrySize;
            }
        }
    }

    function setEntry(obj, pathArray, value) {
        let temp = obj;
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!temp[pathArray[i]]) temp[pathArray[i]] = {};
            temp = temp[pathArray[i]];
        }
        temp[pathArray[pathArray.length - 1]] = value;
    }

    function getPathwayChunk(pathArray) {
        const chunk = {};
        setEntry(chunk, pathArray, {});
        return chunk;
    }

    function getChunkSize(chunk) {
        return Buffer.byteLength(JSON.stringify(chunk), 'utf8');
    }

    traverseAndAddEntries(obj, [], currentChunk);

    if (Object.keys(currentChunk).length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

const prepareMapping = (startDir) => {
    const sizeTracker = { size: 0 };
    const directoryMapping = mapDirectory(startDir + '/preview', sizeTracker);
    const maxBytes = MAX_CHUNK_SIZE; 
    const jsonChunks = splitJSON(directoryMapping, maxBytes);

    fs.mkdirSync(startDir + '/seedChunks', { recursive: true });
    const seedChunksDir = startDir + '/seedChunks';

    for (let i = 0; i < jsonChunks.length; i++) {
        if (jsonChunks.length - 1 === i) {

            fs.writeFileSync(seedChunksDir + `/${i + 1}.json`, JSON.stringify({ f: jsonChunks[i] }));
        }
        else {
            fs.writeFileSync(seedChunksDir + `/${i + 1}.json`, JSON.stringify({ f: jsonChunks[i], c: null }));
        }
    }

}



function mapDirectoryForMapping(directoryPath, sizeTracker) {
    const result = {};

    const items = fs.readdirSync(directoryPath);
    items.forEach(item => {
        const fullPath = path.join(directoryPath, item);
        if (!isNaN(parseInt(item))) {
            if (fs.existsSync(fullPath + '/chunk.txt')) {
                result[item] = null
            }
            else {
                result[item] = mapDirectoryForMapping(fullPath, sizeTracker);
            }
        }
    });
    return result;
}

function splitJSONForMapping(obj) {
    const chunks = [];
    let currentChunk = [];

    function traverseAndAddEntries(subObj, currentPath, chunk) {
        for (const key in subObj) {
            const entryValue = subObj[key];

            if (entryValue === null) {

                chunk.push(null)
            } else if (typeof entryValue === 'object' && entryValue !== null) {

                chunk.push(null)
                traverseAndAddEntries(entryValue, currentPath.concat(key), []);
            } else {
                chunk.push(null)
            }
        }
        chunks.push(chunk);
    }

    traverseAndAddEntries(obj, [], currentChunk);

    return chunks.reverse();
}

const prepareMappingForFiles = (fullPathPreview, fullPathMapping) => {
    const sizeTracker = { size: 0 };
    const directoryMapping = mapDirectoryForMapping(fullPathPreview, sizeTracker);
    const maxBytes = MAX_CHUNK_SIZE; 
    let jsonChunks = splitJSONForMapping(directoryMapping, maxBytes);

    const seedChunksDir = fullPathMapping
    for (let i = 0; i < jsonChunks.length; i++) {
        if (jsonChunks.length - 1 === i) {

            fs.writeFileSync(seedChunksDir + `/${i}.json`, JSON.stringify({ f: jsonChunks[i] }));
        }
        else {
            let lastItem = jsonChunks[i].pop()
            fs.writeFileSync(seedChunksDir + `/${i}.json`, JSON.stringify({ f: jsonChunks[i], c: null }));
        }
    }

}

const initializeMappingForFiles = (pathway) => {

    const directoryPath = pathway + '/preview';
    const directoryMappingPath = pathway + '/mappings';
    fs.mkdirSync(directoryMappingPath, { recursive: true });

    const recursiveMappingForFileDirectory = (previewPath, mappingPath) => {
        const items = fs.readdirSync(previewPath);
        items.forEach(item => {
            const fullPathPreview = path.join(previewPath, item);
            const fullPathMapping = path.join(mappingPath, item);

            if (item.includes('.')) {
                let fileMime = mime.getType(item);
                if (fileMime == null) {
                    fs.mkdirSync(fullPathMapping, { recursive: true });
                    recursiveMappingForFileDirectory(fullPathPreview, fullPathMapping);
                } else {
                    fs.mkdirSync(fullPathMapping, { recursive: true });
                    prepareMappingForFiles(fullPathPreview, fullPathMapping);
                }
            } else {
                fs.mkdirSync(fullPathMapping, { recursive: true });
                recursiveMappingForFileDirectory(fullPathPreview, fullPathMapping);
            }
        });
        return null;
    }

    recursiveMappingForFileDirectory(directoryPath, directoryMappingPath);

}




const devFrigidWebsocket = new WebSocketServer({ noServer: true });


const publish = async (ws, data) => {

    const { domain, productionDomain } = data;
    let count = 0
    let alreadyUploaded = 0

    async function countTotalFiles(mappingDirectory) {
        const files = fs.readdirSync(mappingDirectory);

        for (let fileName of files) {
            const stat = fs.statSync(path.join(mappingDirectory, fileName));
            if (stat.isDirectory()) {
                countTotalFiles(path.join(mappingDirectory, fileName));
            } else if (fileName.endsWith('.json')) {

                const fileContent = fs.readFileSync(path.join(mappingDirectory, fileName), 'utf8');
                const jsonData = JSON.parse(fileContent);
                jsonData['f'].forEach((item) => {
                    if (item === null || item === '0x') {
                        count++;
                    }
                    else {
                        alreadyUploaded++
                        count++;

                    }
                })
                if (jsonData['c'] !== undefined) {
                    if (jsonData['c'] === null || jsonData['c'] === '0x') {
                        count++;
                    }
                    else {
                        alreadyUploaded++;
                        count++;

                    }
                }
            }
        }
    }

    const checkIfFileIsDifferent = async (filePath) => {
        let joinPath = filePath.join('/')
        let error = null
        

        let previewResponseData = null;
        const responsePreview = {
            setHeader: (header, value) => {},
            send: (data) => { previewResponseData = crc32(data).toString(16);  },
            status: (statusCode) => {
                return { send: (data) => { error = true; } };
            }
        };
        processPreviewRequest({ hostname: domain, path: `/${joinPath}` }, responsePreview);

        if(error){
            return {shouldOverwrite:false, hash:null}
        }

        let productionResponseData = null;
        let prodHash = null
        const responseProduction = {
            setHeader: (header, value) => {
                if(header == 'Hash'){
                    prodHash = value
                }
            },
            send: (data) => { productionResponseData = crc32(data).toString(16);  },
            status: (statusCode) => {
                return { send: (data) => { error = true } };
            }
        };
        // console.log(productionDomain)
        await processWeb3Request({ hostname: productionDomain, headers:{bypassCache:true}, path: `/${joinPath}` }, responseProduction);
        
        if(error){
            return {shouldOverwrite:false, hash:null}
        }

        return {shouldOverwrite: previewResponseData == productionResponseData, hash:prodHash}
    }


    async function traverseDirectory(mappingDirectory, previewDirectory, filePath=[]) {
        let files = fs.readdirSync(mappingDirectory);
        files = files.sort((a, b) => parseInt(b) - parseInt(a))
        let fileCheck = files[files.length - 1] 
        const fileCheckStat = fs.statSync(path.join(mappingDirectory, fileCheck));
        let shouldOverwrite = false
        if (!fileCheckStat.isDirectory()) {
            if(fileCheck == '0.json'){
                let checkFileData = await checkIfFileIsDifferent(filePath)
                shouldOverwrite = checkFileData.shouldOverwrite
                let prodHash = checkFileData.hash
                if(shouldOverwrite){
                    let seedPath = domainPath + '/seedChunks'
                    let seedFiles = fs.readdirSync(seedPath)
                    for (let seedFile of seedFiles) {
                        let  fileData =fs.readFileSync(path.join(seedPath, seedFile), 'utf8')
                        let jsonData = JSON.parse(fileData);
                        let fileHashLocation = _.get(jsonData.f, filePath, undefined)
                        if( fileHashLocation !== undefined ){
                            
                            if(fileHashLocation != prodHash){
                                _.set(jsonData.f, filePath, prodHash)
                                fs.writeFileSync(path.join(seedPath, seedFile), JSON.stringify(jsonData))
                                ws.send(JSON.stringify({ message: 1, type: 'progress' }));
                            }
                        }
                    }
                }
            }
        }
        for (let fileName of files) {
            const stat = fs.statSync(path.join(mappingDirectory, fileName));
            if (stat.isDirectory()) {
                
                await traverseDirectory(path.join(mappingDirectory, fileName), path.join(previewDirectory, fileName), [...filePath, fileName]);
            } else if (fileName.endsWith('.json')) {
                await processJSONFile(path.join(mappingDirectory, fileName), path.join(previewDirectory), fileName, shouldOverwrite);
            }
        }
    }




    // Function to process each JSON file
    async function processJSONFile(filePathDirectory, previewDirectory, fileName, shouldOverwrite) {
        function getMaxNumberedFolder(directory) {
            let dirs = fs.readdirSync(directory, { withFileTypes: true }).map((item) => item.name).sort((a, b) => parseInt(b) - parseInt(a));
            return dirs[0];
        }

        let data = fs.readFileSync(filePathDirectory, 'utf8')
        let jsonData = JSON.parse(data);

        let navigateLayer = parseInt(fileName) // example 0 means root, 1 means first layer - Layer folders are the highest number in directory
        let currentDirectory = previewDirectory;
        for (let layer = 0; layer < navigateLayer; layer++) {
            let maxFolder = getMaxNumberedFolder(currentDirectory);
            if (maxFolder) {
                currentDirectory = path.join(currentDirectory, maxFolder);
            } else {
                break;
            }
        }

        for (let i = 0; i < jsonData.f.length; i++) {
            let hash = jsonData.f[i];
           

                if(shouldOverwrite){
                    if(hash !== '0x'){
                        jsonData.f[i] = '0x';
                        fs.writeFileSync(filePathDirectory, JSON.stringify(jsonData))
                    }
                    ws.send(JSON.stringify({ message: 1, type: 'progress' }));
                }
                else{
                    if (hash === null || hash === '0x') {
                        const data = fs.readFileSync(`${currentDirectory}/${i}/chunk.txt`, 'utf8')
                        ws.send(JSON.stringify({ message: data, type: 'publishData' }));
                        await new Promise((resolve) => {
                            eventEmitter.removeAllListeners('transactionHashReceived'); 
        
                            eventEmitter.once('transactionHashReceived', (data) => {
                                if (domain === data.domain) {
                                    jsonData.f[i] = data.transactionHash;
                                    fs.writeFileSync(filePathDirectory, JSON.stringify(jsonData))
                                    ws.send(JSON.stringify({ message: 1, type: 'progress' }));
        
                                    resolve();
                                }
                            });
                        });
                    }
                }

              
            
        }

        // This is the last chunk and we check if it's null. If it is, we process the .json chunk after it 0->1. Remember, the files are parsed backwards 5->4->3->2->1->0
        if (jsonData.c !== undefined) {
            if (jsonData.c === null) {
                let fileNumber = parseInt(fileName) + 1;
                const data = fs.readFileSync(`${filePathDirectory}/../${fileNumber}.json`, 'utf8')
                const hex = '7b' + (new Buffer.from(data)).toString('hex') + '7d'
                ws.send(JSON.stringify({ message: hex, type: 'publishData' }));
                await new Promise((resolve) => {
                    eventEmitter.removeAllListeners('transactionHashReceived'); 

                    eventEmitter.once('transactionHashReceived', (data) => {
                        if (domain === data.domain) {
                            jsonData.c = data.transactionHash;
                            fs.writeFileSync(filePathDirectory, JSON.stringify(jsonData))
                            ws.send(JSON.stringify({ message: 1, type: 'progress' }));

                            resolve();
                        }
                    });
                });

            }
        }
    }



    const domainWithUnderscore = domain.replace(/\./g, '_');

    const domainPath = path.join(root + '/previews/', domainWithUnderscore);

    await countTotalFiles(domainPath + '/mappings')
    fs.readdirSync(domainPath + '/seedChunks').forEach((fileName) => {
        const jsonData = JSON.parse(fs.readFileSync(path.join(domainPath + '/seedChunks', fileName), 'utf8'));
        if (jsonData.c !== undefined) {
            if (jsonData.c === null && jsonData.c === '0x') {
                count++;
            }
            else {
                alreadyUploaded++;
                count++;

            }
        }
        function traverseAndCheck(data) {
            // Check if data is an object
            if (typeof data === 'object' && data !== null) {
                for (let key in data) {
                    traverseAndCheck(data[key]);
                }
            } else {
                // Check if the value is null or a string
                if (data === null || data === '0x') {
                    count++;
                } else if (typeof data === 'string') {
                    alreadyUploaded++;
                    count++;
                }
            }
        }
        traverseAndCheck(jsonData.f);


    })



    const traverseSeedChunks = async (mappingDirectory, seedChunksDirectory) => {
        let files = fs.readdirSync(seedChunksDirectory);
        files = files.sort((a, b) => parseInt(b) - parseInt(a))

        for (let fileName of files) {
            let fileData = fs.readFileSync(path.join(seedChunksDirectory, fileName), 'utf8');
            let jsonData = JSON.parse(fileData);
            async function traverseAndCheck(data, pathway) {
                // Check if data is an object
                if (typeof data === 'object' && data !== null) {
                    for (let key in data) {
                        await traverseAndCheck(data[key], [...pathway, key]);
                    }
                } else {
                    if (data === null) {
                        let mappingData = fs.readFileSync(path.join(mappingDirectory, ...pathway, '0.json'), 'utf8');
                        const hex = '7b' + (new Buffer.from(mappingData)).toString('hex') + '7d'

                        ws.send(JSON.stringify({ message: hex, type: 'publishData' }));
                        await new Promise((resolve) => {
                            eventEmitter.removeAllListeners('transactionHashReceived'); 

                            eventEmitter.once('transactionHashReceived', (data) => {
                                if (domain == data.domain) {
                                    _.set(jsonData, ['f', ...pathway], data.transactionHash);
                                    fs.writeFileSync(path.join(seedChunksDirectory, fileName), JSON.stringify(jsonData), 'utf8');
                                    ws.send(JSON.stringify({ message: 1, type: 'progress' }));

                                    resolve()
                                }
                            })
                        })

                    }
                }
            }
            await traverseAndCheck(jsonData.f, []);

            if (jsonData.c !== undefined) {
                if (jsonData.c === null) {
                    let fileNumber = parseInt(fileName) + 1
                    let seedData = fs.readFileSync(path.join(seedChunksDirectory, `${fileNumber}.json`), 'utf8');
                    const hex = '7b' + (new Buffer.from(seedData)).toString('hex') + '7d'
                    ws.send(JSON.stringify({ message: hex, type: 'publishData' }));
                    await new Promise((resolve) => {
                        eventEmitter.removeAllListeners('transactionHashReceived'); 

                        eventEmitter.once('transactionHashReceived', (data) => {
                            if (domain == data.domain) {
                                jsonData.c = data.transactionHash;
                                fs.writeFileSync(path.join(seedChunksDirectory, fileName), JSON.stringify(jsonData), 'utf8');
                                ws.send(JSON.stringify({ message: 1, type: 'progress' }));

                                resolve()
                            }
                        })
                    })
                }
            }

        }

    }

    // Start traversing from the root directory of your mappings


    ws.send(JSON.stringify({ message: count + 2, alreadyUploaded, type: 'totalFiles' }));

    if (alreadyUploaded < count) {
        await traverseDirectory(domainPath + '/mappings', domainPath + '/preview',);
        await traverseSeedChunks(domainPath + '/mappings', domainPath + '/seedChunks');
    }

    let seedPath = domainPath + '/seedChunks'
    let fileData = fs.readFileSync(path.join(seedPath, '1.json'), 'utf8');
    const hex = '7b' + (new Buffer.from(fileData)).toString('hex') + '7d'

    ws.send(JSON.stringify({ message: hex, type: 'publishData' }));
    await new Promise((resolve) => {
        eventEmitter.removeAllListeners('transactionHashReceived'); 
        eventEmitter.once('transactionHashReceived', (data) => {
            if (domain == data.domain) {
                ws.send(JSON.stringify({ message: 1, type: 'progress' }));
                ws.send(JSON.stringify({ message: data.transactionHash, type: 'finalUpload' }));
                resolve()
            }
        })
    })

    
    await new Promise((resolve) => {
        eventEmitter.removeAllListeners('transactionHashReceived'); 
        eventEmitter.once('transactionHashReceived', (data) => {
            if (domain == data.domain) {
                ws.send(JSON.stringify({ message: 1, type: 'progress' }));
                resolve()
            }
        })
    })

    ws.send(JSON.stringify({ message: 'All files are uploaded.', type: 'end' }));
}


const publishUpdate = async (ws, data) => {
    eventEmitter.emit('transactionHashReceived', data);
}

const upload = async (ws, data) => {
    const { domain, chunk, index, total } = data;
    const chunkBuffer = Buffer.from(chunk);
    if (fs.existsSync(root + '/previews/') === false) {
        fs.mkdirSync(root + '/previews/', { recursive: true });
    }



    const domainWithUnderscore = domain.replace(/\./g, '_');
    const domainPath = path.join(root + '/previews/', domainWithUnderscore);
    try {


        const zipFilePath = path.join(domainPath, `tmp.zip`);

        if (index === 0) {
            if (fs.existsSync(domainPath) === true) {
                await deleteFolderRecursive(domainPath)
            }
            await fs.promises.mkdir(domainPath, { recursive: true });
        }

        fs.appendFileSync(zipFilePath, chunkBuffer);

        if (index + 1 === total) {

            await decompress(zipFilePath, domainPath + '/stage1')

            fs.unlinkSync(zipFilePath);

            await moveContentsUp(domainPath + '/stage1');


            await startProcessing(domainPath + '/stage1', domainPath + '/preview')
            deleteFolderRecursive(domainPath + '/stage1');
            initializeMappingForFiles(domainPath)




            prepareMapping(domainPath);
            ws.send(JSON.stringify({ message: 'Preview structure updated.', type: 'end' }));
        } else {
            ws.send(JSON.stringify({ message: `Chunk ${index + 1} received.`, type: 'chunk_received' }));
        }
    } catch (error) {
        console.log(error);
        await deleteFolderRecursive(domainPath)
        ws.send(JSON.stringify({ error: error.message }));
    }

}

devFrigidWebsocket.on('connection', (ws, req) => {
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'publish':
                    publish(ws, data);
                    break;
                case 'upload':
                    upload(ws, data);
                    break;
                case 'publishUpdate':
                    publishUpdate(ws, data);
                    break;
                case 'ping':
                    ws.send(JSON.stringify({ message: 'pong' }));
                    break;
                default:

                    throw new Error('Invalid message type');
                    break;
            }


        } catch (error) {
            console.log(error)
            ws.send(JSON.stringify({ error: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Connection closed');
    });
});



export const devFrigidWebsocketUpgrade = (req, socket, head) => {
    console.log('Websocket upgrade request received');
    devFrigidWebsocket.handleUpgrade(req, socket, head, (ws) => {
        devFrigidWebsocket.emit('connection', ws, req);
    })
}


export default devFrigid;
