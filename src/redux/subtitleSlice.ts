import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../redux/store'

export interface subtitle {
  isDisplayEditView: boolean    // Should the edit view be displayed
}

const initialState: subtitle = {
  isDisplayEditView: false,
}

/**
 * Slice for the subtitle editor state
 */
export const subtitleSlice = createSlice({
  name: 'subtitleState',
  initialState,
  reducers: {
    setIsDisplayEditView: (state, action: PayloadAction<subtitle["isDisplayEditView"]>) => {
      state.isDisplayEditView = action.payload;
    },

  }
})

// Export Actions
export const { setIsDisplayEditView } = subtitleSlice.actions

// Export Selectors
export const selectIsDisplayEditView = (state: RootState) =>
  state.subtitleState.isDisplayEditView


export default subtitleSlice.reducer