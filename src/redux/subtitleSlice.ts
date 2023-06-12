import { Segment, SubtitleCue } from './../types';
import { createSlice, Dispatch, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { roundToDecimalPlace } from '../util/utilityFunctions';
import type { RootState } from '../redux/store'
import { video } from './videoSlice';

export interface subtitle {
  isDisplayEditView: boolean    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  subtitles: { [identifier: string]: SubtitleCue[] },
  selectedSubtitleFlavor: string,
  aspectRatios: {width: number, height: number}[],  // Aspect ratios of every video
  focusSegmentTriggered: boolean,   // a segment in the timeline was clicked
  focusSegmentId: string,           // which segment in the timeline was clicked
  focusSegmentTriggered2: boolean,   // a different trigger for a child component, to avoid additional rerenders from the parent

  hasChanges: boolean         // Did user make changes to metadata view since last save
}

const initialState: subtitle = {
  isDisplayEditView: false,
  isPlaying: false,
  isPlayPreview: true,
  previewTriggered: false,
  currentlyAt: 0,
  clickTriggered: false,
  subtitles: {},
  selectedSubtitleFlavor: "",
  focusSegmentTriggered: false,
  focusSegmentId: "",
  focusSegmentTriggered2: false,

  aspectRatios: [],
  hasChanges: false,
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
    setSubtitle: (state, action: PayloadAction<{identifier: string, subtitles: SubtitleCue[]}>) => {
      state.subtitles[action.payload.identifier] = action.payload.subtitles
    },
    setCueAtIndex: (state, action: PayloadAction<{identifier: string, cueIndex: number, newCue: SubtitleCue}>) => {
      if (action.payload.cueIndex < 0 || action.payload.cueIndex >= state.subtitles[action.payload.identifier].length) {
        console.log("WARNING: Tried to set segment for subtitle " + action.payload.identifier + " but was out of range")
        return
      }

      let cue = state.subtitles[action.payload.identifier][action.payload.cueIndex]
      cue.id = action.payload.newCue.id
      cue.idInternal = action.payload.newCue.idInternal
      cue.text = action.payload.newCue.text
      cue.startTime = Math.round(action.payload.newCue.startTime)
      cue.endTime = Math.round(action.payload.newCue.endTime)

      cue.tree.children[0].value = action.payload.newCue.text

      state.subtitles[action.payload.identifier][action.payload.cueIndex] = cue

      sortSubtitle(state, action.payload.identifier)
      state.hasChanges = true
    },
    addCueAtIndex: (state, action: PayloadAction<{identifier: string, cueIndex: number, text: string, startTime: number, endTime: number}>) => {
      const startTime = action.payload.startTime >= 0 ? action.payload.startTime : 0
      const cue: SubtitleCue = {
        id: undefined,
        idInternal: nanoid(),
        text: action.payload.text,
        startTime: Math.round(startTime),
        endTime: Math.round(action.payload.endTime),
        tree: { children: [{type: 'text', value: action.payload.text}] }
      }

      // Trigger a callback in the list component that focuses the newly added element
      state.focusSegmentTriggered = true
      state.focusSegmentTriggered2 = true
      state.focusSegmentId = cue.idInternal

      if (action.payload.cueIndex < 0 ) {
        state.subtitles[action.payload.identifier].splice(0, 0, cue);
      }

      if (action.payload.cueIndex >= 0 || action.payload.cueIndex < state.subtitles[action.payload.identifier].length) {
        state.subtitles[action.payload.identifier].splice(action.payload.cueIndex, 0, cue);
      }

      if (action.payload.cueIndex >= state.subtitles[action.payload.identifier].length) {
        state.subtitles[action.payload.identifier].push(cue)
      }

      sortSubtitle(state, action.payload.identifier)
      state.hasChanges = true
    },
    removeCue: (state, action: PayloadAction<{identifier: string, cue: SubtitleCue}>) => {
      const cueIndex = state.subtitles[action.payload.identifier].findIndex(i => i.idInternal === action.payload.cue.idInternal);
      if (cueIndex > -1) {
        state.subtitles[action.payload.identifier].splice(cueIndex, 1);
      }

      sortSubtitle(state, action.payload.identifier)
      state.hasChanges = true
    },
    setSelectedSubtitleFlavor: (state, action: PayloadAction<subtitle["selectedSubtitleFlavor"]>) => {
      state.selectedSubtitleFlavor = action.payload
    },
    setFocusSegmentTriggered: (state, action: PayloadAction<subtitle["focusSegmentTriggered"]>) => {
      state.focusSegmentTriggered = action.payload
      state.focusSegmentTriggered2 = action.payload
    },
    setFocusSegmentId: (state, action: PayloadAction<subtitle["focusSegmentId"]>) => {
      state.focusSegmentId = action.payload
    },
    setFocusSegmentTriggered2: (state, action: PayloadAction<subtitle["focusSegmentTriggered2"]>) => {
      state.focusSegmentTriggered2 = action.payload
    },
    setFocusToSegmentAboveId: (state, action: PayloadAction<{identifier: string, segmentId: subtitle["focusSegmentId"]}>) => {
      let cueIndex = state.subtitles[action.payload.identifier].findIndex(i => i.idInternal === action.payload.segmentId);
      cueIndex = cueIndex - 1
      if (cueIndex < 0 ) {
        cueIndex = 0
      }
      state.focusSegmentId = state.subtitles[action.payload.identifier][cueIndex].idInternal
    },
    setFocusToSegmentBelowId: (state, action: PayloadAction<{identifier: string, segmentId: subtitle["focusSegmentId"]}>) => {
      let cueIndex = state.subtitles[action.payload.identifier].findIndex(i => i.idInternal === action.payload.segmentId);
      cueIndex = cueIndex + 1
      if (cueIndex >= state.subtitles[action.payload.identifier].length) {
        cueIndex = state.subtitles[action.payload.identifier].length - 1
      }
      state.focusSegmentId = state.subtitles[action.payload.identifier][cueIndex].idInternal
    },
    setAspectRatio: (state, action: PayloadAction<{dataKey: number} & {width: number, height: number}> ) => {
      state.aspectRatios[action.payload.dataKey] = {width: action.payload.width, height: action.payload.height}
    },
    setHasChanges: (state, action: PayloadAction<subtitle["hasChanges"]>) => {
      state.hasChanges = action.payload
    },
  },
})

// Sort a subtitle array by startTime
const sortSubtitle = (state: subtitle, identifier: string) => {
  state.subtitles[identifier].sort((a, b) => a.startTime - b.startTime)
}

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setIsPlayPreview, setPreviewTriggered, setCurrentlyAt,
  setCurrentlyAtInSeconds, setClickTriggered, setSubtitle, setCueAtIndex, addCueAtIndex, removeCue,
  setSelectedSubtitleFlavor, setFocusSegmentTriggered, setFocusSegmentId, setFocusSegmentTriggered2,
  setFocusToSegmentAboveId, setFocusToSegmentBelowId, setAspectRatio, setHasChanges } = subtitleSlice.actions

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
export const selectFocusSegmentTriggered = (state: { subtitleState: { focusSegmentTriggered: subtitle["focusSegmentTriggered"] } }) =>
  state.subtitleState.focusSegmentTriggered
export const selectFocusSegmentId = (state: { subtitleState: { focusSegmentId: subtitle["focusSegmentId"] } }) =>
  state.subtitleState.focusSegmentId
export const selectFocusSegmentTriggered2 = (state: { subtitleState: { focusSegmentTriggered2: subtitle["focusSegmentTriggered2"] } }) =>
  state.subtitleState.focusSegmentTriggered2
// Hardcoding this value to achieve a desired size for the video player
// TODO: Don't hardcode this value, instead make the video player component more flexible
export const selectAspectRatio = (state: { subtitleState: { aspectRatios: subtitle["aspectRatios"] } }) =>
  50

export const selectSubtitles = (state: { subtitleState: { subtitles: subtitle["subtitles"] } }) =>
  state.subtitleState.subtitles
export const selectSelectedSubtitleFlavor = (state: { subtitleState: { selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"] } }) =>
  state.subtitleState.selectedSubtitleFlavor
export const selectSelectedSubtitleByFlavor = (state: { subtitleState:
  { subtitles: subtitle["subtitles"]; selectedSubtitleFlavor: subtitle["selectedSubtitleFlavor"]; }; }) =>
  state.subtitleState.subtitles[state.subtitleState.selectedSubtitleFlavor]
export const selectHasChanges = (state: { subtitleState: { hasChanges: subtitle["hasChanges"] } }) =>
  state.subtitleState.hasChanges

/**
 * Alternative middleware to setCurrentlyAt.
 * Will grab the state from videoState to skip past deleted segment if preview
 * mode is active.
 */
export function setCurrentlyAtAndTriggerPreview(milliseconds: number) {
  return (dispatch: Dispatch, getState: any) => {
    milliseconds = roundToDecimalPlace(milliseconds, 0);

    if (milliseconds < 0) {
      milliseconds = 0;
    }

    const allStates = getState() as { videoState: video, subtitleState: subtitle }
    const segments: Segment[] = allStates.videoState.segments
    let triggered = false

    if (allStates.subtitleState.isPlayPreview) {
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].start < milliseconds && segments[i].end > milliseconds) {
          if (segments[i].deleted) {
            milliseconds = segments[i].end + 1
            for (let j = i; j < segments.length; j++) {
              if (segments[j].deleted) {
                milliseconds = segments[j].end + 1
              } else {
                break
              }
            }
            triggered = true
          }
          break
        }
      }
    }

    dispatch(setCurrentlyAt(milliseconds))
    if (triggered) {
      dispatch(setPreviewTriggered(true))
    }
  };
}

export default subtitleSlice.reducer
