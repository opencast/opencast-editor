import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux"
import { selectTheme, selectThemeState, toggleTheme, setState } from "../redux/themeSlice";
import Select from "react-select";
import { selectFieldStyle, titleStyle, titleStyleBold } from "../cssStyles";
import { css } from '@emotion/react'

const ThemeSwitcher: React.FC = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const themeState = useSelector(selectThemeState);
  const theme = useSelector(selectTheme);

  React.useEffect(() => {
    localStorage.setItem('theme', themeState)
    dispatch(toggleTheme())
  }, [themeState, theme, dispatch])

  const isDarkPrefered = window.matchMedia('(prefers-color-scheme: dark)');
  // Listen to system preference changes
  const systemPreferenceHasChanged = () => {
    if (themeState === 'system') {
      dispatch(toggleTheme())
    }
    isDarkPrefered.removeEventListener('change', systemPreferenceHasChanged)
  }

  isDarkPrefered.addEventListener('change', systemPreferenceHasChanged)

  const switchTheme = (themeState: string) => {
    if (themeState === 'system') {
      dispatch(setState('system'))
    }
    else if (themeState === 'high-contrast-dark') {
      dispatch(setState('high-contrast-dark'))
    }
    else if (themeState === 'high-contrast-light') {
      dispatch(setState('high-contrast-light'))
    }
    else if (themeState === 'dark') {
      dispatch(setState('dark'))
    }
    else {
      dispatch(setState('light'))
    }
  }

  const baseStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  })

  const dropdownStyle = css({
    outline: `${theme.element_outline}`,
    borderRadius: '5px',
    minWidth: '50vw',
  })

  const themes = [
    { value: 'system', label: t('theme.system') },
    { value: 'light', label: t('theme.lightmode') },
    { value: 'dark', label: t('theme.darkmode') },
    { value: 'high-contrast-light', label: t('theme.high-contrast-light') },
    { value: 'high-contrast-dark', label: t('theme.high-contrast-dark') },
  ]

  return (
    <div css={baseStyle}>
      <div css={[titleStyle(theme), titleStyleBold(theme)]}>{t('theme.appearance')}</div>
      <Select styles={selectFieldStyle(theme)}
        css={dropdownStyle}
        defaultValue={themes.filter(({value}) => value === themeState)}
        options={themes}
        onChange={themes => switchTheme(themes!.value)}
        aria-label={t('theme.selectThemesLabel')}
      />
    </div>
  )
}

export default ThemeSwitcher;
