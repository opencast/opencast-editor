import React from "react";

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


const Body: React.FC = () => {

  const isEnd = useSelector(selectIsEnd)
  const isError = useSelector(selectIsError)

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
    height: 'calc(100% - 64px)',
  });

  return (
    <React.Fragment>
      {main()}
    </React.Fragment>
  );
};

export default Body;
