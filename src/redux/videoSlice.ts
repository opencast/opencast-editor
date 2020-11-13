import { createSlice } from '@reduxjs/toolkit'

/**
 * Slice for the state of the "video"
 * Treats the multitude of videos that may exist as one video
 */
export const videoSlice = createSlice({
  name: 'videoState',
  initialState: {
    isPlaying: false,
    currentlyAt: 0.0,
    duration: 0.0,
  },
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentlyAt: (state, action) => {
      state.currentlyAt = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    }
  }
})

export const { setIsPlaying, setCurrentlyAt, setDuration } = videoSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectIsPlaying = (state: { videoState: { isPlaying: any; }; }) => state.videoState.isPlaying
export const selectCurrentlyAt = (state: { videoState: { currentlyAt: any; }; }) => state.videoState.currentlyAt
export const selectDuration = (state: { videoState: { duration: any; }; }) => state.videoState.duration


export default videoSlice.reducer

