import React, { useEffect } from "react";

import MainMenu from './MainMenu';
import MainContent from './MainContent';
import TheEnd from './TheEnd';
import Error from './Error';
import Landing from "./Landing";

import { css } from '@emotion/react'

import { useSelector } from 'react-redux';
import { selectIsEnd } from '../redux/endSlice'
import { selectIsError } from "../redux/errorSlice";
import { settings } from '../config';
import { selectThemeState } from "../redux/themeSlice";


const Body: React.FC = () => {

  const isEnd = useSelector(selectIsEnd)
  const isError = useSelector(selectIsError)
  const themeState = useSelector(selectThemeState);

  // Set attribute used by appkit to select the correct colors
  useEffect(() => {
    document.documentElement.dataset.colorScheme = themeState !== "system" ?
      themeState :
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  }, [themeState])

  // If we're in a special state, display a special page
  // Otherwise display the normal page
  const main = () => {
    if (!settings.id) {
      return (
        <Landing />
      )
    } else if (isEnd) {
      return (
        <TheEnd />
      );
    } else if (isError) {
      return (
        <Error />
      );
    } else {
      return (
        <div css={bodyStyle}>
          <MainMenu />
          <MainContent />
        </div>
      );
    }
  }

  const bodyStyle = css({
    display: 'flex',
    flexDirection: 'row',
    height: 'calc(100% - 60px)',
  });

  return (
    <React.Fragment>
      {main()}
    </React.Fragment>
  );
};

export default Body;
