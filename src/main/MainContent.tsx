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
  const theme = useSelector(selectTheme)

  // Display warning when leaving the page if there are unsaved changes
  useBeforeunload((event: { preventDefault: () => void; }) => {
    if (videoChanged || metadataChanged) {
      event.preventDefault();
    }
  });

  const cuttingStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    background: `${theme.background}`,
  })

  const metadataStyle = css({
    display: 'flex',
    // flexDirection: 'column' as const,
    // justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    background: `${theme.background}`,
  })

  const trackSelectStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    background: `${theme.background}`,
  })

  const subtitleSelectStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    paddingRight: '20px',
    paddingLeft: '161px',
    height: '100%',
  })

  const thumbnailSelectStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    background: `${theme.background}`,
  })

  const finishStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    minHeight: '100vh',
    background: `${theme.background}`,
  })

  const keyboardControlsStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    // justifyContent: 'space-around',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
    paddingLeft: '161px',
    background: `${theme.background}`,
  })

  const defaultStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    ...(flexGapReplacementStyle(20, false)),
  })

  const render = () => {
    if (mainMenuState === MainMenuStateNames.cutting) {
      return (
        <div css={cuttingStyle}>
          <Video />
          <CuttingActions />
          <CuttingTimeline />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.metadata) {
      return (
        <div css={metadataStyle}>
          <Metadata />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.trackSelection) {
      return (
        <div css={trackSelectStyle}>
          <TrackSelection />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.subtitles) {
      return (
        <div css={subtitleSelectStyle}>
          <Subtitle />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.thumbnail) {
      return (
        <div css={thumbnailSelectStyle}>
          <Thumbnail />
        </div>
      )
    } else if (mainMenuState === MainMenuStateNames.finish) {
      return (
        <div css={finishStyle}>
          <Finish />
        </div>
        )
    } else if (mainMenuState === MainMenuStateNames.keyboardControls) {
      return (
        <div css={keyboardControlsStyle}>
          <ThemeSwitcher/>
          <KeyboardControls />
        </div>
        )
    } else {
      <div css={defaultStyle}>
        <FontAwesomeIcon icon={faTools} size="10x" />
        Placeholder
      </div>
    }
  }

  return (
     <main css={{width: '100%'}} role="main">
      {render()}
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
