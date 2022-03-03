import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../redux/store'
import { roundToDecimalPlace } from '../util/utilityFunctions';

export interface subtitle {
  isDisplayEditView: boolean,    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  aspectRatios: {width: number, height: number}[],  // Aspect ratios of every video
}

const initialState: subtitle = {
  isDisplayEditView: false,
  isPlaying: false,
  isPlayPreview: true,
  previewTriggered: false,
  currentlyAt: 0,   // Position in the video in milliseconds
  clickTriggered: false,
  aspectRatios: [],
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
    setIsPlayPreview: (state, action: PayloadAction<subtitle["isPlaying"]>) => {
      state.isPlayPreview = action.payload;
    },
    setPreviewTriggered: (state, action) => {
      state.previewTriggered = action.payload
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
    setAspectRatio: (state, action: PayloadAction<{dataKey: number} & {width: number, height: number}> ) => {
      state.aspectRatios[action.payload.dataKey] = {width: action.payload.width, height: action.payload.height}
    },
  }
})

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setIsPlayPreview, setPreviewTriggered, setCurrentlyAt, setCurrentlyAtInSeconds, setClickTriggered, setAspectRatio } = subtitleSlice.actions

// Export Selectors
export const selectIsDisplayEditView = (state: RootState) =>
  state.subtitleState.isDisplayEditView
export const selectIsPlaying = (state: RootState) =>
  state.subtitleState.isPlaying
export const selectIsPlayPreview = (state: { subtitleState: { isPlayPreview: subtitle["isPlayPreview"] }; }) =>
  state.subtitleState.isPlayPreview
export const selectPreviewTriggered = (state: { subtitleState: { previewTriggered: subtitle["previewTriggered"] } }) =>
  state.subtitleState.previewTriggered
export const selectCurrentlyAt = (state: RootState) =>
  state.subtitleState.currentlyAt
export const selectCurrentlyAtInSeconds = (state: { subtitleState: { currentlyAt: subtitle["currentlyAt"]; }; }) =>
  state.subtitleState.currentlyAt / 1000
export const selectClickTriggered = (state: { subtitleState: { clickTriggered: subtitle["clickTriggered"] } }) =>
  state.subtitleState.clickTriggered
// Hardcoding this value to achieve a desired size for the video player
// TODO: Don't hardcode this value, instead make the video player component more flexible
export const selectAspectRatio = (state: { subtitleState: { aspectRatios: subtitle["aspectRatios"] } }) =>
  50


export default subtitleSlice.reducer