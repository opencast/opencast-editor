import { clamp } from "lodash";
import { createSlice, nanoid, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { client } from "../util/client";

import { Segment, httpRequestState, Track, Workflow, SubtitlesFromOpencast } from "../types";
import { roundToDecimalPlace } from "../util/utilityFunctions";
import { settings } from "../config";
import { createAppAsyncThunk } from "./createAsyncThunkWithTypes";

export interface video {
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  isMuted: boolean,               // Is the volume muted?
  volume: number,                 // Video playback volume
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  clickTriggered: boolean,        // Another video player callback
  jumpTriggered: boolean,         // Another video player callback
  currentlyAt: number,            // Position in the video in milliseconds
  segments: Segment[],
  tracks: Track[],
  subtitlesFromOpencast: SubtitlesFromOpencast[],
  activeSegmentIndex: number,     // Index of the segment that is currenlty hovered
  selectedWorkflowId: string,     // Id of the currently selected workflow
  aspectRatios: { width: number, height: number; }[],  // Aspect ratios of every video
  hasChanges: boolean,            // Did user make changes in cutting view since last save
  timelineZoom: number,           // Zoom multiplicator for the timeline,
  waveformImages: string[];
  originalThumbnails: { id: Track["id"], uri: Track["thumbnailUri"]; }[];

  videoURLs: string[],  // Links to each video
  videoCount: number,   // Total number of videos
  duration: number,     // Video duration in milliseconds. Can be null due to Opencast internal error
  title: string,
  presenters: string[],
  workflows: Workflow[],

  lockingActive: boolean,     // Whether locking event editing is enabled
  lockRefresh: number | null, // Lock refresh period
  lockState: boolean,         // Whether lock has been obtained
  lock: lockData;
}

export interface lockData {
  uuid: string,
  user: string;
}

export const initialState: video & httpRequestState = {
  isPlaying: false,
  isPlayPreview: true,
  isMuted: false,
  volume: 1,
  currentlyAt: 0,   // Position in the video in milliseconds
  segments: [{ id: nanoid(), start: 0, end: 1, deleted: false }],
  tracks: [],
  subtitlesFromOpencast: [],
  activeSegmentIndex: 0,
  selectedWorkflowId: "",
  previewTriggered: false,
  clickTriggered: false,
  jumpTriggered: false,
  aspectRatios: [],
  hasChanges: false,
  timelineZoom: 1,
  waveformImages: [],
  originalThumbnails: [],

  videoURLs: [],
  videoCount: 0,
  duration: 0,
  title: "",
  presenters: [],
  workflows: [],

  lockingActive: false,
  lockRefresh: null,
  lockState: false,
  lock: { uuid: "", user: "" },

  status: "idle",
  error: undefined,
  errorReason: "unknown",
};

export const fetchVideoInformation = createAppAsyncThunk("video/fetchVideoInformation", async () => {
  if (!settings.id) {
    throw new Error("Missing media package identifier");
  }

  // const response = await client.get("https://legacy.opencast.org/admin-ng/tools/ID-dual-stream-demo/editor.json")
  const response = await client.get(`${settings.opencast.url}/editor/${settings.id}/edit.json`);
  return JSON.parse(response);
});

const updateCurrentlyAt = (state: video, milliseconds: number) => {
  state.currentlyAt = roundToDecimalPlace(milliseconds, 0);

  if (state.currentlyAt < 0) {
    state.currentlyAt = 0;
  }

  if (state.duration !== 0 && state.duration < state.currentlyAt) {
    state.currentlyAt = state.duration;
  }

  updateActiveSegment(state);
  skipDeletedSegments(state);
};

/**
 * Slice for the state of the "video"
 * Treats the multitude of videos that may exist as one video
 */
const videoSlice = createSlice({
  name: "videoState",
  initialState,
  reducers: {
    setTrackEnabled: (state, action) => {
      for (const track of state.tracks) {
        if (track.id === action.payload.id) {
          track.audio_stream.enabled = action.payload.enabled;
          track.video_stream.enabled = action.payload.enabled;
        }
      }
      state.hasChanges = true;
    },
    setIsPlaying: (state, action: PayloadAction<video["isPlaying"]>) => {
      state.isPlaying = action.payload;
    },
    setIsPlayPreview: (state, action: PayloadAction<video["isPlaying"]>) => {
      state.isPlayPreview = action.payload;
    },
    setIsMuted: (state, action: PayloadAction<video["isMuted"]>) => {
      state.isMuted = action.payload;
    },
    setVolume: (state, action: PayloadAction<video["volume"]>) => {
      state.volume = action.payload;
    },
    setPreviewTriggered: (state, action: PayloadAction<video["previewTriggered"]>) => {
      state.previewTriggered = action.payload;
    },
    setClickTriggered: (state, action: PayloadAction<video["clickTriggered"]>) => {
      state.clickTriggered = action.payload;
    },
    setJumpTriggered: (state, action: PayloadAction<video["jumpTriggered"]>) => {
      state.jumpTriggered = action.payload;
    },
    setCurrentlyAt: (state, action: PayloadAction<video["currentlyAt"]>) => {
      updateCurrentlyAt(state, action.payload);
    },
    setCurrentlyAtInSeconds: (state, action: PayloadAction<video["currentlyAt"]>) => {
      updateCurrentlyAt(state, roundToDecimalPlace(action.payload * 1000, 0));
    },
    jumpToPreviousSegment: state => {
      let previousSegmentIndex = state.activeSegmentIndex - 1;

      // Calculate the threshold for “being on a cut mark”.
      // It is based on the video length, but in between 0.5s and 3.0s.
      const threshold = Math.max(Math.min(state.duration / 100, 3000), 500);

      // Jump to start of active segment if current time is in interval [start + threshold, end)
      if (state.currentlyAt >= state.segments[state.activeSegmentIndex].start + threshold) {
        previousSegmentIndex = state.activeSegmentIndex;
      }

      // Jump to start of first segment if we are anywhere in the first segment
      if (state.activeSegmentIndex == 0) {
        previousSegmentIndex = 0;
      }

      updateCurrentlyAt(state, state.segments[previousSegmentIndex].start);
      state.jumpTriggered = true;
    },
    jumpToNextSegment: state => {
      const nextSegmentIndex = state.activeSegmentIndex + 1;
      let jumpTarget = 0;

      if (state.activeSegmentIndex + 1 >= state.segments.length) {
        // Jump to end of last segment
        jumpTarget = state.segments[state.activeSegmentIndex].end;
      } else {
        jumpTarget = state.segments[nextSegmentIndex].start;
      }

      updateCurrentlyAt(state, jumpTarget);
      state.jumpTriggered = true;
    },
    addSegment: (state, action: PayloadAction<video["segments"][0]>) => {
      state.segments.push(action.payload);
    },
    setAspectRatio: (state, action: PayloadAction<{ dataKey: number; } & { width: number, height: number; }>) => {
      state.aspectRatios[action.payload.dataKey] = { width: action.payload.width, height: action.payload.height };
    },
    setHasChanges: (state, action: PayloadAction<video["hasChanges"]>) => {
      state.hasChanges = action.payload;
    },
    setTimelineZoom: (state, action: PayloadAction<video["timelineZoom"]>) => {
      state.timelineZoom = clamp(action.payload, 1, timelineZoomMax(state));
    },
    setWaveformImages: (state, action: PayloadAction<video["waveformImages"]>) => {
      state.waveformImages = action.payload;
    },
    setThumbnail: (state, action: PayloadAction<{ id: Track["id"], uri: Track["thumbnailUri"]; }>) => {
      setThumbnailHelper(state, action.payload.id, action.payload.uri);
    },
    setThumbnails: (state, action: PayloadAction<{ id: Track["id"], uri: Track["thumbnailUri"]; }[]>) => {
      for (const element of action.payload) {
        setThumbnailHelper(state, element.id, element.uri);
      }
    },
    removeThumbnail: (state, action: PayloadAction<string>) => {
      const index = state.tracks.findIndex(t => t.id === action.payload);
      state.tracks[index].thumbnailUri = undefined;
    },
    setLock: (state, action: PayloadAction<video["lockState"]>) => {
      state.lockState = action.payload;
    },
    cut: state => {
      // If we"re exactly between two segments, we can"t split the current segment
      if (state.segments[state.activeSegmentIndex].start === state.currentlyAt ||
        state.segments[state.activeSegmentIndex].end === state.currentlyAt) {
        return;
      }

      // Make two (new) segments out of it
      const segmentA: Segment = {
        id: nanoid(),
        start: state.segments[state.activeSegmentIndex].start,
        end: state.currentlyAt,
        deleted: state.segments[state.activeSegmentIndex].deleted,
      };
      const segmentB: Segment = {
        id: nanoid(),
        start: state.currentlyAt,
        end: state.segments[state.activeSegmentIndex].end,
        deleted: state.segments[state.activeSegmentIndex].deleted,
      };

      // Add the new segments and remove the old one
      state.segments.splice(state.activeSegmentIndex, 1, segmentA, segmentB);

      state.hasChanges = true;
    },
    moveCut: (
      state,
      action: PayloadAction<{ leftSegmentIndex: number, time: Segment["start"] }>
    ) => {
      const leftSegmentIndex = action.payload.leftSegmentIndex;
      const rightSegmentIndex = action.payload.leftSegmentIndex + 1;
      const time = roundToDecimalPlace(action.payload.time, 0);

      if (leftSegmentIndex < 0 || rightSegmentIndex >= state.segments.length) {
        return;
      }

      // Merge overlapping left cut
      if (time <= state.segments[leftSegmentIndex].start) {
        mergeSegments(state, rightSegmentIndex, leftSegmentIndex);
        state.hasChanges = true;
        return;
      }

      // Merge overlapping right cut
      if (time >= state.segments[rightSegmentIndex].end) {
        mergeSegments(state, leftSegmentIndex, rightSegmentIndex);
        state.hasChanges = true;
        return;
      }

      // Move segment edges
      state.segments[leftSegmentIndex].end = time;
      state.segments[rightSegmentIndex].start = time;
      state.hasChanges = true;
    },
    markAsDeletedOrAlive: state => {
      state.segments[state.activeSegmentIndex].deleted = !state.segments[state.activeSegmentIndex].deleted;
      state.hasChanges = true;
    },
    setSelectedWorkflowIndex: (state, action: PayloadAction<video["selectedWorkflowId"]>) => {
      state.selectedWorkflowId = action.payload;
    },
    mergeLeft: state => {
      mergeSegments(state, state.activeSegmentIndex, state.activeSegmentIndex - 1);
      state.hasChanges = true;
    },
    mergeRight: state => {
      mergeSegments(state, state.activeSegmentIndex, state.activeSegmentIndex + 1);
      state.hasChanges = true;
    },
    mergeAll: state => {
      mergeSegments(state, state.activeSegmentIndex, 0);
      mergeSegments(state, state.activeSegmentIndex, state.segments.length - 1);
      state.hasChanges = true;
    },
    timelineZoomIn: state => {
      state.timelineZoom = clamp(state.timelineZoom + 1, 1, timelineZoomMax(state));
    },
    timelineZoomOut: state => {
      state.timelineZoom = clamp(state.timelineZoom - 1, 1, timelineZoomMax(state));
    },
  },
  // For Async Requests
  extraReducers: builder => {
    builder.addCase(
      fetchVideoInformation.pending, (state, _action) => {
        state.status = "loading";
      });
    builder.addCase(
      fetchVideoInformation.fulfilled, (state, action) => {
        state.status = "success";

        if (action.payload.workflow_active) {
          state.status = "failed";
          state.errorReason = "workflowActive";
          state.error = "This event is being processed. Please wait until the process is finished.";
        }
        state.tracks = action.payload.tracks
          .sort((a: { thumbnailPriority: number; }, b: { thumbnailPriority: number; }) => {
            return a.thumbnailPriority - b.thumbnailPriority;
          }).map((track: Track) => {
            if (action.payload.local && settings.opencast.local) {
              console.debug("Replacing track URL");
              track.uri = track.uri.replace(/https?:\/\/[^/]*/g, window.location.origin);
            }
            return track;
          });
        const videos = state.tracks.filter((track: Track) => track.video_stream.available === true);
        // eslint-disable-next-line no-sequences
        state.videoURLs = videos.reduce((a: string[], o: { uri: string; }) => (a.push(o.uri), a), []);
        state.videoCount = state.videoURLs.length;
        state.subtitlesFromOpencast = action.payload.subtitles ?
          state.subtitlesFromOpencast = action.payload.subtitles : [];
        state.duration = action.payload.duration;
        state.title = action.payload.title;
        state.segments = parseSegments(action.payload.segments, action.payload.duration);
        state.workflows = action.payload.workflows;
        state.waveformImages = action.payload.waveformURIs ? action.payload.waveformURIs : state.waveformImages;
        state.originalThumbnails = state.tracks.map(
          (track: Track) => { return { id: track.id, uri: track.thumbnailUri }; }
        );

        state.aspectRatios = new Array(state.videoCount);
        state.lockingActive = action.payload.locking_active;
        state.lockRefresh = action.payload.lock_refresh;
        state.lock.uuid = action.payload.lock_uuid;
        state.lock.user = action.payload.lock_user;
      });
    builder.addCase(
      fetchVideoInformation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
  selectors: {
    // Selectors mainly pertaining to the video state
    selectIsPlaying: state => state.isPlaying,
    selectIsPlayPreview: state => state.isPlayPreview,
    selectIsMuted: state => state.isMuted,
    selectVolume: state => state.volume,
    selectPreviewTriggered: state => state.previewTriggered,
    selectClickTriggered: state => state.clickTriggered,
    selectJumpTriggered: state => state.jumpTriggered,
    selectCurrentlyAt: state => state.currentlyAt,
    selectCurrentlyAtInSeconds: state => state.currentlyAt / 1000,
    selectSegments: state => state.segments,
    selectActiveSegmentIndex: state => state.activeSegmentIndex,
    selectIsCurrentSegmentAlive: state => !state.segments[state.activeSegmentIndex].deleted,
    selectSelectedWorkflowId: state => state.selectedWorkflowId,
    selectHasChanges: state => state.hasChanges,
    selectTimelineZoom: state => state.timelineZoom,
    selectTimelineZoomMax: timelineZoomMax,
    selectWaveformImages: state => state.waveformImages,
    selectOriginalThumbnails: state => state.originalThumbnails,
    // Selectors mainly pertaining to the information fetched from Opencast
    selectVideoURL: state => state.videoURLs,
    selectVideoCount: state => state.videoCount,
    selectDuration: state => state.duration,
    selectDurationInSeconds: state => state.duration / 1000,
    selectTitle: state => state.title,
    selectTracks: state => state.tracks,
    selectWorkflows: state => state.workflows,
    selectAspectRatio: state => calculateTotalAspectRatio(state.aspectRatios),
    selectSubtitlesFromOpencast: state => state.subtitlesFromOpencast,
    selectSubtitlesFromOpencastById: (state, id: string) => {
      for (const cap of state.subtitlesFromOpencast) {
        if (cap.id === id) {
          return cap;
        }
      }
      return undefined;
    },
  },
});

/**
 * Helper function to update the activeSegmentIndex
 * @param state
 */
const updateActiveSegment = (state: video) => {
  state.activeSegmentIndex = state.segments.findLastIndex(element =>
    element.start <= state.currentlyAt && element.end >= state.currentlyAt);
  // If there is an error, assume the first (the starting) segment
  if (state.activeSegmentIndex < 0) {
    state.activeSegmentIndex = 0;
  }
};

/**
 * Helper Function for testing with current/old editor API
 */
export const parseSegments = (segments: Segment[], duration: number) => {
  const newSegments: Segment[] = [];

  if (segments.length === 0) {
    newSegments.push({ id: nanoid(), start: 0, end: duration, deleted: false });
  }

  segments.forEach((segment: Segment) => {
    newSegments.push({ id: nanoid(), start: segment.start, end: segment.end, deleted: segment.deleted });
  });
  return newSegments;
};

/**
 * Helper function for merging segments
 */
const mergeSegments = (state: video, startSegmentIndex: number, endSegmentIndex: number) => {
  // Check if mergeSegmentIndex is valid
  if (endSegmentIndex < 0 || endSegmentIndex > state.segments.length - 1) {
    return;
  }

  // Increase activeSegment length
  state.segments[startSegmentIndex].start = Math.min(
    state.segments[startSegmentIndex].start, state.segments[endSegmentIndex].start);
  state.segments[startSegmentIndex].end = Math.max(
    state.segments[startSegmentIndex].end, state.segments[endSegmentIndex].end);

  // Remove the end segment and segments between
  state.segments.splice(
    startSegmentIndex < endSegmentIndex ? startSegmentIndex + 1 : endSegmentIndex,
    Math.abs(endSegmentIndex - startSegmentIndex)
  );

  // Update active segment
  updateActiveSegment(state);
};

const skipDeletedSegments = (state: video) => {
  if (state.isPlaying && state.segments[state.activeSegmentIndex].deleted && state.isPlayPreview) {
    let endTime = state.segments[state.activeSegmentIndex].end;

    for (let index = state.activeSegmentIndex; index < state.segments.length; index++) {
      endTime = state.segments[index].end;

      if (!state.segments[index].deleted) {
        // Need to at +1 as start and end of neighbouring segments are identical
        endTime = state.segments[index].start + 1;
        break;
      }

      // If this is the last segment and it is deleted
      if (index + 1 === state.segments.length) {
        // Properly pause the player
        state.isPlaying = false;
        // Jump to start of first non-deleted segment
        for (let j = 0; j < state.segments.length; j++) {
          if (!state.segments[j].deleted) {
            endTime = state.segments[j].start;
            break;
          }
        }
      }
    }

    state.currentlyAt = endTime;
    state.previewTriggered = true;
    updateActiveSegment(state);
  }
};

/**
 * Calculates a total aspect ratio for the video player wrappers,
 * based on the aspect ratio of all videos.
 * Returns the total aspect ratio in percent,
 * or returns a default aspect ratio to limit the height of the video player area
 * TODO: Error checking
 * TODO: Improve calculation to handle multiple rows of videos
 */
export const calculateTotalAspectRatio = (aspectRatios: video["aspectRatios"]) => {
  let minHeight = Math.min(...aspectRatios.map(o => o.height));
  let minWidth = Math.min(...aspectRatios.map(o => o.width));
  // Getting the aspect ratios of every video can take several seconds
  // So we assume a default resolution until then
  if (!minHeight || !minWidth) {
    minHeight = 720;
    minWidth = 1280;
  }
  minWidth *= aspectRatios.length;
  return Math.min((minHeight / minWidth) * 100, (9 / 32) * 100);
};

const setThumbnailHelper = (state: video, id: Track["id"], uri: Track["thumbnailUri"]) => {
  const index = state.tracks.findIndex(t => t.id === id);
  if (index >= 0) {
    state.tracks[index].thumbnailUri = uri;
  }
};

const ZOOM_SECONDS_VISIBLE = 20 * 1000;

function timelineZoomMax(state: { duration: number }) {
  const maxZoom = state.duration / ZOOM_SECONDS_VISIBLE;

  return Math.max(2, Math.ceil(maxZoom));
}

export const {
  setTrackEnabled,
  setIsPlaying,
  setIsPlayPreview,
  setIsMuted,
  setVolume,
  setCurrentlyAt,
  setCurrentlyAtInSeconds,
  addSegment,
  setAspectRatio,
  setHasChanges,
  setWaveformImages,
  setThumbnails,
  setThumbnail,
  removeThumbnail,
  setLock,
  cut,
  moveCut,
  markAsDeletedOrAlive,
  setSelectedWorkflowIndex,
  mergeLeft,
  mergeRight,
  mergeAll,
  setPreviewTriggered,
  setClickTriggered,
  setTimelineZoom,
  timelineZoomIn,
  timelineZoomOut,
  setJumpTriggered,
  jumpToPreviousSegment,
  jumpToNextSegment,
} = videoSlice.actions;

export const selectVideos = createSelector(
  [(state: { videoState: { tracks: video["tracks"]; }; }) => state.videoState.tracks],
  tracks => tracks.filter((track: Track) => track.video_stream.available === true)
);

// Export selectors
export const {
  selectIsPlaying,
  selectIsPlayPreview,
  selectIsMuted,
  selectVolume,
  selectPreviewTriggered,
  selectClickTriggered,
  selectJumpTriggered,
  selectCurrentlyAt,
  selectCurrentlyAtInSeconds,
  selectSegments,
  selectActiveSegmentIndex,
  selectIsCurrentSegmentAlive,
  selectSelectedWorkflowId,
  selectHasChanges,
  selectTimelineZoom,
  selectTimelineZoomMax,
  selectWaveformImages,
  selectOriginalThumbnails,
  selectVideoURL,
  selectVideoCount,
  selectDuration,
  selectDurationInSeconds,
  selectTitle,
  selectTracks,
  selectWorkflows,
  selectAspectRatio,
  selectSubtitlesFromOpencast,
  selectSubtitlesFromOpencastById,
} = videoSlice.selectors;

export default videoSlice.reducer;
