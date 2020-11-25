import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../util/client'

/**
 * EDIT: CURRENTLY NOT IN USE, DUE TO MOVING ITS LOGIC TO VIDEOSLICE
 * EXPERIMENTAL: Slice for fetching stuff from Opencast
 */
export interface videoURL {
  videoURLs: string[],
  videoCount: number,
  duration: number,   // Video duration in milliseconds
  title: string,
  presenters: string[],
  status: string,
  error: any,
  segments: string[],
}

const initialState : videoURL = {
  videoURLs: [],
  videoCount: 0,
  duration: 1,
  title: '',
  presenters: [],
  status: 'idle',
  error: null,
  segments: []
}

export const fetchVideoURL = createAsyncThunk('videoURL/fetchVideoURL', async () => {
  const response = await client.get('https://legacy.opencast.org/admin-ng/tools/ID-dual-stream-demo/editor.json')
  return response
})

const videoURLSlice = createSlice({
  name: 'videoURL',
  initialState,
  reducers: {
  },
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
        state.segments = action.payload.segments
    })
    builder.addCase(
      fetchVideoURL.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

export const selectVideoURL = (state: { videoURL: { videoURLs: string[] } }) => state.videoURL.videoURLs
export const selectVideoCount = (state: { videoURL: { videoCount: number } }) => state.videoURL.videoCount
export const selectDuration = (state: { videoURL: { duration: number } }) => state.videoURL.duration
export const selectDurationInSeconds = (state: { videoURL: { duration: number } }) => state.videoURL.duration / 1000
export const selectTitle = (state: { videoURL: { title: string } }) => state.videoURL.title
export const selectPresenters = (state: { videoURL: { presenters: string[] } }) => state.videoURL.presenters

export default videoURLSlice.reducer



