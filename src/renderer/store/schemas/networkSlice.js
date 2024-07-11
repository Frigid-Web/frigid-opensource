import { createSlice } from "@reduxjs/toolkit";


const initialState = () => ({
    networkActive: false,
    desiredChain: null,
})

const networkSlice = createSlice({
    name: 'Network Manager',
    initialState: initialState(),
    reducers: {
        resetNetworkSlice: state => initialState(),
        toggleNetworkActive: state => {
            state.networkActive = !state.networkActive
        },
        setDesiredChain: (state, action) => {
            state.desiredChain = action.payload
        }

    }
})

export const {
    resetNetworkSlice,
    toggleNetworkActive,
    setDesiredChain
} = networkSlice.actions



export default networkSlice.reducer