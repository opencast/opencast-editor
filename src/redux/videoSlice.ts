import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../util/client'

import { Segment }  from '../types'
import { roundToDecimalPlace } from '../util/utilityFunctions'
import { WritableDraft } from 'immer/dist/internal';

export interface video {
  isPlaying: boolean,
  currentlyAt: number,   // Position in the video in milliseconds
  segments: Segment[],
  activeSegmentIndex: number, 
  
  videoURLs: string[],
  videoCount: number,
  duration: number,   // Video duration in milliseconds
  title: string,
  presenters: string[],
  workflows: string[],

  status: string,
  error: any,
}

const initialState: video = {
  isPlaying: false,
  currentlyAt: 0,   // Position in the video in milliseconds
  segments: [{id: nanoid(), startTime: 0, endTime: 1, isAlive: true}],
  activeSegmentIndex: 0, 
  
  videoURLs: [],
  videoCount: 0,
  duration: 0,
  title: '',
  presenters: [],
  workflows: [],

  status: 'idle',
  error: null,
}

export const fetchVideoURL = createAsyncThunk('videoURL/fetchVideoURL', async () => {
  const response = await client.get('https://legacy.opencast.org/admin-ng/tools/ID-dual-stream-demo/editor.json')
  return response
})

/**
 * Slice for the state of the "video"
 * Treats the multitude of videos that may exist as one video
 * TODO: Find a way to init the segments array with a starting segment
 */
export const videoSlice = createSlice({
  name: 'videoState',
  initialState,
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentlyAt: (state, action) => {
      state.currentlyAt = roundToDecimalPlace(action.payload, 3);

      updateActiveSegment(state);
    },
    setCurrentlyAtInSeconds: (state, action) => {
      state.currentlyAt = roundToDecimalPlace(action.payload * 1000, 3);

      updateActiveSegment(state);
    },
    addSegment: (state, action) => {
      state.segments.push(action.payload)
    },
    cut: (state) => {
      // If we're exactly between two segments, we can't split the current segment
      if (state.segments[state.activeSegmentIndex].startTime === state.currentlyAt ||
          state.segments[state.activeSegmentIndex].endTime === state.currentlyAt ) {
        return state;
      }

      // Make two (new) segments out of it
      let segmentA : Segment =  {id: nanoid(),
        startTime: state.segments[state.activeSegmentIndex].startTime,
        endTime: state.currentlyAt,
        isAlive: false}
      let segmentB : Segment =  {id: nanoid(),
        startTime: state.currentlyAt,
        endTime: state.segments[state.activeSegmentIndex].endTime,
        isAlive: false}
      
      // Add the new segments and remove the old one
      state.segments.splice(state.activeSegmentIndex, 1, segmentA, segmentB);     
    },
    markAsDeletedOrAlive: (state) => {
      state.segments[state.activeSegmentIndex].isAlive = !state.segments[state.activeSegmentIndex].isAlive
    }
  },
  // For Async Requests
  extraReducers: builder => {
    builder.addCase(
      fetchVideoURL.pending, (state, action) => {
        state.status = 'loading'
    })
    builder.addCase(
      fetchVideoURL.fulfilled, (state, action) => {
        state.status = 'success'
        // eslint-disable-next-line no-sequences
        state.videoURLs = action.payload.previews.reduce((a: string[], o: { uri: string }) => (a.push(o.uri), a), [])
        state.videoCount = action.payload.previews.length
        state.duration = action.payload.duration
        state.title = action.payload.title
        state.presenters = action.payload.presenters
        state.segments = parseSegments(action.payload.segments, action.payload.duration)
        state.workflows = action.payload.workflows
    })
    builder.addCase(
      fetchVideoURL.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

const updateActiveSegment = (state: WritableDraft<video>) => {
  state.activeSegmentIndex = state.segments.findIndex(element => 
    element.startTime <= state.currentlyAt && element.endTime >= state.currentlyAt)
  // TODO: Proper error handling. Rewrite function?
  if(state.activeSegmentIndex < 0) {
    state.activeSegmentIndex = 0
  }
}

// Helper Function for testing with current/old editor API
const parseSegments = (segments: any, duration: number) => {
  let newSegments : Segment[] = []

  if (segments.length === 0) {
    newSegments.push({id: nanoid(), startTime: 0, endTime: duration, isAlive: true})
  }

  segments.forEach((element: { start: any; end: any; }) => {
    newSegments.push({id: nanoid(), startTime: element.start, endTime: element.end, isAlive: true})
  });
  return newSegments
}

export const { setIsPlaying, setCurrentlyAt, setCurrentlyAtInSeconds, addSegment, cut, markAsDeletedOrAlive } = videoSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectIsPlaying = (state: { videoState: { isPlaying: any; }; }) => state.videoState.isPlaying
export const selectCurrentlyAt = (state: { videoState: { currentlyAt: any; }; }) => state.videoState.currentlyAt
export const selectCurrentlyAtInSeconds = (state: { videoState: { currentlyAt: any; }; }) => state.videoState.currentlyAt / 1000
export const selectSegments = (state: { videoState: { segments: any } }) => state.videoState.segments
export const selectActiveSegmentIndex = (state: { videoState: { activeSegmentIndex: any; }; }) => state.videoState.activeSegmentIndex
export const selectIsCurrentSegmentAlive =     (state: { videoState: { segments: { [x: number]: { isAlive: boolean; }; }; activeSegmentIndex: number; }; }) => 
state.videoState.segments[state.videoState.activeSegmentIndex].isAlive

export const selectVideoURL = (state: { videoState: { videoURLs: string[] } }) => state.videoState.videoURLs
export const selectVideoCount = (state: { videoState: { videoCount: number } }) => state.videoState.videoCount
export const selectDuration = (state: { videoState: { duration: number } }) => state.videoState.duration
export const selectDurationInSeconds = (state: { videoState: { duration: number } }) => state.videoState.duration / 1000
export const selectTitle = (state: { videoState: { title: string } }) => state.videoState.title
export const selectPresenters = (state: { videoState: { presenters: string[] } }) => state.videoState.presenters
export const selectWorkflows = (state: { videoState: { workflows: string[] } }) => state.videoState.workflows

export default videoSlice.reducer

