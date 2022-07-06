import { Theme } from "./redux/themeSlice";

export const lightMode: Theme = {
  background: 'snow',
  text: '#000',
  error: '#ed1741',
  element_bg: 'snow',
  multiValue: '#e6e6e6',
  focused:'#e6e6e6',
  focus_text: '#000',
  selected: '#a1a1a1',
  disabled: 'rgba(0, 0, 0, 0.55)',
  menuButton: '#DDD',
  menuBorder: '1px solid #BBB',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
  singleKey_border: 'Gainsboro',
  invert_wave: 'invert(0%)',
  inverted_text: '#000', // for "Generating waveform" text: in lightMode it's not inverted, so it has to be black
};

export const darkMode: Theme = {
  background: '#1C1C1C',
  text: 'rgba(255, 255, 255, 0.87)',
  error: 'rgba(237, 23, 65, 0.8)',
  element_bg: '#2b2b2b',
  multiValue: '#4a4a4a',
  focused: '#a1a1a1',
  focus_text: '#000',
  selected: '#4a4a4a',
  disabled: 'rgba(255, 255, 255, 0.5)',
  menuButton: '#2b2b2b',
  menuBorder: '1px solid #5d5d5d',
  boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(30,30,30,1) 100%)',
  singleKey_border: '#404040',
  invert_wave: 'invert(100%)',
  inverted_text: '#000',
};
