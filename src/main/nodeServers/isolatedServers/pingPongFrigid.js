import express from 'express';
import cors from 'cors';
const pingPongFrigid = express();

pingPongFrigid.use(cors('*'))


pingPongFrigid.use(async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return
    }
    next()
})


pingPongFrigid.get('*', async (req, res) => {
    res.send('Pong')
})



export default pingPongFrigid;
