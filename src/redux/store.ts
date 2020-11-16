import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import videoReducer from './videoSlice'
import videoURLReducer from './videoURLSlice'

export default configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    videoState: videoReducer,
    videoURL: videoURLReducer,
  }
})