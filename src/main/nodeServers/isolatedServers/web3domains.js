import express, { Express, Request, Response } from 'express';
import {ethers, Contract} from 'ethers';
import { store } from '../../main';
import { dnsAbi } from '../../../renderer/helpers/abi';
import _ from 'lodash'
import path from 'path';
import {parseBuffer} from 'music-metadata';
import MediaInfo from 'mediainfo.js'
import Cache from "file-system-cache";
import { app } from 'electron';
const fs = require('fs');
const mime = require('mime');
const web3Domains = express();

const websiteCachePath =  path.resolve(app.getPath('cache'), 'FrigidCache')
if(!fs.existsSync(websiteCachePath)){
    fs.mkdirSync(websiteCachePath)
}
let assetCache = {}
const websiteDataCache = Cache({
    basePath: websiteCachePath,
    ttl: 31 * 24 * 60 * 60 * 1000
})

function extractHexString(hexString) {
    // Find the first occurrence of '7B' and '7D'

    try {
        let start = hexString.indexOf('7b');
        if(start == -1){
          start =  hexString.indexOf('7B');
        }
        let end = hexString.lastIndexOf('7d');
        if(end == -1){
            end =  hexString.lastIndexOf('7D');
        }
        if (start === -1 || end === -1) {
            throw new Error('Hex string does not contain required start or end markers.');
        }
    
        return hexString.slice(start + 2, end);
    } catch (error) {
        return null
    }
}


web3Domains.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }
    else {
        next(); 
    }
})



web3Domains.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('Surrogate-Control', 'no-store'); 
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); 
    res.setHeader('Pragma', 'no-cache'); 
    res.setHeader('Expires', '0');
    next();
})

const hexToUtf8 = (hex) => {
    return Buffer.from(hex, 'hex').toString('utf8');
};

let cache = {

}

function traverseAndBuild(structure, build) {
    for (const key in structure) {
        if (typeof structure[key] === 'object') {
            // It's a directory. Check if the key exists and is an object before creating a new one
            if (!build[key] || typeof build[key] !== 'object') {
                build[key] = {};
            }
            traverseAndBuild(structure[key], build[key]);
        } else {
            // It's a file, add it to build
            build[key] = structure[key];
        }
    }
}


const recombineFile = async (provider, hash, extraOptions = {}) => {
    if(hash == null){
        console.log("Hash is null")
        return null
    }
    const starterMap = await provider.getTransactionReceipt(hash)
    const hexString = extractHexString(starterMap.logs[2].data)
    if(hexString == null){
        return null
    }
    let jsonData = JSON.parse(hexToUtf8(hexString))

    let chunks = []
    let tmpChunks = []
    let limiter = 5
    let countedChunks = jsonData.f.length
    let startingIndex = 0
    if(extraOptions?.startChunk != null && extraOptions?.totalNeededChunks != null){
        while(true){
            if(extraOptions.startChunk > countedChunks - 1){
                const nextMap = await provider.getTransactionReceipt(jsonData.c)
                const nextHexString = extractHexString(nextMap.logs[2].data)
                if(nextHexString == null){
                    return null
                }
                jsonData = JSON.parse(hexToUtf8(nextHexString))
                countedChunks = countedChunks + jsonData.f.length
            }
            else{
                if(extraOptions.startChunk > countedChunks - 1){
                    startingIndex = extraOptions.startChunk - countedChunks

                }
                else{
                    startingIndex = extraOptions.startChunk
                }
                


                break
            }
        }     
    }



    const getData = async () => {
        return new Promise(async (bigResolve) => {
            let promises = []
            let promiseCount = 0
            for(let i=startingIndex; i<jsonData.f.length; i++){
                if(limiter != null && promiseCount > limiter){
                    await Promise.allSettled(promises)
                    promiseCount = 0
                }
                if(extraOptions?.totalNeededChunks != null && extraOptions?.startChunk != null){
                    if(tmpChunks.length + chunks.length >= extraOptions.totalNeededChunks){
                        break
                    }
                }
              
                tmpChunks.push(null)
                let tmpChunkIndex = tmpChunks.length - 1
                let transactionHash = jsonData.f[i]
                promises.push(new Promise(async (resolve, reject) => {
                    try {
                        // console.log(chunkHash)
                        let transactionData = await provider.getTransactionReceipt(transactionHash)
                        const newHexString = extractHexString(transactionData.logs[2].data)
                        if(newHexString == null){
                            return null
                        }
                        transactionData = Buffer.from(newHexString, 'hex');  
                        tmpChunks[tmpChunkIndex] = transactionData
                        resolve()
                    } catch (error) {
                        promises = []
                        bigResolve(false)
                    }
                   
                }))
                promiseCount = promiseCount + 1
            }
            await Promise.allSettled(promises)
            bigResolve(true); // Call this after completing all processing.

        })
    }
    while(true){
        const result = await getData()
        if(result == true){
            if(jsonData?.c != undefined){
                const nextMap = await provider.getTransactionReceipt(jsonData.c)
                const nextHexString = extractHexString(nextMap.logs[2].data)
                if(nextHexString == null){
                    return null
                }
                jsonData = JSON.parse(hexToUtf8(nextHexString))
                chunks = chunks.concat(tmpChunks)
                startingIndex = 0
                tmpChunks = []
            }
            else{
                chunks = chunks.concat(tmpChunks)
                tmpChunks = []
                startingIndex = 0
                return Buffer.concat(chunks)
            }
        }
        else{
            tmpChunks = []
            if(limiter === null){
                limiter = 5
            }
            else{
                await new Promise((resolve) => { setTimeout(resolve, 3000) })
                limiter = limiter - 1
                if(limiter === 0){
                    console.log("Failed to get all chunks")
                    return null
                }
            }
        }

    }
}

async function getMediaSize(buffer) {
    function calculateTotalSize(metadata) {
        const tracks = metadata.media.track;
        let totalSize = 0;
        let longestDuration = 0;
      
        for (const track of tracks) {
         
          if (track.Duration && track.BitRate) {
            const durationInSeconds = parseFloat(track.Duration); 
            const bitrateInBitsPerSecond = parseInt(track.BitRate, 10); 
      
            if (durationInSeconds > longestDuration) {
              longestDuration = durationInSeconds;
            }
      
            const trackSize = (durationInSeconds * bitrateInBitsPerSecond) / 8;
            totalSize += trackSize;
          }
        }
      
        const sizePerSecond = longestDuration > 0 ? totalSize / longestDuration : 0;
      
        return { totalSize: Math.floor(totalSize), sizePerSecond: Math.floor(sizePerSecond) };
      }
    const mediaInfo = await MediaInfo();
    const metadata = await mediaInfo.analyzeData(() => buffer.length, (size) => buffer);
    return calculateTotalSize(metadata);
  }

const getStarterNode = async (provider, appInfo, chain, domain, bypassCache) => {

    const handleCache = async () => {
        let buildFile = {}
        const dnsAddress = appInfo['supportedNetworks'][chain].dns
        const dnsContract = new Contract(dnsAddress, dnsAbi, provider)
        const data = await dnsContract.domains(domain)
        let starterJson = null
        try {
            starterJson  = JSON.parse(data.metadata)
        } catch (error) {
            return null
        }
      
        if(starterJson.originHash == undefined){
            return null
        }
        let hash = starterJson.originHash
        while(hash != '0x'){
     
            const fileData = await provider.getTransactionReceipt(hash)
            const starterHex = extractHexString(fileData.logs[2].data)
            if(starterHex == null){
                return null
            }
            let jsonData = JSON.parse(hexToUtf8(starterHex))
            traverseAndBuild(jsonData.f, buildFile )
            if(jsonData?.c != undefined){
                hash = jsonData.c
            }
            else{
                hash = '0x'
            }
        }
        
        cache[domain] = {hash: starterJson.originHash, build:buildFile}
        return buildFile
    }

    if(cache[domain] == undefined || bypassCache == true){
        
        return await handleCache()
    }
    else{
        const dnsAddress = appInfo['supportedNetworks'][chain].dns
        const dnsContract = new Contract(dnsAddress, dnsAbi, provider)
        const data = await dnsContract.domains(domain)
        let starterJson = null
        let hash = null
        try {
            starterJson  = JSON.parse(data.metadata)
            hash = starterJson.originHash
        } catch (error) {
            hash = null
        }

        if(hash == null || hash != cache[domain].hash){
            return await handleCache()
        }

        return cache[domain].build
    }
}



export const processWeb3Request = async (req, res) => {
    const rpcs = await store.get('rpc')
    const appInfo = await store.get('chainAppInfo')
    let domains = appInfo.domains
    const host = req.hostname;
    const domainSuffix = host.split('.').pop() || '';
    let chain = domains[domainSuffix]
    let network = rpcs[chain]
    if(network == null){
        res.status(404).send('Resource not found')
        return
    }
    const cache = req?.headers?.bypassCache || false
    
    const provider = new ethers.JsonRpcProvider(network)

    const origin_file = await getStarterNode(provider, appInfo, chain, host, cache)
    if(origin_file == null){
        res.status(404).send('Resource not found')
        return
    }





    const hostPath = decodeURIComponent(req.path.toLowerCase());
    // Example path: /path/to/file
        let splitPaths = hostPath.split('/')
        splitPaths = splitPaths.filter(item => item !== "");
        let fileResponse = null
        let hash = null
        if (splitPaths.length == 0) {
            //Page render
            try {
                hash = _.get(origin_file, ['index.html'], null)
                let cacheData = websiteDataCache.getSync(host + hostPath)
                if(cacheData != null){
                   if(cacheData.hash == hash){
                       res.setHeader('Content-Type', cacheData.data.mime);
                       res.send(Buffer.from(cacheData.data.data.data));
                
                       return
                   }

                }
                fileResponse = { data: await recombineFile(provider, hash) , mime: 'text/html' };
            } catch (error) {
                console.log(error)
                fileResponse = null
            }
        }
        else {
            const splitPathsCheck = hostPath.split('/');
            const lastSegment = splitPathsCheck[splitPathsCheck.length - 1];
            const hasExtension = path.extname(lastSegment) !== '';
            if (hasExtension) {
                try {
                    const rangeHeader = req.headers?.range;
                    if(rangeHeader != null){
                        //Streaming back audio or video
                        hash = _.get(origin_file, splitPaths, null)
                              
                        const range = rangeHeader.replace(/bytes=/, "").split("-");
                        const start = parseInt(range[0], 10);
                        let cacheData = websiteDataCache.getSync(host + hostPath)
                        if(cacheData != null){
                           if(cacheData.hash == hash){
                                const buffer = Buffer.from(cacheData.data.data.data); // Convert to Buffer
                                const end = buffer.length - 1
                        
                                res.setHeader('Content-Type', cacheData.data.mime);
                                res.setHeader("Accept-Ranges", "bytes");
                                res.setHeader("Content-Range", `bytes ${start}-${end}/${buffer.length}`);
                                res.statusCode = 206; // Partial Content
                                
                                res.send(buffer.subarray(start, end + 1));
                               return
                           }
                        }  
                        if(assetCache[hash] == null){
                            let initalAsset = await recombineFile(provider, hash, {startChunk: 0, totalNeededChunks: 1})
                            const size = await getMediaSize(initalAsset, {mimeType: mime.getType(hostPath)})
                            assetCache[hash] = {totalSize: size.totalSize, sizePerSecond: size.sizePerSecond, assetSize: initalAsset.length}
                            
                        }


                        // let totalNeededChunks = Math.floor((assetCache[hash].assetSize * 4) * (2/3)) > assetCache[hash].sizePerSecond  ? 4 : null
                        let totalNeededChunks = null
                        let startChunk = Math.floor(start / assetCache[hash].assetSize)


                        const type = mime.getType(hostPath) || 'application/octet-stream';
                        fileResponse = { data: await recombineFile(provider, hash, {startChunk, totalNeededChunks}), mime: type };
                        if(fileResponse != null && fileResponse.data != null){
                            if((fileResponse.data.length + start - 1) > assetCache[hash].totalSize){
                                assetCache[hash].totalSize = fileResponse.data.length + start 
                            }
                            if(totalNeededChunks == null){
                                assetCache[hash].totalSize = fileResponse.data.length
                            }
                            res.setHeader("Content-Range", `bytes ${start}-${fileResponse.data.length + start - 1}/${assetCache[hash].totalSize}`);
                            res.setHeader("Accept-Ranges", "bytes");
                            res.statusCode = 206; // Partial Content
                            if(startChunk != 0){
                                res.websiteCacheIgnore = true
                            }
                        }
                    }
                    else{
                        //Returning static files

                        const type = mime.getType(hostPath) || 'application/octet-stream';
                        hash = _.get(origin_file, splitPaths, null)
                        let cacheData = websiteDataCache.getSync(host + hostPath)
                        if(cacheData != null){
                           if(cacheData.hash == hash){
                               res.setHeader('Content-Type', cacheData.data.mime);
                               res.send(Buffer.from(cacheData.data.data.data));
                               return
                           }
                        } 
                        fileResponse = { data: await recombineFile(provider, hash), mime: type };
                    }




                    
                } catch (error) {
                    console.log(error)
                    fileResponse = null 
                }
                
            }
            else {
                try {
                    let splitPathsCopy = [...splitPaths]
                    splitPathsCopy[splitPathsCopy.length - 1] = splitPathsCopy[splitPathsCopy.length - 1] + '.html'
                    hash = _.get(origin_file, splitPathsCopy, null)
                    let cacheData = websiteDataCache.getSync(host + hostPath)
                    if(cacheData != null){
                       if(cacheData.hash == hash){
                           res.setHeader('Content-Type', cacheData.data.mime);
                           res.send(Buffer.from(cacheData.data.data.data));
                           return
                       }
                    } 
                    fileResponse = { data: await recombineFile(provider, hash), mime: 'text/html' };
                    if(fileResponse.data == null){
                      throw "Do one last check"
                    }
                } catch (error) {
                    try {
                        hash =  _.get(origin_file, ['index.html'], null)
                        fileResponse = { data: await recombineFile(provider,hash), mime: 'text/html' };
                    } catch (error) {
                        console.log(error)
                        fileResponse = null
                    }
                }
               
            }
        }
        if (fileResponse != null && fileResponse.data != null) {
           
            res.setHeader('Content-Type', fileResponse.mime);
            if(res.websiteCacheIgnore != true){
                websiteDataCache.setSync(host + hostPath, {hash:hash, data: fileResponse})
            }
            if(cache == true){
                res.setHeader('Hash', hash)
            }
            res.send(fileResponse.data);
            return;
        }
        else {
            res.status(404).send('Resource not found')
        }
}







web3Domains.get('*', async (req, res) => {
    processWeb3Request(req, res)
})


export default web3Domains;
