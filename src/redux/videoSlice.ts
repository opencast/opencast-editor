import { createSlice, nanoid, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { client } from '../util/client'

import { Segment, httpRequestState, Track, Workflow, SubtitlesFromOpencast } from '../types'
import { roundToDecimalPlace } from '../util/utilityFunctions'
import { settings } from '../config';

export interface video {
  isPlaying: boolean,             // Are videos currently playing?
  isPlayPreview: boolean,         // Should deleted segments be skipped?
  previewTriggered: boolean,      // Basically acts as a callback for the video players.
  clickTriggered: boolean,        // Another video player callback
  currentlyAt: number,            // Position in the video in milliseconds
  segments: Segment[],
  tracks: Track[],
  captions: SubtitlesFromOpencast[],
  activeSegmentIndex: number,     // Index of the segment that is currenlty hovered
  selectedWorkflowId: string,     // Id of the currently selected workflow
  aspectRatios: {width: number, height: number}[],  // Aspect ratios of every video
  hasChanges: boolean,             // Did user make changes in cutting view since last save
  waveformImages: string[]
  originalThumbnails: {id: Track["id"], uri: Track["thumbnailUri"]}[]

  videoURLs: string[],  // Links to each video
  videoCount: number,   // Total number of videos
  duration: number,     // Video duration in milliseconds. Can be null due to Opencast internal error
  title: string,
  presenters: string[],
  workflows: Workflow[],
}

export const initialState: video & httpRequestState = {
  isPlaying: false,
  isPlayPreview: true,
  currentlyAt: 0,   // Position in the video in milliseconds
  segments: [{id: nanoid(), start: 0, end: 1, deleted: false}],
  tracks: [],
  captions: [],
  activeSegmentIndex: 0,
  selectedWorkflowId: "",
  previewTriggered: false,
  clickTriggered: false,
  aspectRatios: [],
  hasChanges: false,
  waveformImages: [],
  originalThumbnails: [],

  videoURLs: [],
  videoCount: 0,
  duration: 0,
  title: '',
  presenters: [],
  workflows: [],

  status: 'idle',
  error: undefined,
  errorReason: 'unknown',
}

export const fetchVideoInformation = createAsyncThunk('video/fetchVideoInformation', async () => {
  if (!settings.id) {
    throw new Error("Missing media package identifier")
  }

  // const response = await client.get('https://legacy.opencast.org/admin-ng/tools/ID-dual-stream-demo/editor.json')
  const response = await client.get(`${settings.opencast.url}/editor/${settings.id}/edit.json`)
  return JSON.parse(response)
})

const updateCurrentlyAt = (state: video, milliseconds: number) => {
  state.currentlyAt = roundToDecimalPlace(milliseconds, 0);

  if (state.currentlyAt < 0) {
    state.currentlyAt = 0;
  }

  if (state.duration !== 0 && state.duration < state.currentlyAt) {
    state.currentlyAt = state.duration
  }

  updateActiveSegment(state);
  skipDeletedSegments(state);
};

/**
 * Slice for the state of the "video"
 * Treats the multitude of videos that may exist as one video
 */
const videoSlice = createSlice({
  name: 'videoState',
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
    setPreviewTriggered: (state, action) => {
      state.previewTriggered = action.payload
    },
    setClickTriggered: (state, action) => {
      state.clickTriggered = action.payload
    },
    setCurrentlyAt: (state, action: PayloadAction<video["currentlyAt"]>) => {
      updateCurrentlyAt(state, action.payload);
    },
    setCurrentlyAtInSeconds: (state, action: PayloadAction<video["currentlyAt"]>) => {
      updateCurrentlyAt(state, roundToDecimalPlace(action.payload * 1000, 0))
    },
    addSegment: (state, action: PayloadAction<video["segments"][0]>) => {
      state.segments.push(action.payload)
    },
    setAspectRatio: (state, action: PayloadAction<{dataKey: number} & {width: number, height: number}>) => {
      state.aspectRatios[action.payload.dataKey] = {width: action.payload.width, height: action.payload.height}
    },
    setHasChanges: (state, action: PayloadAction<video["hasChanges"]>) => {
      state.hasChanges = action.payload
    },
    setWaveformImages: (state, action: PayloadAction<video["waveformImages"]>) => {
      state.waveformImages = action.payload
    },
    setThumbnail: (state, action: PayloadAction<{id: Track["id"], uri: Track["thumbnailUri"]}>) => {
      setThumbnailHelper(state, action.payload.id, action.payload.uri)
    },
    setThumbnails: (state, action: PayloadAction<{id: Track["id"], uri: Track["thumbnailUri"]}[]>) => {
      for (const element of action.payload) {
        setThumbnailHelper(state, element.id, element.uri)
      }
    },
    removeThumbnail: (state, action: PayloadAction<string>) => {
      const index = state.tracks.findIndex(t => t.id === action.payload)
      state.tracks[index].thumbnailUri = undefined
    },
    cut: (state) => {
      // If we're exactly between two segments, we can't split the current segment
      if (state.segments[state.activeSegmentIndex].start === state.currentlyAt ||
          state.segments[state.activeSegmentIndex].end === state.currentlyAt) {
        return
      }

      // Make two (new) segments out of it
      const segmentA : Segment = {id: nanoid(),
        start: state.segments[state.activeSegmentIndex].start,
        end: state.currentlyAt,
        deleted: state.segments[state.activeSegmentIndex].deleted}
      const segmentB : Segment = {id: nanoid(),
        start: state.currentlyAt,
        end: state.segments[state.activeSegmentIndex].end,
        deleted: state.segments[state.activeSegmentIndex].deleted}

      // Add the new segments and remove the old one
      state.segments.splice(state.activeSegmentIndex, 1, segmentA, segmentB);

      state.hasChanges = true
    },
    markAsDeletedOrAlive: (state) => {
      state.segments[state.activeSegmentIndex].deleted = !state.segments[state.activeSegmentIndex].deleted
      state.hasChanges = true
    },
    setSelectedWorkflowIndex: (state, action: PayloadAction<video["selectedWorkflowId"]>) => {
      state.selectedWorkflowId = action.payload
    },
    mergeLeft: (state) => {
      mergeSegments(state, state.activeSegmentIndex, state.activeSegmentIndex - 1)
      state.hasChanges = true
    },
    mergeRight: (state) => {
      mergeSegments(state, state.activeSegmentIndex, state.activeSegmentIndex + 1)
      state.hasChanges = true
    },
  },
  // For Async Requests
  extraReducers: builder => {
    builder.addCase(
      fetchVideoInformation.pending, (state, action) => {
        state.status = 'loading'
      })
    builder.addCase(
      fetchVideoInformation.fulfilled, (state, action) => {
        state.status = 'success'

        if (action.payload.workflow_active) {
          state.status = 'failed'
          state.errorReason = 'workflowActive'
          state.error = "This event is being processed. Please wait until the process is finished."
        }
        state.tracks = action.payload.tracks
          .sort((a: { thumbnailPriority: number; }, b: { thumbnailPriority: number; }) => {
            return a.thumbnailPriority - b.thumbnailPriority
          }).map((track: Track) => {
            if (action.payload.local && settings.opencast.local) {
              console.debug('Replacing track URL')
              track.uri = track.uri.replace(/https?:\/\/[^/]*/g, window.location.origin)
            }
            return track
          })
        const videos = state.tracks.filter((track: Track) => track.video_stream.available === true)
        // eslint-disable-next-line no-sequences
        state.videoURLs = videos.reduce((a: string[], o: { uri: string }) => (a.push(o.uri), a), [])
        state.videoCount = state.videoURLs.length
        state.captions = action.payload.subtitles ? state.captions = action.payload.subtitles : []
        state.duration = action.payload.duration
        state.title = action.payload.title
        state.segments = parseSegments(action.payload.segments, action.payload.duration)
        state.workflows = action.payload.workflows.sort((n1: { displayOrder: number; }, n2: { displayOrder: number; }) => {
          return n1.displayOrder - n2.displayOrder;
        });
        state.waveformImages = action.payload.waveformURIs ? action.payload.waveformURIs : state.waveformImages
        state.originalThumbnails = state.tracks.map((track: Track) => { return {id: track.id, uri: track.thumbnailUri} })

        state.aspectRatios = new Array(state.videoCount)
      })
    builder.addCase(
      fetchVideoInformation.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})

/**
 * Helper function to update the activeSegmentIndex
 * @param state
 */
const updateActiveSegment = (state: video) => {
  state.activeSegmentIndex = state.segments.findIndex(element =>
    element.start <= state.currentlyAt && element.end >= state.currentlyAt)
  // If there is an error, assume the first (the starting) segment
  if(state.activeSegmentIndex < 0) {
    state.activeSegmentIndex = 0
  }
}

/**
 * Helper Function for testing with current/old editor API
 */
export const parseSegments = (segments: Segment[], duration: number) => {
  const newSegments : Segment[] = []

  if (segments.length === 0) {
    newSegments.push({id: nanoid(), start: 0, end: duration, deleted: false})
  }

  segments.forEach((segment: Segment) => {
    newSegments.push({id: nanoid(), start: segment.start, end: segment.end, deleted: segment.deleted})
  });
  return newSegments
}

/**
 * Helper function for merging two segments
 */
const mergeSegments = (state: video, activeSegmentIndex: number, mergeSegmentIndex: number) => {
  // Check if mergeSegmentIndex is valid
  if (mergeSegmentIndex < 0 || mergeSegmentIndex > state.segments.length - 1) {
    return
  }

  // Increase activeSegment length
  state.segments[activeSegmentIndex].start = Math.min(
    state.segments[activeSegmentIndex].start, state.segments[mergeSegmentIndex].start)
  state.segments[activeSegmentIndex].end = Math.max(
    state.segments[activeSegmentIndex].end, state.segments[mergeSegmentIndex].end)

  // Remove the other segment
  state.segments.splice(mergeSegmentIndex, 1);

  // Update active segment
  updateActiveSegment(state)
}

const skipDeletedSegments = (state: video) => {
  if(state.isPlaying && state.segments[state.activeSegmentIndex].deleted && state.isPlayPreview) {
    let endTime = state.segments[state.activeSegmentIndex].end

    for (let index = state.activeSegmentIndex; index < state.segments.length; index++) {
      endTime = state.segments[index].end

      if (!state.segments[index].deleted) {
        // Need to at +1 as start and end of neighbouring segments are identical
        endTime = state.segments[index].start + 1
        break
      }

      // If this is the last segment and it is deleted
      if (index + 1 === state.segments.length) {
        // Properly pause the player
        state.isPlaying = false
        // Jump to start of first non-deleted segment
        for (let j = 0; j < state.segments.length; j++) {
          if (!state.segments[j].deleted) {
            endTime = state.segments[j].start
            break
          }
        }
      }
    }

    state.currentlyAt = endTime
    state.previewTriggered = true
    updateActiveSegment(state);
  }
}

/**
 * Calculates a total aspect ratio for the video player wrappers,
 * based on the aspect ratio of all videos.
 * Returns the total aspect ratio in percent,
 * or returns a default aspect ratio to limit the height of the video player area
 * TODO: Error checking
 * TODO: Improve calculation to handle multiple rows of videos
 */
export const calculateTotalAspectRatio = (aspectRatios: video["aspectRatios"]) => {
  const minHeight = Math.min(...aspectRatios.map(o => o.height))
  let minWidth = Math.min(...aspectRatios.map(o => o.width))
  minWidth *= aspectRatios.length
  return Math.min((minHeight / minWidth) * 100, (9/32) * 100)
}

const setThumbnailHelper = (state: video, id: Track["id"], uri: Track["thumbnailUri"]) => {
  const index = state.tracks.findIndex(t => t.id === id)
  if (index >= 0) {
    state.tracks[index].thumbnailUri = uri
  }
}

export const { setTrackEnabled, setIsPlaying, setIsPlayPreview, setCurrentlyAt, setCurrentlyAtInSeconds,
  addSegment, setAspectRatio, setHasChanges, setWaveformImages, setThumbnails, setThumbnail, removeThumbnail,
  cut, markAsDeletedOrAlive, setSelectedWorkflowIndex, mergeLeft, mergeRight, setPreviewTriggered,
  setClickTriggered } = videoSlice.actions

// Export selectors
// Selectors mainly pertaining to the video state
export const selectIsPlaying = (state: { videoState: { isPlaying: video["isPlaying"] }; }) =>
  state.videoState.isPlaying
export const selectIsPlayPreview = (state: { videoState: { isPlayPreview: video["isPlayPreview"] }; }) =>
  state.videoState.isPlayPreview
export const selectPreviewTriggered = (state: { videoState: { previewTriggered: video["previewTriggered"] } }) =>
  state.videoState.previewTriggered
export const selectClickTriggered = (state: { videoState: { clickTriggered: video["clickTriggered"] } }) =>
  state.videoState.clickTriggered
export const selectCurrentlyAt = (state: { videoState: { currentlyAt: video["currentlyAt"]; }; }) =>
  state.videoState.currentlyAt
export const selectCurrentlyAtInSeconds = (state: { videoState: { currentlyAt: video["currentlyAt"]; }; }) =>
  state.videoState.currentlyAt / 1000
export const selectSegments = (state: { videoState: { segments: video["segments"] } }) =>
  state.videoState.segments
export const selectActiveSegmentIndex = (state: { videoState: { activeSegmentIndex: video["activeSegmentIndex"]; }; }) =>
  state.videoState.activeSegmentIndex
export const selectIsCurrentSegmentAlive = (state: { videoState:
  { segments: { [x: number]: { deleted: boolean; }; }; activeSegmentIndex: video["activeSegmentIndex"]; }; }) =>
  !state.videoState.segments[state.videoState.activeSegmentIndex].deleted
export const selectSelectedWorkflowId = (state: { videoState:
    { selectedWorkflowId: video["selectedWorkflowId"]; }; }) =>
  state.videoState.selectedWorkflowId
export const selectHasChanges = (state: { videoState: { hasChanges: video["hasChanges"]; }; }) =>
  state.videoState.hasChanges
export const selectWaveformImages = (state: { videoState: { waveformImages: video["waveformImages"]; }; }) =>
  state.videoState.waveformImages
export const selectOriginalThumbnails = (state: { videoState: { originalThumbnails: video["originalThumbnails"]; }; }) =>
  state.videoState.originalThumbnails

// Selectors mainly pertaining to the information fetched from Opencast
export const selectVideos = (state: { videoState: { tracks: video["tracks"] } }) =>
  state.videoState.tracks.filter((track: Track) => track.video_stream.available === true)
export const selectVideoURL = (state: { videoState: { videoURLs: video["videoURLs"] } }) => state.videoState.videoURLs
export const selectVideoCount = (state: { videoState: { videoCount: video["videoCount"] } }) => state.videoState.videoCount
export const selectDuration = (state: { videoState: { duration: video["duration"] } }) => state.videoState.duration
export const selectDurationInSeconds = (state: { videoState: { duration: video["duration"] } }) => state.videoState.duration / 1000
export const selectTitle = (state: { videoState: { title: video["title"] } }) => state.videoState.title
export const selectTracks = (state: { videoState: { tracks: video["tracks"] } }) => state.videoState.tracks
export const selectWorkflows = (state: { videoState: { workflows: video["workflows"] } }) => state.videoState.workflows
export const selectAspectRatio = (state: { videoState: { aspectRatios: video["aspectRatios"] } }) =>
  calculateTotalAspectRatio(state.videoState.aspectRatios)
export const selectCaptions = (state: { videoState: { captions: video["captions"]; }; }) =>
  state.videoState.captions
export const selectCaptionTrackByFlavor = (flavor: string) => (state: { videoState: { captions: video["captions"]; }; }) => {
  for (const cap of state.videoState.captions) {
    if (cap.flavor.type+"/"+cap.flavor.subtype === flavor) {
      return cap
    }
  }
  return undefined
}

export default videoSlice.reducer
