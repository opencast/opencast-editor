import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit'
import { client } from '../util/client'

/**
 * EXPERIMENTAL: Slice for fetching stuff from Opencast
 */
export interface videoURL {
  videoURL: any,
  status: string,
  error: any
}

const initialState : videoURL = {
  videoURL: null,
  status: 'idle',
  error: null
}

export const fetchVideoURL = createAsyncThunk('videoURL/fetchVideoURL', async () => {
  const response = await client.get('https://legacy.opencast.org/api/events/')
  return response.posts
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
        state.videoURL = action.payload
    })
    builder.addCase(
      fetchVideoURL.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

export const selectVideoURL = (state: { videoURL: { videoURL: any } }) => state.videoURL.videoURL

export default videoURLSlice.reducer



