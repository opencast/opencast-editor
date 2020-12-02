import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import videoReducer from './videoSlice'
import workflowPostReducer from './workflowPostSlice'
import workflowPostAndProcessReducer from './workflowPostAndProcessSlice'

export default configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    videoState: videoReducer,
    workflowPostState: workflowPostReducer,
    workflowPostAndProcessState: workflowPostAndProcessReducer,
  }
})
