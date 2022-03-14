import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';
import Metadata from './Metadata';
import TrackSelection from './TrackSelection';
import Subtitle from "./Subtitle";
import Finish from "./Finish"
import KeyboardControls from "./KeyboardControls";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useSelector } from 'react-redux'
import { selectMainMenuState } from '../redux/mainMenuSlice'

import { MainMenuStateNames } from '../types'
import { flexGapReplacementStyle } from "../cssStyles";

import { useBeforeunload } from 'react-beforeunload';
import { hasChanges as videoHasChanges } from "../redux/videoSlice";
import { hasChanges as metadataHasChanges} from "../redux/metadataSlice";
import {
  selectIsPlaying, selectCurrentlyAt,
  setIsPlaying, setCurrentlyAt, setClickTriggered,
} from '../redux/videoSlice'

/**
 * A container for the main functionality
 * Shows different components depending on the state off the app
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)
  const videoChanged = useSelector(videoHasChanges)
  const metadataChanged = useSelector(metadataHasChanges)

  // Display warning when leaving the page if there are unsaved changes
  useBeforeunload((event: { preventDefault: () => void; }) => {
    if (videoChanged || metadataChanged) {
      event.preventDefault();
    }
  });

  // Return display 'flex' if state is currently active
  // also keep track if any state was activated
  var stateActive = false;
  let displayState = (state: MainMenuStateNames): object => {
    if (mainMenuState === state) {
      stateActive = true;
      return { display: "flex" };
    }
    return { display: 'none' };
  }

  const cuttingStyle = css({
    ...displayState(MainMenuStateNames.cutting),
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
  })

  const metadataStyle = css({
    ...displayState(MainMenuStateNames.metadata),
    // flexDirection: 'column' as const,
    // justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
  })

  const trackSelectStyle = css({
    ...displayState(MainMenuStateNames.trackSelection),
    flexDirection: 'column' as const,
    alignContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    height: '100%',
  })

  const subtitleSelectStyle = css({
    ...displayState(MainMenuStateNames.subtitles),
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    paddingRight: '20px',
    paddingLeft: '161px',
    height: '100%',
  })

  const finishStyle = css({
    ...displayState(MainMenuStateNames.finish),
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    height: '100%',
  })

  const keyboardControlsStyle = css({
    ...displayState(MainMenuStateNames.keyboardControls),
    // flexDirection: 'column' as const,
    // justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
  })

  const defaultStyle = css({
    display: stateActive ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    ...(flexGapReplacementStyle(20, false)),
  })

  return (
     <main css={{width: '100%'}} role="main">
      <div css={cuttingStyle}>
          <Video />
          <CuttingActions />
          <CuttingTimeline />
      </div>
      <div css={metadataStyle}>
          <Metadata />
      </div>
      <div css={trackSelectStyle}>
          <TrackSelection />
      </div>
      <div css={subtitleSelectStyle}>
          <Subtitle />
      </div>
      <div css={finishStyle}>
        <Finish />
      </div>
      <div css={keyboardControlsStyle}>
          <KeyboardControls />
      </div>
      <div css={defaultStyle}>
        <FontAwesomeIcon icon={faTools} size="10x" />
        Placeholder
      </div>
     </main>
  );
};

const CuttingTimeline : React.FC<{}> = () => {
  return (
    <Timeline
      selectIsPlaying={selectIsPlaying}
      selectCurrentlyAt={selectCurrentlyAt}
      setIsPlaying={setIsPlaying}
      setCurrentlyAt={setCurrentlyAt}
      setClickTriggered={setClickTriggered}
    />
  );
}

export default MainContent;
