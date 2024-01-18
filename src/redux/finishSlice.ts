import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface finish {
  value: "Save changes" | "Start processing" | "Discard changes" | undefined,
  pageNumber: number,
}

const initialState: finish = {
  value: "Start processing",
  pageNumber: 0,
};

/**
 * Slice for the main menu state
 */
export const finishSlice = createSlice({
  name: "finishState",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<finish["value"]>) => {
      state.value = action.payload;
    },
    setPageNumber: (state, action) => {
      state.pageNumber = action.payload;
    },
  },
});

// Export Actions
export const { setState, setPageNumber } = finishSlice.actions;

// Export Selectors
export const selectFinishState = (state: { finishState: { value: finish["value"]; }; }) =>
  state.finishState.value;
export const selectPageNumber = (state: { finishState: { pageNumber: finish["pageNumber"]; }; }) =>
  state.finishState.pageNumber;

export default finishSlice.reducer;
