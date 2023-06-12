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
import { selectHasChanges as videoSelectHasChanges } from "../redux/videoSlice";
import { selectHasChanges as metadataSelectHasChanges} from "../redux/metadataSlice";
import {
  selectIsPlaying, selectCurrentlyAt,
  setIsPlaying, setCurrentlyAt, setClickTriggered,
} from '../redux/videoSlice'
import { selectHasChanges as selectSubtitleHasChanges } from "../redux/subtitleSlice";
import { selectTheme } from "../redux/themeSlice";
import ThemeSwitcher from "./ThemeSwitcher";
import Thumbnail from "./Thumbnail";

/**
 * A container for the main functionality
 * Shows different components depending on the state off the app
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)
  const videoChanged = useSelector(videoSelectHasChanges)
  const metadataChanged = useSelector(metadataSelectHasChanges)
  const subtitleChanged = useSelector(selectSubtitleHasChanges)
  const theme = useSelector(selectTheme)

  // Display warning when leaving the page if there are unsaved changes
  useBeforeunload((event: { preventDefault: () => void; }) => {
    if (videoChanged || metadataChanged || subtitleChanged) {
      event.preventDefault();
    }
  });

  const mainContentStyle = css({
    display: 'flex',
    width: '100%',
    paddingRight: '20px',
    paddingLeft: '20px',
    ...(flexGapReplacementStyle(20, false)),
    background: `${theme.background}`,
    overflow: 'vertical',
  })

  const cuttingStyle = css({
    flexDirection: 'column',
  })

  const metadataStyle = css({
  })

  const trackSelectStyle = css({
    flexDirection: 'column',
    alignContent: 'space-around',
  })

  const subtitleSelectStyle = css({
    flexDirection: 'column',
    justifyContent: 'space-around',
  })

  const thumbnailSelectStyle = css({
    flexDirection: 'column',
    alignContent: 'space-around',
  })

  const finishStyle = css({
    flexDirection: 'column',
    justifyContent: 'space-around',
  })

  const keyboardControlsStyle = css({
    flexDirection: 'column',
  })

  const defaultStyle = css({
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  })

  const render = () => {
    if (mainMenuState === MainMenuStateNames.cutting) {
      return (
        <div css={[mainContentStyle, cuttingStyle]} role="main">
          <Video />
          <CuttingActions />
          <CuttingTimeline />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.metadata) {
      return (
        <div css={[mainContentStyle, metadataStyle]} role="main">
          <Metadata />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.trackSelection) {
      return (
        <div css={[mainContentStyle, trackSelectStyle]} role="main">
          <TrackSelection />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.subtitles) {
      return (
        <div css={[mainContentStyle, subtitleSelectStyle]} role="main">
          <Subtitle />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.thumbnail) {
      return (
        <div css={[mainContentStyle, thumbnailSelectStyle]} role="main">
          <Thumbnail />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.finish) {
      return (
        <div css={[mainContentStyle, finishStyle]} role="main">
          <Finish />
        </div>
        )
    } else if (mainMenuState === MainMenuStateNames.keyboardControls) {
      return (
        <div css={[mainContentStyle, keyboardControlsStyle]} role="main">
          <ThemeSwitcher/>
          <KeyboardControls />
        </div>
        )
    } else {
      <div css={[mainContentStyle, defaultStyle]} role="main">
        <FontAwesomeIcon icon={faTools} size="10x" />
        Placeholder
      </div>
    }
  }

  return (
    <>{render()}</>
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
