import { pluriAbi, usdtPolygonAbi, pluriPolygonFaucetAbi, pluriPolygonStakeholderAbi, dnsAbi } from './abi'
import { useSelector } from 'react-redux'
import { store } from '../store/store'
import { ethers, Contract } from "ethers";



const getContractForMetamask = async (token) => {
    let functions = {}
    const abi = token.abi
    const address = token.address
    const state = store.getState()

    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new Contract(address, abi, signer)

        functions = { provider, contract }
    }
    const rpcProvider = new ethers.JsonRpcProvider(token.rpc)
    const rpcContract = new Contract(address, abi, rpcProvider);
    return { ...functions, rpcProvider, rpcContract }
}

const getNativeTokenFunctionsMetamask = async ({ decimalPlace, rpc }) => {
    let functions = {}
    const state = store.getState()
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        functions = { provider }
    }
    const rpcProvider = new ethers.JsonRpcProvider(rpc)
    return { ...functions, rpcProvider }
}


const generateTokenStructure = async ({ address, abi, decimalPlace, rpc }) => {
    const token = {
        address: address,
        abi: abi,
        decimalPlace,
        rpc: rpc
    };

    return {
        token,
        ... await getContractForMetamask(token)
    };
}



export let getNetworkTokens = {}


export const setNetworkTokens = async () => {
    try {
        const state = store.getState()
        const chains = state.mainapp.chainSlice
    
        if (state.mainapp.authSlice.metamask.accountId) {
            for (let chain of chains.chainList) {
                getNetworkTokens[chain.slug] = {
                    pluri: await generateTokenStructure({ address: chain.contracts.pluri, abi: pluriAbi, decimalPlace: 18, rpc: chain.rpcUrl }),
                    stableToken: await generateTokenStructure({ address: chain.contracts.stableToken, abi: usdtPolygonAbi, decimalPlace: 6, rpc: chain.rpcUrl }),
                    faucet: await generateTokenStructure({ address: chain.contracts.faucet, abi: pluriPolygonFaucetAbi, decimalPlace: 18, rpc: chain.rpcUrl }),
                    stakeholder: await generateTokenStructure({ address: chain.contracts.stakeholder, abi: pluriPolygonStakeholderAbi, decimalPlace: 18, rpc: chain.rpcUrl }),
                    nativeTokenFunctions: await getNativeTokenFunctionsMetamask({ decimalPlace: 18, rpc: chain.rpcUrl }),
                    dns: await generateTokenStructure({ address: chain.contracts.dns, abi: dnsAbi, decimalPlace: null, rpc: chain.rpcUrl })
                }
    
            }
            return true
        }
    } catch (error) {
        
    }
    return false


}



