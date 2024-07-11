import { createSlice, current } from "@reduxjs/toolkit";


const initialState = () => ({
    loadingData: {
        loading: null,
        statusText: 'Processing Transaction...',
        origin: 'Domain Purchase',
        progressBar: true
    },
    progressBar: {
        value: 0,
        max: 100
    }

})

const loadingSlice = createSlice({
    name: 'Loading Manager',
    initialState: initialState(),
    reducers: {
        resetLoading: state => initialState(),
        alterLoading: (state, action) => {
            state.loadingData = action.payload
        }


    }
})

export const {
    resetLoading,
    alterLoading
} = loadingSlice.actions



export default loadingSlice.reducer