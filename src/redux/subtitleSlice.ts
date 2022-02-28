import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { roundToDecimalPlace } from '../util/utilityFunctions';
import type { RootState } from '../redux/store'
import { client } from '../util/client';
import { httpRequestState, Subtitle } from '../types';
import { WebVTTParser } from 'webvtt-parser';
import { WritableDraft } from 'immer/dist/internal';

export interface subtitle {
  isDisplayEditView: boolean    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  caption: string | undefined,
  subtitles: Subtitle[],
  selectedSubtitleFlavor: string,
}

const initialState: subtitle & httpRequestState = {
  isDisplayEditView: false,
  isPlaying: false,
  currentlyAt: 0,   // Position in the video in milliseconds
  clickTriggered: false,
  caption: undefined,
  subtitles: [],
  selectedSubtitleFlavor: "",

  status: 'idle',
  error: undefined,
}

const updateCurrentlyAt = (state: subtitle, milliseconds: number) => {
  state.currentlyAt = roundToDecimalPlace(milliseconds, 0);

  if (state.currentlyAt < 0) {
    state.currentlyAt = 0;
  }
};

export const fetchSubtitle = createAsyncThunk('subtitle/fetchSubtitle', async ({identifier, uri} : {identifier: string, uri: string}) => {
  const response = await client.get(uri)
  return {identifier, response}
})

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
    resetRequestState: (state) => {
      state.status = 'idle'
    },
    setSubtitle: (state, action: PayloadAction<{identifier: string} & {subtitle: any}>) => {
      let index = 0
      for (const sub of state.subtitles) {
        if (sub.identifier === action.payload.identifier) {
          state.subtitles[index] = action.payload.subtitle
          return
        }
        index++
      }
      state.subtitles.push({identifier: action.payload.identifier, subtitles: action.payload.subtitle})
    },
    setSelectedSubtitleFlavor: (state, action: PayloadAction<subtitle["selectedSubtitleFlavor"]>) => {
      state.selectedSubtitleFlavor = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(
      fetchSubtitle.pending, (state, action) => {
        state.status = 'loading'
    })
    builder.addCase(
      fetchSubtitle.fulfilled, (state, action) => {
        state.status = 'success'
        // Used parsing library: https://www.npmjs.com/package/webvtt-parser
        // - Unmaintained and does have bugs, so we will need to switch eventually
        // Other interesting vtt parsing libraries:
        // https://github.com/osk/node-webvtt
        // - Pros: Parses styles and meta information
        // - Cons: Parses timestamps in seconds, Maybe not maintained anymore
        // https://github.com/gsantiago/subtitle.js
        // - Pros: Parses styles, can also parse SRT, actively maintained
        // - Cons: Uses node streaming library, can't polyfill without ejecting CreateReactApp
        // TODO: Parse caption
        const parser = new WebVTTParser();
        const tree = parser.parse(action.payload.response, 'metadata');
        if (tree.errors.length !== 0) {
          state.status = 'failed'
          const errors = []
          for (const er of tree.errors) {
            errors.push("On line: " + er.line + " col: " + er.col + " error occured: " + er.message)
          }
          state.error = errors.join("\n")
        }

        setSubtitleOnState(state, {identifier: action.payload.identifier, subtitles: tree.cues})
    })
    builder.addCase(
      fetchSubtitle.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
    })
  }
})

/**
 * Update the subtitle array state with a particular subtitle
 * @param state
 * @param parsedSubtitle
 * @returns
 */
const setSubtitleOnState = (state: WritableDraft<subtitle>, parsedSubtitle: Subtitle) => {
  let index = 0
  for (const sub of state.subtitles) {
    if (sub.identifier === parsedSubtitle.identifier) {
      state.subtitles[index] = parsedSubtitle
      return
    }
    index++
  }
  state.subtitles.push(parsedSubtitle)
}

/**
 * Get a subtitle from the array by its identifier
 * @param subtitles
 * @param subtitleFlavor
 * @returns
 */
const getSubtitleByFlavor = (subtitles: Subtitle[], subtitleFlavor: string) => {
  for (const sub of subtitles) {
    if (sub.identifier === subtitleFlavor) {
      return sub
    }
  }
}

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setCurrentlyAt, setCurrentlyAtInSeconds, setClickTriggered, resetRequestState, setSubtitle, setSelectedSubtitleFlavor } = subtitleSlice.actions

// Export Selectors
export const selectIsDisplayEditView = (state: RootState) =>
  state.subtitleState.isDisplayEditView
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
export const selectSubtitles = (state: { subtitleState: { subtitles: subtitle["subtitles"] } }) =>
  state.subtitleState.subtitles
export const selectSelectedSubtitleFlavor = (state: { subtitleState: { selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"] } }) =>
  state.subtitleState.selectedSubtitleFlavor
export const selectSelectedSubtitleByFlavor = (state: { subtitleState:
  { subtitles: subtitle["subtitles"]; selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"]; }; }) =>
  getSubtitleByFlavor(state.subtitleState.subtitles, state.subtitleState.selectedSubtitleFlavor)

export default subtitleSlice.reducer
