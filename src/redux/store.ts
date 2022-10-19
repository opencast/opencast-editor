import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import finishStateReducer from './finishSlice'
import videoReducer from './videoSlice'
import workflowPostReducer from './workflowPostSlice'
import workflowPostAndProcessReducer from './workflowPostAndProcessSlice'
import endReducer from './endSlice'
import metadataReducer from './metadataSlice'
import subtitleReducer from './subtitleSlice'
import errorReducer from './errorSlice'
import themeReducer from './themeSlice'

export const store = configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    finishState: finishStateReducer,
    videoState: videoReducer,
    workflowPostState: workflowPostReducer,
    workflowPostAndProcessState: workflowPostAndProcessReducer,
    endState: endReducer,
    metadataState: metadataReducer,
    subtitleState: subtitleReducer,
    errorState: errorReducer,
    themeState: themeReducer,
  }
})

export type AppDispatch = typeof store.dispatch

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

export default store;
