import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface end {
  end: boolean,
  value: 'success' | 'discarded',
}

const initialState: end = {
  end: false,
  value: 'success',
}

/**
 * Slice for the main menu state
 */
export const endSlice = createSlice({
  name: 'endState',
  initialState,
  reducers: {
    setEnd: (state, action: PayloadAction<{hasEnded: end["end"], value: end["value"]}>) => {
      state.end = action.payload.hasEnded;
      state.value = action.payload.value;
    },
  }
})

export const { setEnd } = endSlice.actions

// Export Selectors
export const selectIsEnd = (state: { endState: { end: end["end"] }; }) => state.endState.end
export const selectEndState = (state: { endState: { value: end["value"] }; }) => state.endState.value

export default endSlice.reducer
