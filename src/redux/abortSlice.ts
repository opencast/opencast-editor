import { createSlice } from '@reduxjs/toolkit'

interface abort {
  value: boolean,
}

const initialState: abort = {
  value: false,
}

/**
 * Slice for the main menu state
 */
export const abortSlice = createSlice({
  name: 'abortState',
  initialState,
  reducers: {
    setState: (state, action) => {
      state.value = action.payload;
    }
  }
})

export const { setState, } = abortSlice.actions

// Export Selectors
export const selectAbortState = (state: { abortState: { value: abort["value"] }; }) => state.abortState.value

export default abortSlice.reducer
