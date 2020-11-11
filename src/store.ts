import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import segmentsReducer from './segmentsSlice'
import videoReducer from './videoSlice'

export default configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    segments: segmentsReducer,
    videoState: videoReducer,
  }
})