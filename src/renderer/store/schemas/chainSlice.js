import { createSlice, current } from "@reduxjs/toolkit";
import polygonIcon from '../../../../assets/chains/polygon.png'
import ethereumIcon from '../../../../assets/chains/ethereum.png'
import binanceIcon from '../../../../assets/chains/binance.png'
import avalancheIcon from '../../../../assets/chains/avalanche.png'
import ethereumclassicIcon from '../../../../assets/chains/ethereumclassic.png'
import optimismIcon from '../../../../assets/chains/optimism.png'
import arbitrumIcon from '../../../../assets/chains/arbitrum.png'
import fantomIcon from '../../../../assets/chains/fantom.png'


const initialState = () => ({
    currentChain: {
        name: 'Polygon',
        id: 137,
        chainId: 137,
        icon: 'polygon',
        slug: 'polygon',
        nativeCurrency: {
            name: 'POL',
            symbol: 'POL',
            decimals: 18,
        },
        stableToken: {
            name: 'USDT',
            symbol: 'USDT',
            decimals: 6,
            unit: 'mwei'
        },
        rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
        image: polygonIcon,
        domainEnding: 'poly',
        animal: 'fox'
    },
    chainList: [
        {
            name: 'Polygon',
            id: 137,
            chainId: 137,
            icon: 'polygon',
            slug: 'polygon',
            nativeCurrency: {
                name: 'POL',
                symbol: 'POL',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'
            },
            rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
            image: polygonIcon,
            domainEnding: 'poly',
            animal: 'fox',
        },
        {
            name: 'Binance',
            id: 56,
            chainId: 56,
            icon: 'binance',
            slug: 'binance',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 18,
                unit: 'ether'

            },
            rpcUrl: 'https://binance.llamarpc.com',
            image: binanceIcon,
            domainEnding: 'bscn',
            animal: 'bear'
        },
        {
            name: 'Ethereum',
            id: 1,
            chainId: 1,
            icon: 'ethereum',
            slug: 'ethereum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'

            },
            rpcUrl: 'https://etc.rivet.link',
            image: ethereumIcon,
            domainEnding: 'ethr',
            animal: 'bull'

        },
        {
            name: 'Avalanche C-Chain',
            id: 43114,
            chainId: 43114,
            icon: 'avalanche',
            slug: 'avalanche',
            nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'
            },
            rpcUrl: 'https://avalanche-c-chain-rpc.publicnode.com',
            image: avalancheIcon,
            domainEnding: 'avc',
            animal: 'yeti'
        },
        {
            name: 'Arbitrum',
            id: 42161,
            chainId: 42161,
            icon: 'arbitrum',
            slug: 'arbitrum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'

            },
            rpcUrl: 'https://arbitrum.llamarpc.com',
            image: arbitrumIcon,
            domainEnding: 'arb',
            animal: 'unicorn'
        },
        {
            name: 'Optimism',
            id: 10,
            chainId: 10,
            icon: 'optimism',
            slug: 'optimism',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'

            },
            rpcUrl: 'https://optimism.llamarpc.com',
            image: optimismIcon,
            domainEnding: 'opt',
            animal: 'dragon'
        },
        {
            name: 'Fantom',
            id: 250,
            chainId: 250,
            icon: 'fantom',
            slug: 'fantom',
            nativeCurrency: {
                name: 'FTM',
                symbol: 'FTM',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
                unit: 'mwei'

            },
            rpcUrl: 'https://fantom-rpc.publicnode.com',
            image: fantomIcon,
            domainEnding: 'ftm',
            animal: 'ghost'
        }
    ],
    contractsLoaded: false,
    expectedChainList: [

        {
            name: 'Binance',
            id: 56,
            chainId: 56,
            icon: 'binance',
            slug: 'binance',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 18,
            },
            rpcUrl: 'https://binance.llamarpc.com',
            image: binanceIcon,
            domainEnding: 'bscn',
            animal: 'bear'
        },
        {
            name: 'Ethereum',
            id: 1,
            chainId: 1,
            icon: 'ethereum',
            slug: 'ethereum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://etc.rivet.link',
            image: ethereumIcon,
            domainEnding: 'ethr',
            animal: 'bull'

        },
        {
            name: 'Avalanche C-Chain',
            id: 43114,
            chainId: 43114,
            icon: 'avalanche',
            slug: 'avalanche',
            nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://avalanche-c-chain-rpc.publicnode.com',
            image: avalancheIcon,
            domainEnding: 'avc',
            animal: 'yeti'
        },
        {
            name: 'Ethereum Classic',
            id: 61,
            chainId: 61,
            icon: 'ethereumclassic',
            slug: 'ethereumclassic',
            nativeCurrency: {
                name: 'ETC',
                symbol: 'ETC',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://etc.rivet.link',
            image: ethereumclassicIcon,
            domainEnding: 'ethrc',
            animal: 'ragingbull'
        },
        {
            name: 'Arbitrum',
            id: 42161,
            chainId: 42161,
            icon: 'arbitrum',
            slug: 'arbitrum',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://arbitrum.llamarpc.com',
            image: arbitrumIcon,
            domainEnding: 'arb',
            animal: 'unicorn'
        },
        {
            name: 'Optimism',
            id: 10,
            chainId: 10,
            icon: 'optimism',
            slug: 'optimism',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://optimism.llamarpc.com',
            image: optimismIcon,
            domainEnding: 'opt',
            animal: 'dragon'
        },
        {
            name: 'Fantom',
            id: 250,
            chainId: 250,
            icon: 'fantom',
            slug: 'fantom',
            nativeCurrency: {
                name: 'FTM',
                symbol: 'FTM',
                decimals: 18,
            },
            stableToken: {
                name: 'USDT',
                symbol: 'USDT',
                decimals: 6,
            },
            rpcUrl: 'https://fantom-rpc.publicnode.com',
            image: fantomIcon,
            domainEnding: 'ftm',
            animal: 'ghost'
        }
    ]
})

const chainSlice = createSlice({
    name: 'Chain Manager',
    initialState: initialState(),
    reducers: {
        resetChain: state => initialState(),
        setCurrentActiveChain: (state, action) => {
            state.currentChain = action.payload
        },
        setAvailableChains: (state, action) => {
            state.chainList = action.payload
        },
        setContractsLoaded: (state, action) => {
            state.contractsLoaded = action.payload
        }
    }
})

export const {
    resetChain,
    setCurrentActiveChain,
    setAvailableChains,
    setContractsLoaded
} = chainSlice.actions



export default chainSlice.reducer