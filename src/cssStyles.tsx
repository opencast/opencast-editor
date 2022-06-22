/**
 * This file contains general css stylings
 */
import { css, Global } from '@emotion/react'
import React from "react";
import emotionNormalize from 'emotion-normalize';
import { checkFlexGapSupport } from './util/utilityFunctions';
import { RootStateOrAny, useSelector } from 'react-redux';
import { getTheme } from './main/ThemeSwitcher';

/**
 * An emotion component that inserts styles globally
 * Is removed when the styles change or when the Global component unmounts.
 */
export const GlobalStyle: React.FC = () => {
  const mode = useSelector((state: RootStateOrAny) => state.theme);
  const theme = getTheme(mode);
  return (
    <Global styles={globalStyle(theme)} />
  );
}

/**
 * CSS for the global style component
 */
export const globalStyle = (theme: any) => css({
  emotionNormalize,
  body: {
    backgroundColor: theme.background,
    color: theme.text,
    fontSize: 'medium',
    // Makes the body span to the bottom of the page
    minHeight: "100vh",
  },
});


/**
 * CSS for replacing flexbox gap in browers that do not support it
 * Does not return a css prop, but is meant as a direct replacement for "gap"
 * Example: ...(flexGapReplacementStyle(30, false))
 */
export const flexGapReplacementStyle = (flexGapValue: number, flexDirectionIsRow: boolean) => {

  let half = flexGapValue / 2
  let quarter = flexGapValue / 4

  return (
    {
    // Use gap if supported
    ...(checkFlexGapSupport()) && {gap: `${flexGapValue}px`},
    // Else use margins
    ...(!checkFlexGapSupport()) &&
      {
        ">*": { // For each child
          marginTop: `${quarter}px`,
          marginBottom: `${quarter}px`,
          marginRight: `${half}px`,
          marginLeft: `${half}px`,
        },
        ...(flexDirectionIsRow) && {
          ">*:first-of-type": {
            marginLeft: '0px',
          },
          ">*:last-child": {
            marginRight: '0px',
          },
        },
      }
    }
  );
}

/**
 * CSS for buttons
 */
export const basicButtonStyle = css({
  borderRadius: '10px',
  cursor: "pointer",
  // Animation
  transitionDuration: "0.3s",
  transitionProperty: "transform",
  "&:hover": {
    transform: 'scale(1.1)',
  },
  "&:focus": {
    transform: 'scale(1.1)',
  },
  "&:active": {
    transform: 'scale(0.9)',
  },
  // Flex position child elements
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  ...(flexGapReplacementStyle(10, false)),
  textAlign: 'center' as const,
});

/**
 * CSS for deactivated buttons
 */
export const deactivatedButtonStyle = css({
  borderRadius: '10px',
  cursor: "pointer",
  opacity: "0.4",
  // Flex position child elements
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  ...(flexGapReplacementStyle(10, false)),
  textAlign: 'center' as const,
});

/**
 * CSS for nagivation styled buttons
 */
export const navigationButtonStyle = (theme: any) => css({
  width: '200px',
  padding: '16px',
  justifyContent: 'space-around',
  boxShadow: theme.boxShadow,
  background: theme.element_bg,
 })

/**
 * CSS for a container that holds back/forward buttons
 */
export const backOrContinueStyle = css(({
  display: 'flex',
  flexDirection: 'row' as const,
  ...(flexGapReplacementStyle(20, false)),
}))

/**
 * CSS for ariaLive regions that should not be visible
 */
export const ariaLive = css({
  position: 'absolute',
  left: '-99999px',
  height: '1px',
  width: '1px',
  overflow: 'hidden',
})

/**
 * CSS for displaying of errors
 */
export const errorBoxStyle = (errorStatus: boolean, theme: any) => {
  return (
    css({
      ...(!errorStatus) && {display: "none"},
      borderColor: theme.error,
      borderStyle: 'dashed',
      fontWeight: 'bold',
      padding: '10px',
    })
  );
}

export const lightTheme = {
  background: 'snow',
  text: '#000',
  black: '#000',
  error: '#ed1741',
  element_bg: 'snow',
  multiValue: '#e6e6e6',
  focused:'#e6e6e6',
  selected: '#a1a1a1',
  disabled: 'rgba(0, 0, 0, 0.55)',
  menuButton: '#DDD',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 100%)',
  singleKey_border: 'Gainsboro',
  invert_wave: 'invert(0%)',
};

export const darkTheme = {
  background: '#1C1C1C',
  text: 'rgba(255, 255, 255, 0.87)',
  black: '#000',
  error: 'rgba(237, 23, 65, 0.8)',
  element_bg: '#2b2b2b',
  multiValue: '#4a4a4a',
  focused: '#a1a1a1',
  selected: '#4a4a4a',
  disabled: 'rgba(255, 255, 255, 0.5)',
  menuButton: '#2b2b2b',
  boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  singleKey_bg: 'linear-gradient(180deg, rgba(40,40,40,1) 0%, rgba(30,30,30,1) 100%)',
  singleKey_border: '#404040',
  invert_wave: 'invert(85%)',
};

