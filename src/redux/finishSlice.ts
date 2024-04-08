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
  selectors: {
    selectFinishState: state => state.value,
    selectPageNumber: state => state.pageNumber,
  },
});

// Export Actions
export const { setState, setPageNumber } = finishSlice.actions;

export const { selectFinishState, selectPageNumber } = finishSlice.selectors;

export default finishSlice.reducer;
