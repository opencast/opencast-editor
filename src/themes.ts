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
  menuBorder: '1px solid #BBB',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
  singleKey_border: 'Gainsboro',
  invert_wave: 'invert(0%)',
  inverted_text: '#000', // for "Generating waveform" text: in lightMode it's not inverted, so it has to be black
  element_outline: '2px solid transparent',
  selected_text: '#000',
  dropdown_border: '1px solid #ccc',
  button_outline: 'none',
  button_color: '#DDD',
  indicator_color: '#3d3d3d',
  icon_color: '#000',
  waveform_filter: 'invert(0%)',
  waveform_bg: '#fff'
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
  menuBorder: '1px solid #5d5d5d',
  boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(30,30,30,1) 100%)',
  singleKey_border: '#404040',
  invert_wave: 'invert(100%)',
  inverted_text: '#000',
  element_outline: '2px solid transparent',
  selected_text: '#fff',
  dropdown_border: '1px solid #ccc',
  button_outline: '0px solid transparent',
  button_color: '#2b2b2b',
  indicator_color: '#ccc',
  icon_color: 'rgba(255, 255, 255, 0.87)',
  waveform_filter: 'invert(11%)',
  waveform_bg: '#fff'
};

export const highContrastDarkMode: Theme = {
  background: '#000',
  text: '#fff',
  error: '#ED1741',
  element_bg: 'none',
  multiValue: '#c4c4c4',
  focused: '#4dffd5',
  focus_text: '#000',
  selected: '#fff',
  disabled: 'rgba(255, 255, 255, 0.8)',
  menuBorder: '2px solid #fff',
  boxShadow: '0 0 0 rgba(255, 255, 255, 0.3)',
  singleKey_bg: 'none',
  singleKey_border: '#fff',
  invert_wave: 'invert(100%)',
  inverted_text: '#000',
  element_outline: '2px solid #fff',
  selected_text: '#000',
  dropdown_border: '3px solid #fff',
  button_outline: '2px solid #4dffd5',
  button_color: '#4dffd5',
  indicator_color: '#4dffd5',
  icon_color: '#4dffd5',
  waveform_filter: 'invert(100%)',
  waveform_bg: '#fff'
}

export const highContrastLightMode: Theme = {
  background: 'snow',
  text: '#000',
  error: '#a5102d',
  element_bg: 'none',
  multiValue: '#2e2e2e',
  focused:'#000099',
  focus_text: '#fff',
  selected: '#3232ad',
  disabled: 'rgba(0, 0, 0, 0.8)',
  menuBorder: '2px solid #000',
  boxShadow: '0 0 0 rgba(0, 0, 0, 0.3)',
  singleKey_bg: 'none',
  singleKey_border: '#000',
  invert_wave: 'invert(0%)',
  inverted_text: '#000',
  element_outline: '2px solid #000',
  selected_text: '#fff',
  dropdown_border: '3px solid #000',
  button_outline: '3px solid #000099',
  button_color: '#000099',
  indicator_color: '#000099',
  icon_color: '#000099',
  waveform_filter: 'invert(0%)',
  waveform_bg: '#fff'
}