import express, { Express, Request, Response } from 'express';
import {ethers, Contract} from 'ethers';
import { store } from '../../main';
import { dnsAbi } from '../../../renderer/helpers/abi';
import _ from 'lodash'
import path from 'path';
const fs = require('fs');
const mime = require('mime');
const web3Domains = express();

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


const recombineFile = async (provider, hash, hostPath = null) => {
    if(hash == null){
        return null
    }
    const starterMap = await provider.getTransactionReceipt(hash)
    const hexString = extractHexString(starterMap.logs[2].data)
    if(hexString == null){
        return null
    }
    let jsonData = JSON.parse(hexToUtf8(hexString))

    let chunks = []
    let noC = false
    let startChunking = true
    await new Promise(async (bigResolve) => {
        while( startChunking ){
            for(let i=0; i<jsonData.f.length; i++){
                chunks.push(null)
                let chunkIndex = chunks.length - 1
                let chunkHash = jsonData.f[i]
                new Promise(async (resolve, reject) => {
                    let chunkData = await provider.getTransactionReceipt(chunkHash)
                    const newHexString = extractHexString(chunkData.logs[2].data)
                    if(newHexString == null){
                        return null
                    }
                    chunkData = Buffer.from(newHexString, 'hex');  
                    chunks[chunkIndex] = chunkData
                    if(noC && !chunks.some(item => item == null)){
                        startChunking = false
                        bigResolve()
                    }
                    resolve()
                })
            }
            
            if(jsonData.c == undefined){
                noC = true
                startChunking = false
                if(noC && !chunks.some(item => item == null)){
                    startChunking = false
                    bigResolve()
                }
            }
            else{
                const nextMap = await provider.getTransactionReceipt(jsonData.c)
                const nextHexString = extractHexString(nextMap.logs[2].data)
                if(nextHexString == null){
                    return null
                }
                jsonData = JSON.parse(hexToUtf8(nextHexString))
            }
        }
    })
    
    return Buffer.concat(chunks)
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
                    const type = mime.getType(hostPath) || 'application/octet-stream';
                    hash = _.get(origin_file, splitPaths, null)
                    fileResponse = { data: await recombineFile(provider, hash, hostPath), mime: type };
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
