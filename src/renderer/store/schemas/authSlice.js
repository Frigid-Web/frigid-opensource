import { createSlice, current } from "@reduxjs/toolkit";


const initialState = () => ({
    metamask: {
        connected: true,
        metaText: 'Connect with MetaMask',
        isOnChain: true,
        permissionState: true,
        accountId: null,
        reCheck: false,
    }
})

const authSlice = createSlice({
    name: 'Auth Manager',
    initialState: initialState(),
    reducers: {
        resetAuth: state => initialState(),
        setMetamaskConnected: (state, action) => {
            state.metamask.connected = action.payload
        },
        setMetaText: (state, action) => {
            state.metamask.metaText = action.payload
        },

        setPermissionState: (state, action) => {
            state.metamask.permissionState = action.payload
        },
        setOnChain: (state, action) => {
            state.metamask.isOnChain = action.payload
        },
        setAccountId: (state, action) => {
            state.metamask.accountId = action.payload
        },
        setRecheck: (state, action) => {
            state.metamask.reCheck = state.metamask.reCheck ? false : true
        }
    }
})

export const {
    resetAuth,
    setMetamaskConnected,
    setMetaText,
    setOnChain,
    setPermissionState,
    setAccountId,
    setRecheck
} = authSlice.actions



export default authSlice.reducer