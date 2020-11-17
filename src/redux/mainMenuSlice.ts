import { createSlice } from '@reduxjs/toolkit'

/**
 * Slice for the main menu state
 */
export const mainMenuSlice = createSlice({
  name: 'mainMenuState',
  initialState: {
    value: "Cutting"
  },
  reducers: {
    setState: (state, action) => {
      state.value = action.payload;
    }
  }
})

export const { setState, } = mainMenuSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectMainMenuState = (state: { mainMenuState: { value: any; }; }) => state.mainMenuState.value

export default mainMenuSlice.reducer

