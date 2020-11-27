import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useSelector } from 'react-redux'
import {
  selectMainMenuState,
} from '../redux/mainMenuSlice'

/**
 * A container for the main functionality
 * Holds different components depending on the state off the app
 * TODO: Add proper component switching
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)

  const mainContentStyle = css({
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: '20px',
    gap: '20px',
  });


  const renderSwitch = (state : string) => {
    switch(state) {
      case "Cutting":
        return (
          <>
            <div css={{width: '100%', display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-around', gap: "20px"}}>
              <Video />
              <CuttingActions />
            </div>
            <Timeline />
          </>);
      default:
        return (
          <>
            <FontAwesomeIcon icon={faTools} size="10x" />
            Under Construction
          </>);
    }
  }

  return (
    <div css={mainContentStyle} title="MainMenuContext">
        {renderSwitch(mainMenuState)}
    </div>
  );
};

export default MainContent;
