import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { roundToDecimalPlace } from '../util/utilityFunctions';
import type { RootState } from '../redux/store'

export interface subtitle {
  isDisplayEditView: boolean,    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  dummyData : [string, number, number][],
}

const initialState: subtitle = {
  isDisplayEditView: false,
  isPlaying: false,
  currentlyAt: 0,   // Position in the video in milliseconds
  clickTriggered: false,
  dummyData: [
    ["Bla", 0, 3000],
    ["Fischers Frizt fischt frische Fische. Frische Fische fischt Fischers Fritz!", 5000, 7000],
    ["Overlap 1", 10000, 20000],
    ["Overlap 2", 15000, 25000],
    ["", 50000, 50000],
    ["", 500000, 600000],
  ]
}

const updateCurrentlyAt = (state: subtitle, milliseconds: number) => {
  state.currentlyAt = roundToDecimalPlace(milliseconds, 0);

  if (state.currentlyAt < 0) {
    state.currentlyAt = 0;
  }
};

/**
 * Slice for the subtitle editor state
 */
export const subtitleSlice = createSlice({
  name: 'subtitleState',
  initialState,
  reducers: {
    setIsDisplayEditView: (state, action: PayloadAction<subtitle["isDisplayEditView"]>) => {
      state.isDisplayEditView = action.payload;
    },
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
    setDummySegment: (state, action: PayloadAction<{index: number} & {text: string, start: number, end: number}> ) => {
      state.dummyData[action.payload.index] = [action.payload.text, action.payload.start, action.payload.end]
    },
  }
})

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setCurrentlyAt, setCurrentlyAtInSeconds, setClickTriggered, setDummySegment } = subtitleSlice.actions

// Export Selectors
export const selectIsDisplayEditView = (state: RootState) =>
  state.subtitleState.isDisplayEditView
export const selectIsPlaying = (state: RootState) =>
  state.videoState.isPlaying
export const selectCurrentlyAt = (state: RootState) =>
  state.subtitleState.currentlyAt
export const selectCurrentlyAtInSeconds = (state: { subtitleState: { currentlyAt: subtitle["currentlyAt"]; }; }) =>
  state.subtitleState.currentlyAt / 1000
export const selectDummyData = (state: { subtitleState: { dummyData: subtitle["dummyData"]; }; }) =>
  state.subtitleState.dummyData

export default subtitleSlice.reducer
