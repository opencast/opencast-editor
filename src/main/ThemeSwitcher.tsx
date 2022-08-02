import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux"
import { selectTheme, selectThemeState, toggleTheme, setState } from "../redux/themeSlice";
import Select from "react-select";
import { selectFieldStyle } from "../cssStyles";

const ThemeSwitcher: React.FC<{}> = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const themeState = useSelector(selectThemeState);
  const theme = useSelector(selectTheme);

  React.useEffect(() => {
    localStorage.setItem('theme', themeState)
    dispatch(toggleTheme())
  }, [ themeState, theme, dispatch ] )

  const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
  // Listen to system preference changes
  const systemPreferenceHasChanged = () => {
    if(themeState === 'system') {
      dispatch(toggleTheme())
    }
    isDarkPrefered.removeEventListener('change', systemPreferenceHasChanged)
  }

  isDarkPrefered.addEventListener('change', systemPreferenceHasChanged)

  const switchTheme = (themeState: String) => {
    if(themeState === 'system'){
      dispatch(setState('system'))
    } 
    else if(themeState === 'high-contrast-dark'){
      dispatch(setState('high-contrast-dark'))
    }
    else if(themeState === 'high-contrast-light'){
      dispatch(setState('high-contrast-light'))
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

  const themes = [
    { value: 'system', label: t('theme.system') },
    { value: 'light', label: t('theme.lightmode') },
    { value: 'dark', label: t('theme.darkmode') },
    { value: 'high-contrast-light', label: t('theme.high-contrast-light') },
    { value: 'high-contrast-dark', label: t('theme.high-contrast-dark') },
  ]
  
  return (
    <div css={baseStyle}>
      <h2 css={headerStyle}>{t('theme.appearance')}</h2>
      <Select styles={selectFieldStyle(theme)}
        css={{outline: `${theme.element_outline}`, borderRadius: '5px'}}
        defaultValue={themes.filter(({value}) => value === themeState)}
        options={themes}
        onChange={themes => switchTheme(themes!.value)}
      />
    </div>
  )
}

export default ThemeSwitcher;
