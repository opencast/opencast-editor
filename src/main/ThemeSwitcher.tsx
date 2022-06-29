import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux"
import { selectTheme, selectThemeState, setTheme, setState } from "../redux/themeSlice";
import Select from "react-select";

const ThemeSwitcher: React.FC<{}> = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const themeState = useSelector(selectThemeState);
  const theme = useSelector(selectTheme);

  React.useEffect(() => {
    localStorage.setItem('theme', themeState)
    dispatch(setTheme(theme))
    // Listen to system preference changes
    const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
    isDarkPrefered.addEventListener('change', () => {
      dispatch(setTheme(theme))
    })
  }, [ themeState, theme, dispatch ] )

  const switchTheme = (themeState: String) => {
    if(themeState === 'system'){
      dispatch(setState('system'))
    } 
    else if(themeState === 'dark') {
      dispatch(setState('dark'))
    }
    else {
      dispatch(setState('light'))
    }
  }

  const baseStyle = {
    maxWidth: '50vw',
    width: '870px',
    alignSelf: 'center',
    padding: '20px',
  }

  const headerStyle = {
    display: 'flex', 
    flexDirection: 'column' as const,
    alignItems: 'center',
  }

  const selectStyle = {
    control: (provided: any) => ({
      ...provided,
      background: theme.element_bg,
    }),
    menu: (provided: any) => ({
      ...provided,
      background: theme.element_bg,
      border: '1px solid #ccc',
      // kill the gap
      marginTop: 0,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme.text,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      background: state.isFocused ? theme.focused : theme.background 
        && state.isSelected ? theme.selected : theme.background,
      ...(state.isFocused && {color: '#000'}),
    })
  }

  const themes = [
    { value: 'system', label: t('theme.system') },
    { value: 'light', label: t('theme.lightmode') },
    { value: 'dark', label: t('theme.darkmode') },
  ]
  
  return (
    <div css={baseStyle}>
      <h2 css={headerStyle}>{t('theme.appearance')}</h2>
      <Select styles={selectStyle}
        defaultValue={themes.filter(({value}) => value === themeState)}
        options={themes}
        onChange={themes => switchTheme(themes!.value)}
      />
    </div>
  )
}

export default ThemeSwitcher;
