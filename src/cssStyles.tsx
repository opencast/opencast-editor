/**
 * This file contains general css stylings
 */
import { css, Global } from '@emotion/react'
import React from "react";
import emotionNormalize from 'emotion-normalize';
import { checkFlexGapSupport } from './util/utilityFunctions';
import { useSelector } from 'react-redux';
import { selectTheme, Theme } from './redux/themeSlice';

/**
 * An emotion component that inserts styles globally
 * Is removed when the styles change or when the Global component unmounts.
 */
export const GlobalStyle: React.FC = () => {
  const theme = useSelector(selectTheme);
  return (
    <Global styles={globalStyle(theme)} />
  );
}

/**
 * CSS for the global style component
 */
export const globalStyle = (theme: Theme) => css({
  emotionNormalize,
  body: {
    backgroundColor: `${theme.background}`,
    color: `${theme.text}`,
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
export const navigationButtonStyle = (theme: Theme) => css({
  width: '200px',
  padding: '16px',
  justifyContent: 'space-around',
  boxShadow: `${theme.boxShadow}`,
  background: `${theme.element_bg}`,
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
 * CSS for a title
 */
export const titleStyle = css(({
  display: 'inline-block',
  padding: '15px',
  overflow: 'hidden',
  whiteSpace: "nowrap",
  textOverflow: 'ellipsis',
  maxWidth: '500px',
}))

/**
 * Addendum for the titleStyle
 * Used for page titles
 */
export const titleStyleBold = css({
  fontWeight: 'bold',
  fontSize: '24px',
  verticalAlign: '-2.5px',
})

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
export const errorBoxStyle = (errorStatus: boolean, theme: Theme) => {
  return (
    css({
      ...(!errorStatus) && {display: "none"},
      borderColor: `${theme.error}`,
      borderStyle: 'dashed',
      fontWeight: 'bold',
      padding: '10px',
    })
  );
}

export function selectFieldStyle(theme: Theme) {
  return {
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
    multiValue: (provided: any) =>({
      ...provided,
      color: theme.text,
      background: theme.multiValue,
    }),
    multiValueLabel: (provided: any) =>({
      ...provided,
      color: theme.text,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      background: state.isFocused ? theme.focused : theme.background 
        && state.isSelected ? theme.selected : theme.background,
      ...(state.isFocused && {color: theme.focus_text}),
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: theme.text
    })
  }
}
