import { createSlice } from "@reduxjs/toolkit";

export const getTheme = () => {
  const theme = localStorage.getItem('theme');

  if(theme === 'dark' || theme === 'light'){
    return theme;
  }

  if(window.matchMedia(('prefers-color-scheme: dark')).matches) {
    return 'dark';
  } else return 'light';
};

const initialState = getTheme();

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => action.payload,
  },
})

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
