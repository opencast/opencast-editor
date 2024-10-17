import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "./store";

/**
 * Use instead of createAsyncThunk to provide basic typing to all async thunks
 *
 * Thematically this belongs in `store.ts`. However, this causes
 * "Cannot access 'createAsyncThunk' before initialization",
 * so this has to be moved into it's own file.
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>();
