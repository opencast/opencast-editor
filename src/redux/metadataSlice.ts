import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { client } from "../util/client";

import { httpRequestState } from "../types";
import { settings } from "../config";

export interface Catalog {
  fields: MetadataField[],
  flavor: string, // "dublincore/episode"
  title: string,  // name identifier
}

export interface MetadataField {
  readOnly: boolean,
  id: string;      // name
  label: string;   // name identifier
  type: string;    // irrelevant?
  value: string,
  required: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: { [key: string]: any } | undefined,
}

interface metadata {
  catalogs: Catalog[];
  hasChanges: boolean;         // Did user make changes to metadata view since last save
}

// TODO: Create an "httpRequestState" array or something
const initialState: metadata & httpRequestState = {
  catalogs: [],
  hasChanges: false,

  status: "idle",
  error: undefined,
  errorReason: "unknown",
};

export const fetchMetadata = createAsyncThunk("metadata/fetchMetadata", async () => {
  if (!settings.id) {
    throw new Error("Missing media package identifier");
  }

  const response = await client.get(`${settings.opencast.url}/editor/${settings.id}/metadata.json`);
  return JSON.parse(response);
});

/**
 * Slice for managing a post request for saving current changes and starting a workflow
 */
const metadataSlice = createSlice({
  name: "metadataState",
  initialState,
  reducers: {
    setFieldValue: (state, action: PayloadAction<{ catalogIndex: number, fieldIndex: number, value: string; }>) => {
      state.catalogs[action.payload.catalogIndex].fields[action.payload.fieldIndex].value = action.payload.value;
      state.hasChanges = true;
    },
    setFieldReadonly: (state, action: PayloadAction<{ catalogIndex: number, fieldIndex: number, value: boolean; }>) => {
      state.catalogs[action.payload.catalogIndex].fields[action.payload.fieldIndex].readOnly = action.payload.value;
    },
    setHasChanges: (state, action: PayloadAction<metadata["hasChanges"]>) => {
      state.hasChanges = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(
      fetchMetadata.pending, (state, _action) => {
        state.status = "loading";
      });
    builder.addCase(
      fetchMetadata.fulfilled, (state, action) => {
        state.catalogs = action.payload;

        state.status = "success";
      });
    builder.addCase(
      fetchMetadata.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
  selectors: {
    selectCatalogs: state => state.catalogs,
    selectHasChanges: state => state.hasChanges,
    selectGetStatus: state => state.status,
    selectGetError: state => state.error,
    selectTitleFromEpisodeDc: state => {
      for (const catalog of state.catalogs) {
        if (catalog.flavor === "dublincore/episode") {
          for (const field of catalog.fields) {
            if (field.id === "title") {
              return field.value;
            }
          }
        }
      }

      return undefined;
    },
  },
});

export const { setFieldValue, setHasChanges, setFieldReadonly } = metadataSlice.actions;

export const {
  selectCatalogs,
  selectHasChanges,
  selectGetStatus,
  selectGetError,
  selectTitleFromEpisodeDc,
} = metadataSlice.selectors;

export default metadataSlice.reducer;
