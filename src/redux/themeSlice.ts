import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { darkMode, lightMode, highContrastDarkMode, highContrastLightMode } from "../themes";

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
  menuBorder: String
  boxShadow: String
  singleKey_bg: String
  singleKey_border: String
  invert_wave: String
  inverted_text: String
  tooltip: String
  tooltip_text: String
  element_outline: String
  selected_text: String
  dropdown_border: String
  menuButton_outline: String
  button_outline: String
  button_color: String
  indicator_color: String
  icon_color: String
  waveform_filter: String
  waveform_bg: String
  scrubber: String
};

const getValue = () => {
  const value = localStorage.getItem('theme');
  
  if(value === 'system' || value === null) {
    return 'system'
  }
  else if(value === 'high-contrast-dark') {
    return 'high-contrast-dark'
  }
  else if(value === 'high-contrast-light') {
    return 'high-contrast-light'
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
    const isContrastPrefered = window.matchMedia('(prefers-contrast: more)');
    console.log('isContrastPrefered', isContrastPrefered)

    if(isDarkPrefered.matches && !isContrastPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      return darkMode
    }
    else if(isContrastPrefered.matches && isDarkPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'high-contrast-dark');
      return highContrastDarkMode
    }
    else if(isContrastPrefered.matches && !isDarkPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'high-contrast-light');
      return highContrastLightMode
    }
    return lightMode
  }

  if(themeId === 'high-contrast-dark') {
    document.documentElement.setAttribute('data-theme', 'high-contrast-dark');
    return highContrastDarkMode
  }
  if(themeId === 'high-contrast-light') {
    document.documentElement.setAttribute('data-theme', 'high-contrast-light');
    return highContrastLightMode
  }
  if(themeId === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    return darkMode
  }
    return lightMode   
}

export interface theme {
  value: 'dark' | 'light' | 'system' | 'high-contrast-dark' | 'high-contrast-light',
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
