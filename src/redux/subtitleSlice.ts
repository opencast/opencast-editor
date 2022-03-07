import { SubtitleCue } from './../types';
import { createAsyncThunk, createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { roundToDecimalPlace } from '../util/utilityFunctions';
import type { RootState } from '../redux/store'
import { client } from '../util/client';
import { httpRequestState, Subtitle } from '../types';
import { WebVTTParser } from 'webvtt-parser';
import { WritableDraft } from 'immer/dist/internal';

export interface subtitle {
  isDisplayEditView: boolean    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  caption: string | undefined,
  subtitles: Subtitle[],
  selectedSubtitleFlavor: string,
  aspectRatios: {width: number, height: number}[],  // Aspect ratios of every video

  status: 'idle' | 'loading' | 'success' | 'failed',
  errors: {identifier: string, error: string}[],
}

const initialState: subtitle = {
  isDisplayEditView: false,
  isPlaying: false,
  isPlayPreview: true,
  previewTriggered: false,
  currentlyAt: 0,
  clickTriggered: false,
  caption: undefined,
  subtitles: [],
  selectedSubtitleFlavor: "",

  status: 'idle',
  errors: [],
  aspectRatios: [],
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
    resetRequestState: (state) => {
      state.status = 'idle'
    },
    setSubtitle: (state, action: PayloadAction<Subtitle>) => {
      let index = 0
      for (const sub of state.subtitles) {
        if (sub.identifier === action.payload.identifier) {
          state.subtitles[index] = action.payload
          return
        }
        index++
      }
      state.subtitles.push(action.payload)
    },
    setCueAtIndex: (state, action: PayloadAction<{identifier: string, cueIndex: number, cue: SubtitleCue}>) => {
      let index = 0
      for (const sub of state.subtitles) {
        if (sub.identifier === action.payload.identifier) {
          if (action.payload.cueIndex < 0 || action.payload.cueIndex >= state.subtitles[index].subtitles.length) {
            console.log("WARNING: Tried to set segment for subtitle " + action.payload.identifier + " but was out of range")
            return
          }
          console.log("SetCue")
          const formattedCue = {
            id: action.payload.cue.id,
            text: action.payload.cue.text,
            startTime: Math.round(action.payload.cue.startTime),
            endTime: Math.round(action.payload.cue.endTime)
          }
          state.subtitles[index].subtitles[action.payload.cueIndex] = formattedCue
          return
        }
        index++
      }
    },
    addCueAtIndex: (state, action: PayloadAction<{identifier: string, cueIndex: number, text: string, startTime: number, endTime: number}>) => {
      const startTime = action.payload.startTime >= 0 ? action.payload.startTime : 0
      const cue: SubtitleCue = {
        id: nanoid(),
        text: action.payload.text,
        startTime: Math.round(startTime),
        endTime: Math.round(action.payload.endTime)
      }

      let index = 0
      for (const sub of state.subtitles) {
        if (sub.identifier === action.payload.identifier) {

          if (action.payload.cueIndex < 0 ) {
            state.subtitles[index].subtitles.splice(0, 0, cue);
            return
          }

          if (action.payload.cueIndex >= 0 || action.payload.cueIndex < state.subtitles[index].subtitles.length) {
            state.subtitles[index].subtitles.splice(action.payload.cueIndex, 0, cue);
            return
          }

          if (action.payload.cueIndex >= state.subtitles[index].subtitles.length) {
            state.subtitles[index].subtitles.push(cue)
            return
          }
        }
        index++
      }
    },
    removeCue: (state, action: PayloadAction<{identifier: string, cue: SubtitleCue}>) => {
      let index = 0
      for (const sub of state.subtitles) {
        if (sub.identifier === action.payload.identifier) {
          const cueIndex = state.subtitles[index].subtitles.findIndex(i => i.id === action.payload.cue.id);
          if (cueIndex > -1) {
            state.subtitles[index].subtitles.splice(cueIndex, 1);
          }
        }
        index++
      }
    },
    setSelectedSubtitleFlavor: (state, action: PayloadAction<subtitle["selectedSubtitleFlavor"]>) => {
      state.selectedSubtitleFlavor = action.payload
    },
    setAspectRatio: (state, action: PayloadAction<{dataKey: number} & {width: number, height: number}> ) => {
      state.aspectRatios[action.payload.dataKey] = {width: action.payload.width, height: action.payload.height}
    },
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
          setError(state, action.payload.identifier, errors.join("\n"))
        }

        // Attach a unique id to each segment/cue
        // This is used by React to keep track of cues between changes (e.g. addition, deletion)
        console.log(tree.cues)
        let index = 0
        for (let cue of tree.cues) {
          if (!cue.id) {
            cue.id = nanoid()
            tree.cues[index] = cue
          }

          // Turn times into milliseconds
          cue.startTime = cue.startTime * 1000
          cue.endTime = cue.endTime * 1000
          tree.cues[index] = cue

          index++
        }

        setSubtitleOnState(state, {identifier: action.payload.identifier, subtitles: tree.cues})
    })
    builder.addCase(
      fetchSubtitle.rejected, (state, action) => {
        state.status = 'failed'
        setError(state, state.selectedSubtitleFlavor, action.error.message ? action.error.message : "")
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

const setError = (state: WritableDraft<subtitle>, identifier: string, error: string) => {
  let index = 0
  for (const err of state.errors) {
    if (err.identifier === identifier) {
      state.errors[index] = {identifier, error}
      return
    }
    index++
  }
  state.errors.push({identifier: identifier, error: error})
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

const getErrorByFlavor = (errors: subtitle["errors"], subtitleFlavor: string) => {
  for (const err of errors) {
    if (err.identifier === subtitleFlavor) {
      return err.error
    }
  }
}

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setIsPlayPreview, setPreviewTriggered, setCurrentlyAt, setCurrentlyAtInSeconds, setClickTriggered, resetRequestState, setSubtitle, setCueAtIndex, addCueAtIndex, removeCue, setSelectedSubtitleFlavor, setAspectRatio } = subtitleSlice.actions

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

export const selectCaption = (state: { subtitleState: { caption: subtitle["caption"] } }) =>
  state.subtitleState.caption
export const selectGetStatus = (state: { subtitleState: { status: httpRequestState["status"] } }) =>
  state.subtitleState.status
export const selectGetErrors = (state: { subtitleState: { errors: subtitle["errors"] } }) =>
  state.subtitleState.errors
export const selectSubtitles = (state: { subtitleState: { subtitles: subtitle["subtitles"] } }) =>
  state.subtitleState.subtitles
export const selectSelectedSubtitleFlavor = (state: { subtitleState: { selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"] } }) =>
  state.subtitleState.selectedSubtitleFlavor
export const selectSelectedSubtitleByFlavor = (state: { subtitleState:
  { subtitles: subtitle["subtitles"]; selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"]; }; }) =>
  getSubtitleByFlavor(state.subtitleState.subtitles, state.subtitleState.selectedSubtitleFlavor)
export const selectErrorByFlavor = (state: { subtitleState:
  { errors: subtitle["errors"]; selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"]; }; }) =>
  getErrorByFlavor(state.subtitleState.errors, state.subtitleState.selectedSubtitleFlavor)

export default subtitleSlice.reducer
