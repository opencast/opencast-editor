import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../util/client";
import { PostAndProcessEditArgument, httpRequestState } from "../types";

import { convertSegments } from "./workflowPostSlice";
import { settings } from "../config";

const initialState: httpRequestState = {
  status: "idle",
  error: undefined,
  errorReason: "unknown",
};

export const postVideoInformationWithWorkflow =
  createAsyncThunk("video/postVideoInformationWithWorkflow", async (argument: PostAndProcessEditArgument) => {
    if (!settings.id) {
      throw new Error("Missing media package identifier");
    }

    const response = await client.post(`${settings.opencast.url}/editor/${settings.id}/edit.json`,
      {
        segments: convertSegments(argument.segments),
        tracks: argument.tracks,
        subtitles: argument.subtitles,
        workflows: argument.workflow,
      }
    );
    return response;
  });

/**
 * Slice for managing a post request for saving current changes and starting a workflow
 * TODO: Create a wrapper for this and workflowPostAndProcessSlice
 */
const workflowPostAndProcessSlice = createSlice({
  name: "workflowPostAndProcessState",
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(
      postVideoInformationWithWorkflow.pending, (state, _action) => {
        state.status = "loading";
      });
    builder.addCase(
      postVideoInformationWithWorkflow.fulfilled, (state, _action) => {
        state.status = "success";
      });
    builder.addCase(
      postVideoInformationWithWorkflow.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
  selectors: {
    selectStatus: state => state.status,
    selectError: state => state.error,
  },
});

export const { selectStatus, selectError } = workflowPostAndProcessSlice.selectors;


export default workflowPostAndProcessSlice.reducer;
