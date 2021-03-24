/**
 * This file contains general css stylings
 */
import { css, Global } from '@emotion/react'
import React from "react";
import emotionNormalize from 'emotion-normalize';

/**
 * An emotion component that inserts styles globally
 * Is removed when the styles change or when the Global component unmounts.
 */
export const GlobalStyle: React.FC = () => {
  return (
    <Global styles={globalStyle} />
  );
}

/**
 * CSS for the global style component
 */
export const globalStyle = css({
  emotionNormalize,
  body: {
    backgroundColor: 'snow',
    fontSize: 'medium',
    // Makes the body span to the bottom of the page
    minHeight: "100vh",
  },
});

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
  gap: '10px',
  textAlign: 'center' as const,
});

/**
 * CSS for nagivation styled buttons
 */
export const nagivationButtonStyle = css({
  width: '200px',
  padding: '16px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  justifyContent: 'space-around'
 })

/**
 * CSS for a container that holds back/forward buttons
 */
export const backOrContinueStyle = css(({
  display: 'flex',
  flexDirection: 'row' as const,
  gap: '20px',
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
export const errorBoxStyle = (errorStatus: boolean) => {
  return (
    css({
      ...(!errorStatus) && {display: "none"},
      borderColor: 'red',
      borderStyle: 'dashed',
      fontWeight: 'bold',
      padding: '10px',
    })
  );
}
