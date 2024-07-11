import express, { Express, Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import { store } from '../../main';
import cors from 'cors';

const apiFrigid = express();

let allowedOrigins = ['http://dev.frigid', 'https://dev.frigid'];
if(process.env.NODE_ENV == 'development'){
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
apiFrigid.use(cors(corsOptions));
apiFrigid.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");

    next();
});



apiFrigid.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }
    next()
})


apiFrigid.get('/supportedNetworks', async (req, res) => {
    const chainAppInfo = store.get('chainAppInfo')
    const rpcs = store.get('rpc')
    res.json({supportedNetworks: chainAppInfo.supportedNetworks, rpcs});
})



export default apiFrigid;
