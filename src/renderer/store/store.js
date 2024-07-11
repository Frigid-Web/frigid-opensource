import { combineReducers, configureStore } from '@reduxjs/toolkit';
import networkSlice from './schemas/networkSlice';
import authSlice from './schemas/authSlice';
import loadingSlice from './schemas/loadingSlice';
import chainSlice from './schemas/chainSlice';

export const store = configureStore({
  reducer: {
    mainapp: combineReducers({
      authSlice: authSlice,
      networkSlice: networkSlice,
      loadingSlice: loadingSlice,
      chainSlice: chainSlice
    })
  },
});
