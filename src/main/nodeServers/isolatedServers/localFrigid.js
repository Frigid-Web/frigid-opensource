import express, { Express, Request, Response } from 'express';
const { createProxyMiddleware } = require('http-proxy-middleware');
import cors from 'cors';


const localFrigid = express();
localFrigid.use(cors());


localFrigid.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

    next();
});



localFrigid.use(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }

    const upgradeHeader = req.headers.upgrade;
    const target = upgradeHeader && upgradeHeader.toLowerCase() === 'websocket'
        ? 'ws://localhost:5500/ws-hmr'
        : 'http://localhost:5500';
    // console.log('target', target);
    // Create and return the proxy middleware
    const proxy = createProxyMiddleware({
        target: target,
        changeOrigin: true,
        ws: upgradeHeader && upgradeHeader.toLowerCase() === 'websocket',
        logLevel: 'debug',
    });

    return proxy(req, res);

})






export default localFrigid;
