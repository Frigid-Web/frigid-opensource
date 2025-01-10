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

    currentHue: {
        id: 1,
        title: 'Frigid Blue',
        primaryColor: 'rgb(0, 127, 190)',
        backgroundColor: 'rgb(0, 64, 95)',
        darkPrimaryColor: 'rgb(0, 46, 69)',
        darkBackgroundColor: 'rgb(0, 25, 38)',
        lightPrimaryColor: 'rgb(113, 208, 255)',
        lightBackgroundColor: 'rgb(186, 232, 255)',
    },

    hueList: [
        {
            id: 1,
            title: 'Frigid Blue',
            primaryColor: 'rgb(0, 127, 190)',
            backgroundColor: 'rgb(0, 64, 95)',
            darkPrimaryColor: 'rgb(0, 46, 69)',
            darkBackgroundColor: 'rgb(0, 25, 38)',
            lightPrimaryColor: 'rgb(113, 208, 255)',
            lightBackgroundColor: 'rgb(186, 232, 255)',
        },
        {
            id: 2,
            title: 'Fire Red',
            primaryColor: 'rgb(212, 0, 0)',
            backgroundColor: 'rgb(95, 0, 0)',
            darkPrimaryColor: 'rgb(69, 0, 0)',
            darkBackgroundColor: 'rgb(38, 0, 0)',
            lightPrimaryColor: 'rgb(255, 113, 113)',
            lightBackgroundColor: 'rgb(255, 186, 186)',
        },
        {
            id: 3,
            title: 'Earth Green',
            primaryColor: 'rgb(0, 175, 0)',
            backgroundColor: 'rgb(0, 95, 0)',
            darkPrimaryColor: 'rgb(0, 69, 0)',
            darkBackgroundColor: 'rgb(0, 38, 0)',
            lightPrimaryColor: 'rgb(113, 255, 113)',
            lightBackgroundColor: 'rgb(186, 255, 186)',

        },
        {
            id: 4,
            title: 'Deep Sea Blue',
            primaryColor: 'rgb(0, 0, 212)',
            backgroundColor: 'rgb(0, 0, 95)',
            darkPrimaryColor: 'rgb(0, 0, 69)',
            darkBackgroundColor: 'rgb(0, 0, 38)',
            lightPrimaryColor: 'rgb(113, 113, 255)',
            lightBackgroundColor: 'rgb(186, 186, 255)',
        },
        {
            id: 5,
            title: 'Sun Yellow',
            primaryColor: 'rgb(212, 212, 0)',
            backgroundColor: 'rgb(95, 95, 0)',
            darkPrimaryColor: 'rgb(69, 69, 0)',
            darkBackgroundColor: 'rgb(38, 38, 0)',
            lightPrimaryColor: 'rgb(255, 255, 113)',
            lightBackgroundColor: 'rgb(255, 255, 186)',

        },
        {
            id: 6,
            title: 'Matte Black',
            primaryColor: 'rgb(0, 0, 0)',
            backgroundColor: 'rgb(0, 0, 0)',
            darkPrimaryColor: 'rgb(0, 0, 0)',
            darkBackgroundColor: 'rgb(0, 0, 0)',
            lightPrimaryColor: 'rgb(113, 113, 113)',
            lightBackgroundColor: 'rgb(186, 186, 186)',
        },
        {
            id: 8,
            title: 'Eatable Orange',
            primaryColor: 'rgb(234, 117, 0)',
            backgroundColor: 'rgb(117, 58, 0)',
            darkPrimaryColor: 'rgb(85, 42, 0)',
            darkBackgroundColor: 'rgb(47, 23, 0)',
            lightPrimaryColor: 'rgb(255, 174, 113)',
            lightBackgroundColor: 'rgb(255, 209, 186)',



        },

    ],


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

const hueSlice = createSlice({
    name: 'Color Hue Manager',
    initialState: initialState(),
    reducers: {
        resetChain: state => initialState(),
        setCurrentHue: (state, action) => {
            state.currentHue = action.payload
        }
    }
})

export const {
    setCurrentHue,
} = hueSlice.actions



export default hueSlice.reducer