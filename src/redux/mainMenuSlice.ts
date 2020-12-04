import { createSlice } from '@reduxjs/toolkit'

import { MainMenuStateNames} from '../types'

interface mainMenu {
  value: MainMenuStateNames,
}

const initialState: mainMenu = {
  value: MainMenuStateNames.cutting,
}

/**
 * Slice for the main menu state
 */
export const mainMenuSlice = createSlice({
  name: 'mainMenuState',
  initialState,
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
export const selectMainMenuState = (state: { mainMenuState: { value: mainMenu["value"]; }; }) => state.mainMenuState.value

export default mainMenuSlice.reducer
