import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import segmentsReducer from './segmentsSlice'
import videoReducer from './videoSlice'
import videoURLReducer from './videoURLSlice'

export default configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    segments: segmentsReducer,
    videoState: videoReducer,
    videoURL: videoURLReducer,
  }
})