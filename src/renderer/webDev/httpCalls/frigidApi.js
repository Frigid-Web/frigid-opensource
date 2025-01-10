import { createAsyncThunk } from '@reduxjs/toolkit'
import { setAvailableChains } from '../../store/schemas/chainSlice';
import { setDesiredChain } from '../../store/schemas/networkSlice';

const server = 'https://api.frigid/'



/* export const signUpUser = createAsyncThunk(
    'auth/signUpUser',
    async (data, thunkApi) => {
        try {
            const response = await fetch(`${server}register`, {
                method: 'POST',
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, password: data.password, name: data.name })
            })
            const results = await response.json()
            if ("error" in results) {
                throw results
            }
            thunkApi.dispatch(loginUser({ email: data.email, password: data.password }))
        } catch (error) {
            notifications.show({ title: error.error, message: error.message })

        }
    }
)
*/


export const getAvailableNetworks = createAsyncThunk(
    'api/getAvailableNetworks',
    async (data, thunkApi) => {
        try {
            const response = await fetch(`${server}supportedNetworks`, {
                method: 'GET',
            })
            const results = await response.json()
            let { supportedNetworks, rpcs } = results
            const state = thunkApi.getState()
            let newChainList = []
            for(let chain of structuredClone(state.mainapp.chainSlice.chainList)){
                if(supportedNetworks[chain.slug] != undefined){
                    chain.contracts = supportedNetworks[chain.slug]
                    chain.rpcUrl = rpcs[chain.slug]
                    newChainList.push(chain)
                }
            }

            await thunkApi.dispatch(setAvailableChains(newChainList))
            return 'Success'
        } catch (error) {
            console.log(error)
            console.log("Error getting available networks")
        }
    }
)




export const determineOnNetwork = createAsyncThunk(
    'app/determineOnNetwork',
    async (data, thunkApi) => {
        try {
            const domain = data.domain
            const state = thunkApi.getState()
            const chainDomainSuffix = state.mainapp.chainSlice.currentChain.domainEnding
            const chains =  state.mainapp.chainSlice.chainList
            const splitDomain = domain.split('.')
            const domainSuffix = splitDomain[splitDomain.length - 1]
            if (domainSuffix === chainDomainSuffix) {
                return true
            }
            else{
                let desiredChain = chains.find(chain => chain.domainEnding === domainSuffix)
                console.log(desiredChain)
                console.log(chains)
                thunkApi.dispatch(setDesiredChain(desiredChain.id))
                return false
            }
        } catch (error) {
            console.log(error)
            console.log("Error getting available networks")
            return false
        }
    }
)