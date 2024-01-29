import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { MainMenuStateNames } from "../types";

export interface mainMenu {
  value: MainMenuStateNames,
}

const initialState: mainMenu = {
  value: MainMenuStateNames.cutting,
};

/**
 * Slice for the main menu state
 */
export const mainMenuSlice = createSlice({
  name: "mainMenuState",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<mainMenu["value"]>) => {
      state.value = action.payload;
    },
  },
  selectors: {
    selectMainMenuState: state => state.value,
  },
});

export const { setState } = mainMenuSlice.actions;

export const { selectMainMenuState } = mainMenuSlice.selectors;

export default mainMenuSlice.reducer;
