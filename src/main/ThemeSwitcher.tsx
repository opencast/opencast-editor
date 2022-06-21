import React from "react";
import { css } from "@emotion/react";
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux';
import { setTheme } from '../redux/themeSlice';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { darkTheme, lightTheme, flexGapReplacementStyle } from "../cssStyles";
import { useTranslation } from "react-i18next";



const ThemeSwitcher: React.FC<{}> = () => {

  const { t } = useTranslation();
  
  const theme = useSelector((state: RootStateOrAny) => state.theme);
  const dispatch = useDispatch();
  const design = getTheme(theme);

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [ theme ])

  const switchTheme = () => {
    const mode = (theme === 'dark' ? 'light' : 'dark');
    dispatch(setTheme(mode));
  }

  const buttonStyle = css({
    backgroundColor: 'transparent',
    color: design.text,
    width: '100%',
    height: 'auto',
    fontSize: '14px',
    border: 'none',
    borderRadius: '10px',
    cursor: "pointer",
    // Position
    padding: '10px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    ...(flexGapReplacementStyle(10, false)),
    // Animation
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    '&:hover': {
      backgroundColor: design.menuButton,
      transform: 'scale(1.1)',
    },
    '&:active': {
      transform: 'scale(0.9)',
    },
  });

  return (
    <button css={buttonStyle} onClick={switchTheme}>
      <FontAwesomeIcon icon={faCircleHalfStroke} css={{fontSize: '20px'}}/>
      {theme === 'dark' ? t('theme.lightmode') : t('theme.darkmode')}
    </button>
  )
}

export const getTheme = (theme: any) => {
  if (theme === 'dark') {
    return darkTheme
  } 
  return lightTheme
}

export default ThemeSwitcher;
