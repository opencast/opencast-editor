import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { darkMode, lightMode } from "../themes";

export interface Theme {
  background: String
  text: String
  error: String
  element_bg: String
  multiValue: String
  focused: String
  focus_text: String
  selected: String
  disabled: String
  menuButton: String
  menuBorder: String
  boxShadow: String
  singleKey_bg: String
  singleKey_border: String
  invert_wave: String
  inverted_text: String
  tooltip: String
  tooltip_text: String
};

const getValue = () => {
  const value = localStorage.getItem('theme');
  
  if(value === 'system' || value === null) {
    return 'system'
  }
  else if(value === 'dark') {
    return 'dark'
  }
  return 'light'
};

const getTheme = () => {
  const themeId = getValue();
  document.documentElement.setAttribute('data-theme', 'light');

  if(themeId === 'system' || themeId === undefined) {
    const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
    if(isDarkPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      return darkMode
    }
    return lightMode
  }
  if(themeId === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    return darkMode
  }
    return lightMode   
}

export interface theme {
  value: 'dark' | 'light' | 'system',
  theme: Theme
}

const initialState: theme = {
  value: getValue(),
  theme: getTheme(),
}

export const themeSlice = createSlice({
  name: 'themeState',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<theme["value"]>) => {
      state.value = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = getTheme()
    },
  }
})

// Export Actions
export const { setState, toggleTheme } = themeSlice.actions

// Export Selectors
export const selectThemeState = (state: { themeState: { value: theme["value"]; }; }) => state.themeState.value
export const selectTheme = (state: { themeState: { theme: theme["theme"]; }; }) => state.themeState.theme

export default themeSlice.reducer