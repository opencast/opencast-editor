import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { roundToDecimalPlace } from '../util/utilityFunctions';
import type { RootState } from '../redux/store'
import { client } from '../util/client';
import { httpRequestState } from '../types';

export interface subtitle {
  isPlaying: boolean,             // Are videos currently playing?
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  caption: string | undefined,
}

const initialState: subtitle & httpRequestState = {
  isPlaying: false,
  currentlyAt: 0,   // Position in the video in milliseconds
  clickTriggered: false,
  caption: undefined,

  status: 'idle',
  error: undefined,
}

const updateCurrentlyAt = (state: subtitle, milliseconds: number) => {
  state.currentlyAt = roundToDecimalPlace(milliseconds, 0);

  if (state.currentlyAt < 0) {
    state.currentlyAt = 0;
  }
};

export const fetchSubtitle = createAsyncThunk('subtitle/fetchSubtitle', async (uri: string) => {
  const response = await client.get(uri)
  return response
})

/**
 * Slice for the subtitle editor state
 */
export const subtitleSlice = createSlice({
  name: 'subtitleState',
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<subtitle["isPlaying"]>) => {
      state.isPlaying = action.payload;
    },
    setCurrentlyAt: (state, action: PayloadAction<subtitle["currentlyAt"]>) => {
      updateCurrentlyAt(state, action.payload);
    },
    setCurrentlyAtInSeconds: (state, action: PayloadAction<subtitle["currentlyAt"]>) => {
      updateCurrentlyAt(state, roundToDecimalPlace(action.payload * 1000, 0))
    },
    setClickTriggered: (state, action) => {
      state.clickTriggered = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(
      fetchSubtitle.pending, (state, action) => {
        state.status = 'loading'
    })
    builder.addCase(
      fetchSubtitle.fulfilled, (state, action) => {
        state.caption = action.payload

        state.status = 'success'
    })
    builder.addCase(
      fetchSubtitle.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

// Export Actions
export const { setIsPlaying, setCurrentlyAt, setCurrentlyAtInSeconds, setClickTriggered } = subtitleSlice.actions

// Export Selectors
export const selectIsPlaying = (state: RootState) =>
  state.videoState.isPlaying
export const selectCurrentlyAt = (state: RootState) =>
  state.subtitleState.currentlyAt
export const selectCurrentlyAtInSeconds = (state: { subtitleState: { currentlyAt: subtitle["currentlyAt"]; }; }) =>
  state.subtitleState.currentlyAt / 1000

  export const selectCaption = (state: { subtitleState: { caption: subtitle["caption"] } }) =>
  state.subtitleState.caption
export const selectGetStatus = (state: { subtitleState: { status: httpRequestState["status"] } }) =>
  state.subtitleState.status
export const selectGetError = (state: { subtitleState: { error: httpRequestState["error"] } }) =>
  state.subtitleState.error

export default subtitleSlice.reducer