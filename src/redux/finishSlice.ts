import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface finish {
  value: "Save" | "Process" | "Abort" | undefined,
}

const initialState: finish = {
  value: "Process",
}

/**
 * Slice for the main menu state
 */
export const finishSlice = createSlice({
  name: 'finishState',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<finish["value"]>) => {
      state.value = action.payload;
    }
  }
})

// Export Actions
export const { setState, } = finishSlice.actions

// Export Selectors
export const selectFinishState = (state: { finishState: { value: finish["value"]; }; }) => state.finishState.value

export default finishSlice.reducer
