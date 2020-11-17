import { createSlice, nanoid } from '@reduxjs/toolkit'

import { Segment }  from '../types'

/**
 * Slice for the state of the "video"
 * Treats the multitude of videos that may exist as one video
 * TODO: Find a way to init the segments array with a starting segment
 */
export const videoSlice = createSlice({
  name: 'videoState',
  initialState: {
    isPlaying: false,
    currentlyAt: 0.0,   // Position in the video in seconds
    duration: 0.0,      // Video duration in seconds
    segments: [{id: nanoid(), startTime: 0, endTime: 64.733, state: "alive"}]    
  },
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentlyAt: (state, action) => {
      console.log("Action.payload: "+action.payload)
      state.currentlyAt = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    addSegment: (state, action) => {
      state.segments.push(action.payload)
    },
    cut: (state) => {
      // Get index of segment that we are hovering
      let currentSegmentIndex = state.segments.findIndex(element => 
        element.startTime <= state.currentlyAt && element.endTime >= state.currentlyAt)

      // If we're exactly between two segments, we can't split the current segment
      if (state.segments[currentSegmentIndex].startTime === state.currentlyAt ||
          state.segments[currentSegmentIndex].endTime === state.currentlyAt ) {
        return state;
      }

      // Make two (new) segments out of it
      let segmentA : Segment =  {id: nanoid(),
        startTime: state.segments[currentSegmentIndex].startTime,
        endTime: state.currentlyAt,
        state: "dead"}
      let segmentB : Segment =  {id: nanoid(),
        startTime: state.currentlyAt,
        endTime: state.segments[currentSegmentIndex].endTime,
        state: "dead"}
      
      // Add the new segments and remove the old one
      state.segments.splice(currentSegmentIndex, 1, segmentA, segmentB);     
    }
  }
})

export const { setIsPlaying, setCurrentlyAt, setDuration, addSegment, cut } = videoSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectIsPlaying = (state: { videoState: { isPlaying: any; }; }) => state.videoState.isPlaying
export const selectCurrentlyAt = (state: { videoState: { currentlyAt: any; }; }) => state.videoState.currentlyAt
//export const selectDuration = (state: { videoState: { duration: any; }; }) => state.videoState.duration
export const selectSegments = (state: { videoState: { segments: any } }) => state.videoState.segments


export default videoSlice.reducer

