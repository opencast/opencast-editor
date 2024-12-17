import { createSlice } from "@reduxjs/toolkit";
import { client } from "../util/client";
import { Segment, PostEditArgument, httpRequestState } from "../types";
import { settings } from "../config";
import { createAppAsyncThunk } from "./createAsyncThunkWithTypes";

const initialState: httpRequestState = {
  status: "idle",
  error: undefined,
  errorReason: "unknown",
};

export const postVideoInformation =
  createAppAsyncThunk("video/postVideoInformation", async (argument: PostEditArgument) => {
    if (!settings.id) {
      throw new Error("Missing media package id");
    }

    const response = await client.post(`${settings.opencast.url}/editor/${settings.id}/edit.json`,
      {
        segments: convertSegments(argument.segments),
        tracks: argument.tracks,
        subtitles: argument.subtitles,
        workflows: argument.workflow,
        metadataJSON: JSON.stringify(argument.metadata),
      }
    );
    return response;
  });

/**
 * Slice for managing a post request for saving current changes
 * TODO: Create a wrapper for this and workflowPostAndProcessSlice
 */
const workflowPostSlice = createSlice({
  name: "workflowPostState",
  initialState,
  reducers: {
    resetPostRequestState: state => {
      state.status = "idle";
    },
  },
  extraReducers: builder => {
    builder.addCase(
      postVideoInformation.pending, (state, _action) => {
        state.status = "loading";
      });
    builder.addCase(
      postVideoInformation.fulfilled, (state, _action) => {
        state.status = "success";
      });
    builder.addCase(
      postVideoInformation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
  selectors: {
    selectStatus: state => state.status,
    selectError: state => state.error,
  },
});

interface segmentAPI {
  start: number,
  end: number,
  deleted: boolean,
  selected: boolean,
}

// Convert a segment from how it is stored in redux into
// a segment that can be send to Opencast
export const convertSegments = (segments: Segment[]) => {
  const newSegments: segmentAPI[] = [];

  segments.forEach(segment => {
    newSegments.push({
      start: segment.start,
      end: segment.end,
      deleted: segment.deleted,
      selected: false,
    });
  });

  return newSegments;
};

export const { resetPostRequestState } = workflowPostSlice.actions;

export const { selectStatus, selectError } = workflowPostSlice.selectors;

export default workflowPostSlice.reducer;
