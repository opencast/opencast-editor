import { createSlice } from '@reduxjs/toolkit'

interface finish {
  value: "Save" | "Process" | "Abort" | undefined,
  pageNumber: number,
}

const initialState: finish = {
  value: "Process",
  pageNumber: 0,
}

/**
 * Slice for the main menu state
 */
export const finishSlice = createSlice({
  name: 'finishState',
  initialState,
  reducers: {
    setState: (state, action) => {
      state.value = action.payload;
    },
    setPageNumber: (state, action) => {
      state.pageNumber = action.payload;
    }
  }
})

// Export Actions
export const { setState, setPageNumber } = finishSlice.actions

// Export Selectors
export const selectFinishState = (state: { finishState: { value: finish["value"]; }; }) => state.finishState.value
export const selectPageNumber = (state: { finishState: { pageNumber: finish["pageNumber"]; }; }) => state.finishState.pageNumber

export default finishSlice.reducer
