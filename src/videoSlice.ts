import { createSlice } from '@reduxjs/toolkit'

export const videoSlice = createSlice({
  name: 'videoState',
  initialState: {
    isPlaying: false,
    currentlyAt: 0.0,
  },
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentlyAt: (state, action) => {
      state.currentlyAt = action.payload;
    },
  }
})

export const { setIsPlaying, setCurrentlyAt } = videoSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectIsPlaying = (state: { videoState: { isPlaying: any; }; }) => state.videoState.isPlaying
export const selectCurrentlyAt = (state: { videoState: { currentlyAt: any; }; }) => state.videoState.currentlyAt


export default videoSlice.reducer

