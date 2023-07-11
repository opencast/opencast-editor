import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { darkMode, lightMode, highContrastDarkMode, highContrastLightMode } from "../themes";

export interface Theme {
  background: string
  menu_background: string
  text: string
  error: string
  element_bg: string
  multiValue: string
  focused: string
  focus_text: string
  selected: string
  disabled: string
  menuBorder: string
  boxShadow: string
  boxShadow_tiles: string
  singleKey_bg: string
  singleKey_border: string
  invert_wave: string
  inverted_text: string
  tooltip: string
  tooltip_text: string
  element_outline: string
  selected_text: string
  dropdown_border: string
  menuButton_outline: string
  button_outline: string
  button_color: string
  indicator_color: string
  icon_color: string
  background_finish_menu_icon: string
  background_play_icon: string
  background_preview_icon: string
  waveform_filter: string
  waveform_bg: string
  scrubber: string
  scrubber_handle: string
  scrubber_icon: string
  subtitle_segment_bg: string
  subtitle_segment_border: string
  subtitle_segment_text: string
  header_bg: string
  metadata_highlight: string
  clock_bg: string
  clock_border: string
  clock_hands: string
  clock_focus: string
  digit_selected: string
  text_shadow: string
}

const getValue = () => {
  const value = localStorage.getItem('theme');

  if (value === 'system' || value === null) {
    return 'system'
  }
  else if (value === 'high-contrast-dark') {
    return 'high-contrast-dark'
  }
  else if (value === 'high-contrast-light') {
    return 'high-contrast-light'
  }
  else if (value === 'dark') {
    return 'dark'
  }
  return 'light'
};

const getTheme = () => {
  const themeId = getValue();
  document.documentElement.setAttribute('data-theme', 'light');

  if (themeId === 'system' || themeId === undefined) {
    const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
    const isContrastPrefered = window.matchMedia('(prefers-contrast: more)');
    console.log('isContrastPrefered', isContrastPrefered)

    if (isDarkPrefered.matches && !isContrastPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      return darkMode
    }
    else if (isContrastPrefered.matches && isDarkPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'high-contrast-dark');
      return highContrastDarkMode
    }
    else if (isContrastPrefered.matches && !isDarkPrefered.matches) {
      document.documentElement.setAttribute('data-theme', 'high-contrast-light');
      return highContrastLightMode
    }
    return lightMode
  }

  if (themeId === 'high-contrast-dark') {
    document.documentElement.setAttribute('data-theme', 'high-contrast-dark');
    return highContrastDarkMode
  }
  if (themeId === 'high-contrast-light') {
    document.documentElement.setAttribute('data-theme', 'high-contrast-light');
    return highContrastLightMode
  }
  if (themeId === 'dark') {
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
    toggleTheme: state => {
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
