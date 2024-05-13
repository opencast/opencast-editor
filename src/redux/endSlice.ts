import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface end {
  end: boolean,
  value: "success" | "discarded",
}

const initialState: end = {
  end: false,
  value: "success",
};

/**
 * Slice for the main menu state
 */
export const endSlice = createSlice({
  name: "endState",
  initialState,
  reducers: {
    setEnd: (state, action: PayloadAction<{ hasEnded: end["end"], value: end["value"]; }>) => {
      state.end = action.payload.hasEnded;
      state.value = action.payload.value;
    },
  },
  selectors: {
    selectIsEnd: state => state.end,
    selectEndState: state => state.value,
  },
});

export const { setEnd } = endSlice.actions;

export const { selectIsEnd, selectEndState } = endSlice.selectors;

export default endSlice.reducer;
