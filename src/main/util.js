import { URL } from 'url';
import path from 'path';
import { store } from './main';
import { app } from 'electron';

export function resolveHtmlPath(htmlFileName) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getAppPathway() {
  return `${path.resolve(__dirname, '../')}`;
}

export async function checkForUpdate() {
  try {
    const rpc = await store.get('rpc');
    if (rpc.arbitrum === undefined || (!rpc.arbitrum.includes('publicnode'))) {
      store.set('rpc', {
        "ethereum": "https://ethereum-rpc.publicnode.com",
        "binance": "https://bsc-rpc.publicnode.com",
        "avalanche": "https://avalanche-c-chain-rpc.publicnode.com",
        "arbitrum": "https://arbitrum-one-rpc.publicnode.com",
        "optimism": "https://optimism-rpc.publicnode.com",
        "fantom": "https://fantom-rpc.publicnode.com",
        "polygon": "https://lb.nodies.app/v1/975f16c52f5f4732b20b6692137eec17",
      });
    }

    let appInfo = {
      version: '1.0.0',
      changelog: 'asdf',
      currentVersion: '1.0.0',
      supportedNetworks: {
        'polygon': {
          pluri: '0xe469e49A15cF9c6B0C2685027eBb8bE43363bE33',
          faucet: '0xd75a1a4b3B1D8B8b135fc4d18dB880FB30492b62',
          dns: '0x6012E757c488eCCf8A8523C498af6F1211950819',
          stableToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
          stakeholder: '0xF31aB3088cc898F8e361e4e2D1a49a42EE6EEC37',
        },
        'ethereum': {
          pluri: '0x6337c3e9c04A0fC81e8cF689029eFaD88D67Fe2D',
          faucet: '0xd7d18126BE77fDfc4C8879c14A7f9a6601416D1B',
          stakeholder: '0x7c20BB233339D83656E890EE28870e038C8b68a0',
          dns: '0xC7Ae30314525D71da323781BfeB9eAaCDDE94599',
          stableToken: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        'binance': {
          pluri: '0x719D6FB3FcEFFb720e5d650F9766E5880090bCF7',
          faucet: '0xe469e49A15cF9c6B0C2685027eBb8bE43363bE33',
          stakeholder: '0x5D3B60c072F89DAfBF00A088b7268948C59acdEe',
          dns: '0x7475A76eC73DfD99Fb1302Ba283Fc1923912C23c',
          stableToken: '0x55d398326f99059ff775485246999027b3197955',
        },
        'avalanche': {
          pluri: '0x2901F652F2640BF09a54752998426A01e1c9aAc6',
          faucet: '0x719D6FB3FcEFFb720e5d650F9766E5880090bCF7',
          stakeholder: '0x55DFE94bD09f283FF0DC021b8cB41558786Ab053',
          dns: '0xF5479286bbF9938a9e4680b5f0ceB93B334da546',
          stableToken: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        },
        'optimism': {
          pluri: '0xe3ba04fA23A8276e0C9B8A668e4b5628bA7c0E96',
          faucet: '0x9D68671a77419E5C22BE70881F8D728b6a2dD1FD',
          stakeholder: '0xce5908510d568c0eE18e62B79b199a4B21a022eB',
          dns: '0xC7Ae30314525D71da323781BfeB9eAaCDDE94599',
          stableToken: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        },
        'arbitrum': {
          pluri: '0x8772dDF9b63fE761b4e316082781517F6832F9ca',
          faucet: '0xce5908510d568c0eE18e62B79b199a4B21a022eB',
          stakeholder: '0xe3ba04fA23A8276e0C9B8A668e4b5628bA7c0E96',
          dns: '0xC7Ae30314525D71da323781BfeB9eAaCDDE94599',
          stableToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        'fantom': {
          pluri: '0x8772dDF9b63fE761b4e316082781517F6832F9ca',
          faucet: '0xce5908510d568c0eE18e62B79b199a4B21a022eB',
          stakeholder: '0xe3ba04fA23A8276e0C9B8A668e4b5628bA7c0E96',
          dns: '0xC7Ae30314525D71da323781BfeB9eAaCDDE94599',
          stableToken: '0x049d68029688eabf473097a2fc38ef61633a3c7a',
        }
      },
      domains: {
        'poly': 'polygon',
        'bscn': 'binance',
        'ethr': 'ethereum',
        'avc': 'avalanche',
        'arb': 'arbitrum',
        'opt': 'optimism',
        'ftm': 'fantom',
      }
    };
    appInfo.currentVersion = app.getVersion();
    store.set('chainAppInfo', appInfo);
  } catch (error) {
    console.log(error);
  }
}
