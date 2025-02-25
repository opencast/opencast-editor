import { Segment, SubtitleCue, SubtitlesInEditor } from "./../types";
import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { roundToDecimalPlace } from "../util/utilityFunctions";
import { createAppAsyncThunk } from "./createAsyncThunkWithTypes";

export interface subtitle {
  isDisplayEditView: boolean;    // Should the edit view be displayed
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  currentlyAt: number,            // Position in the video in milliseconds
  clickTriggered: boolean,        // Another video player callback
  subtitles: { [identifier: string]: SubtitlesInEditor; },
  selectedSubtitleId: string,
  aspectRatios: { width: number, height: number; }[],  // Aspect ratios of every video
  focusSegmentTriggered: boolean,   // a segment in the timeline was clicked
  focusSegmentId: string,           // which segment in the timeline was clicked
  // a different trigger for a child component, to avoid additional rerenders from the parent
  focusSegmentTriggered2: boolean,

  hasChanges: boolean;         // Did user make changes to metadata view since last save
}

const initialState: subtitle = {
  isDisplayEditView: false,
  isPlaying: false,
  isPlayPreview: true,
  previewTriggered: false,
  currentlyAt: 0,
  clickTriggered: false,
  subtitles: {},
  selectedSubtitleId: "",
  focusSegmentTriggered: false,
  focusSegmentId: "",
  focusSegmentTriggered2: false,

  aspectRatios: [],
  hasChanges: false,
};

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
  name: "subtitleState",
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
    setPreviewTriggered: (state, action: PayloadAction<subtitle["previewTriggered"]>) => {
      state.previewTriggered = action.payload;
    },
    setCurrentlyAt: (state, action: PayloadAction<subtitle["currentlyAt"]>) => {
      updateCurrentlyAt(state, action.payload);
    },
    setCurrentlyAtInSeconds: (state, action: PayloadAction<subtitle["currentlyAt"]>) => {
      updateCurrentlyAt(state, roundToDecimalPlace(action.payload * 1000, 0));
    },
    setClickTriggered: (state, action) => {
      state.clickTriggered = action.payload;
    },
    setSubtitle: (state, action: PayloadAction<{ identifier: string, subtitles: SubtitlesInEditor; }>) => {
      state.subtitles[action.payload.identifier] = action.payload.subtitles;
    },
    removeSubtitle: (state, action: PayloadAction<{ identifier: string; }>) => {
      state.subtitles[action.payload.identifier].deleted = true;
      state.hasChanges = true;
    },
    setCueAtIndex: (state, action: PayloadAction<{ identifier: string, cueIndex: number, newCue: SubtitleCue; }>) => {
      if (action.payload.cueIndex < 0 ||
        action.payload.cueIndex >= state.subtitles[action.payload.identifier].cues.length) {
        console.warn("Tried to set segment for subtitle " + action.payload.identifier +
          " but was out of range");
        return;
      }

      const cue = state.subtitles[action.payload.identifier].cues[action.payload.cueIndex];
      cue.id = action.payload.newCue.id;
      cue.idInternal = action.payload.newCue.idInternal;
      cue.text = action.payload.newCue.text;
      cue.startTime = Math.round(action.payload.newCue.startTime);
      cue.endTime = Math.round(action.payload.newCue.endTime);

      if (cue.tree.children.length <= 0) {
        cue.tree.children[0] = { type: "text", value: action.payload.newCue.text };
      }
      cue.tree.children[0].value = action.payload.newCue.text;

      state.subtitles[action.payload.identifier].cues[action.payload.cueIndex] = cue;

      sortSubtitle(state, action.payload.identifier);
      state.hasChanges = true;
    },
    addCueAtIndex: (
      state,
      action: PayloadAction<{
        identifier: string,
        cueIndex: number,
        text: string,
        startTime: number,
        endTime: number,
      }>,
    ) => {
      const startTime = action.payload.startTime >= 0 ? action.payload.startTime : 0;
      const cue: SubtitleCue = {
        id: undefined,
        idInternal: nanoid(),
        text: action.payload.text,
        startTime: Math.round(startTime),
        endTime: Math.round(action.payload.endTime),
        tree: { children: [{ type: "text", value: action.payload.text }] },
      };

      // Trigger a callback in the list component that focuses the newly added element
      state.focusSegmentTriggered = true;
      state.focusSegmentTriggered2 = true;
      state.focusSegmentId = cue.idInternal;

      if (action.payload.cueIndex < 0) {
        state.subtitles[action.payload.identifier].cues.splice(0, 0, cue);
      }

      if (action.payload.cueIndex >= 0 ||
        action.payload.cueIndex < state.subtitles[action.payload.identifier].cues.length) {
        state.subtitles[action.payload.identifier].cues.splice(action.payload.cueIndex, 0, cue);
      }

      if (action.payload.cueIndex >= state.subtitles[action.payload.identifier].cues.length) {
        state.subtitles[action.payload.identifier].cues.push(cue);
      }

      sortSubtitle(state, action.payload.identifier);
      state.hasChanges = true;
    },
    removeCue: (state, action: PayloadAction<{ identifier: string, cue: SubtitleCue; }>) => {
      const cueIndex = state.subtitles[action.payload.identifier].cues.findIndex(
        i => i.idInternal === action.payload.cue.idInternal,
      );
      if (cueIndex > -1) {
        state.subtitles[action.payload.identifier].cues.splice(cueIndex, 1);
      }

      sortSubtitle(state, action.payload.identifier);
      state.hasChanges = true;
    },
    setSelectedSubtitleId: (state, action: PayloadAction<subtitle["selectedSubtitleId"]>) => {
      state.selectedSubtitleId = action.payload;
    },
    setFocusSegmentTriggered: (state, action: PayloadAction<subtitle["focusSegmentTriggered"]>) => {
      state.focusSegmentTriggered = action.payload;
      state.focusSegmentTriggered2 = action.payload;
    },
    setFocusSegmentId: (state, action: PayloadAction<subtitle["focusSegmentId"]>) => {
      state.focusSegmentId = action.payload;
    },
    setFocusSegmentTriggered2: (state, action: PayloadAction<subtitle["focusSegmentTriggered2"]>) => {
      state.focusSegmentTriggered2 = action.payload;
    },
    setFocusToSegmentAboveId: (
      state,
      action: PayloadAction<{ identifier: string, segmentId: subtitle["focusSegmentId"]; }>,
    ) => {
      let cueIndex = state.subtitles[action.payload.identifier].cues.findIndex(
        i => i.idInternal === action.payload.segmentId,
      );
      cueIndex = cueIndex - 1;
      if (cueIndex < 0) {
        cueIndex = 0;
      }
      state.focusSegmentId = state.subtitles[action.payload.identifier].cues[cueIndex].idInternal;
    },
    setFocusToSegmentBelowId: (
      state,
      action: PayloadAction<{ identifier: string, segmentId: subtitle["focusSegmentId"]; }>,
    ) => {
      let cueIndex = state.subtitles[action.payload.identifier].cues.findIndex(
        i => i.idInternal === action.payload.segmentId,
      );
      cueIndex = cueIndex + 1;
      if (cueIndex >= state.subtitles[action.payload.identifier].cues.length) {
        cueIndex = state.subtitles[action.payload.identifier].cues.length - 1;
      }
      state.focusSegmentId = state.subtitles[action.payload.identifier].cues[cueIndex].idInternal;
    },
    setAspectRatio: (state, action: PayloadAction<{ dataKey: number; } & { width: number, height: number; }>) => {
      state.aspectRatios[action.payload.dataKey] = { width: action.payload.width, height: action.payload.height };
    },
    setHasChanges: (state, action: PayloadAction<subtitle["hasChanges"]>) => {
      state.hasChanges = action.payload;
    },
  },
  selectors: {
    selectIsDisplayEditView: state => state.isDisplayEditView,
    selectIsPlaying: state => state.isPlaying,
    selectIsPlayPreview: state => state.isPlayPreview,
    selectPreviewTriggered: state => state.previewTriggered,
    selectCurrentlyAt: state => state.currentlyAt,
    selectCurrentlyAtInSeconds: state => state.currentlyAt / 1000,
    selectClickTriggered: state => state.clickTriggered,
    selectFocusSegmentTriggered: state => state.focusSegmentTriggered,
    selectFocusSegmentId: state => state.focusSegmentId,
    selectFocusSegmentTriggered2: state => state.focusSegmentTriggered2,
    // Hardcoding this value to achieve a desired size for the video player
    // TODO: Don"t hardcode this value, instead make the video player component more flexible
    selectAspectRatio: () => 50,
    selectSubtitles: state => state.subtitles,
    selectSelectedSubtitleId: state => state.selectedSubtitleId,
    selectSelectedSubtitleById: state => state.subtitles[state.selectedSubtitleId],
    selectHasChanges: state => state.hasChanges,
  },
});

// Sort a subtitle array by startTime
const sortSubtitle = (state: subtitle, identifier: string) => {
  state.subtitles[identifier].cues.sort((a, b) => a.startTime - b.startTime);
};

// Export Actions
export const { setIsDisplayEditView, setIsPlaying, setIsPlayPreview, setPreviewTriggered, setCurrentlyAt,
  setCurrentlyAtInSeconds, setClickTriggered, setSubtitle, removeSubtitle, setCueAtIndex, addCueAtIndex, removeCue,
  setSelectedSubtitleId, setFocusSegmentTriggered, setFocusSegmentId, setFocusSegmentTriggered2,
  setFocusToSegmentAboveId, setFocusToSegmentBelowId, setAspectRatio, setHasChanges } = subtitleSlice.actions;

export const {
  selectIsDisplayEditView,
  selectIsPlaying,
  selectIsPlayPreview,
  selectPreviewTriggered,
  selectCurrentlyAt,
  selectCurrentlyAtInSeconds,
  selectClickTriggered,
  selectFocusSegmentTriggered,
  selectFocusSegmentId,
  selectFocusSegmentTriggered2,
  selectAspectRatio,
  selectSubtitles,
  selectSelectedSubtitleId,
  selectSelectedSubtitleById,
  selectHasChanges,
} = subtitleSlice.selectors;

/**
 * Alternative middleware to setCurrentlyAt.
 * Will grab the state from videoState to skip past deleted segment if preview
 * mode is active.
 */
export const setCurrentlyAtAndTriggerPreview = createAppAsyncThunk("subtitleState/setCurrentlyAtAndTriggerPreview",
  async (milliseconds: number, { getState, dispatch }) => {
    milliseconds = roundToDecimalPlace(milliseconds, 0);

    if (milliseconds < 0) {
      milliseconds = 0;
    }

    const allStates = getState();
    const segments: Segment[] = allStates.videoState.segments;
    let triggered = false;

    if (allStates.subtitleState.isPlayPreview) {
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].start < milliseconds && segments[i].end > milliseconds) {
          if (segments[i].deleted) {
            milliseconds = segments[i].end + 1;
            for (let j = i; j < segments.length; j++) {
              if (segments[j].deleted) {
                milliseconds = segments[j].end + 1;
              } else {
                break;
              }
            }
            triggered = true;
          }
          break;
        }
      }
    }

    dispatch(setCurrentlyAt(milliseconds));
    if (triggered) {
      dispatch(setPreviewTriggered(true));
    }
  });

export default subtitleSlice.reducer;
