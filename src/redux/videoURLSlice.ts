import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../util/client'

/**
 * EXPERIMENTAL: Slice for fetching stuff from Opencast
 */
export interface videoURL {
  videoURLs: string[],
  videoCount: number,
  duration: number,
  status: string,
  error: any
}

const initialState : videoURL = {
  videoURLs: [],
  videoCount: 0,
  duration: 0,
  status: 'idle',
  error: null
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
        state.videoURLs = action.payload.previews.reduce((a: string[], o: { uri: string }) => (a.push(o.uri), a), [])
        state.videoCount = action.payload.previews.length
        state.duration = action.payload.duration / 1000.0
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

export default videoURLSlice.reducer



