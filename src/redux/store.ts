import { configureStore } from '@reduxjs/toolkit'
import mainMenuStateReducer from './mainMenuSlice'
import finishStateReducer from './finishSlice'
import videoReducer from './videoSlice'
import workflowPostReducer from './workflowPostSlice'
import workflowPostAndProcessReducer from './workflowPostAndProcessSlice'
import endReducer from './endSlice'
import metadataReducer from './metadataSlice'

export default configureStore({
  reducer: {
    mainMenuState: mainMenuStateReducer,
    finishState: finishStateReducer,
    videoState: videoReducer,
    workflowPostState: workflowPostReducer,
    workflowPostAndProcessState: workflowPostAndProcessReducer,
    endState: endReducer,
    metadataState: metadataReducer,
  }
})
