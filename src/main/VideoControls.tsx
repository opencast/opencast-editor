import React from "react";

import { css } from '@emotion/react'

import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { FiPlay, FiPause } from "react-icons/fi";

import { useSelector, useDispatch } from 'react-redux';
import {
  selectDuration,
} from '../redux/videoSlice'

import { convertMsToReadableString } from '../util/utilityFunctions'
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles";

import { GlobalHotKeys, KeyMapOptions } from 'react-hotkeys';
import { videoPlayerKeyMap } from "../globalKeys";
import { SyntheticEvent } from "react";
import { useTranslation } from 'react-i18next';

import { RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { ThemedTooltip } from "./Tooltip";
import { selectTheme, Theme } from "../redux/themeSlice";

/**
 * Contains controls for manipulating multiple video players at once
 * Flexbox magic keeps the play button at the center
 */
const VideoControls: React.FC<{
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying: (state: RootState) => boolean,
  selectIsPlayPreview: (state: RootState) => boolean,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
  setIsPlayPreview: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectCurrentlyAt,
  selectIsPlaying,
  selectIsPlayPreview,
  setIsPlaying,
  setIsPlayPreview
}) => {

  const theme = useSelector(selectTheme);

  const videoControlsRowStyle = css({
    background: `${theme.background}`,
    outline: `5px solid ${theme.background}`, // Fake the box bigger than it actually is
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '10px',
    ...(flexGapReplacementStyle(30, false)),
  })

  const leftSideBoxStyle = css({
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end'
  })

  const rightSideBoxStyle = css({
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start'
  })

  return (
    <div css={videoControlsRowStyle}>
      <div css={leftSideBoxStyle}>
        <TimeDisplay
          selectCurrentlyAt={selectCurrentlyAt}
        />
      </div>
      <PlayButton
        selectIsPlaying={selectIsPlaying}
        setIsPlaying={setIsPlaying}
      />
      <div css={rightSideBoxStyle}>
        <PreviewMode
          selectIsPlayPreview={selectIsPlayPreview}
          setIsPlayPreview={setIsPlayPreview}
        />
      </div>
    </div>
  );
}

/**
 * Enable/Disable Preview Mode
 */
const PreviewMode: React.FC<{
  selectIsPlayPreview: (state: RootState) => boolean,
  setIsPlayPreview: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectIsPlayPreview,
  setIsPlayPreview
}) => {

  const { t } = useTranslation();
  const ref = React.useRef<HTMLDivElement>(null)

  // Init redux variables
  const dispatch = useDispatch();
  const isPlayPreview = useSelector(selectIsPlayPreview)
  const theme = useSelector(selectTheme);

  // Change preview mode from "on" to "off" and vice versa
  const switchPlayPreview = (event: KeyboardEvent | SyntheticEvent, ref: React.RefObject<HTMLDivElement> | undefined) => {
    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    dispatch(setIsPlayPreview(!isPlayPreview))

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  const handlers = {
    // preview: switchPlayPreview,
    preview: (keyEvent?: KeyboardEvent) => { if (keyEvent) { switchPlayPreview(keyEvent, undefined) } }
  }

  const previewModeStyle = css({
    cursor: "pointer",
    display: 'flex',
    ...(flexGapReplacementStyle(10, false)),
    justifyContent: 'center',
    alignItems: 'center'
  })

  const switchIconStyle = css({
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.05)',
    },
    color: `#3073b8`,
    fontSize: '28px',
  })

  const previewModeTextStyle = (theme: Theme) => css({
    display: 'inline-block',
    flexWrap: 'nowrap',
    color: `${theme.text_black}`
  })

  return (
    <ThemedTooltip
      title={t("video.previewButton-tooltip", { status: (isPlayPreview ? "on" : "off"),
        hotkeyName: (videoPlayerKeyMap[handlers.preview.name] as KeyMapOptions).sequence })}
    >
      <div css={previewModeStyle}
        ref={ref}
        role="switch" aria-checked={isPlayPreview} tabIndex={0} aria-hidden={false}
        aria-label={t("video.previewButton-aria", { hotkeyName: (videoPlayerKeyMap[handlers.preview.name] as KeyMapOptions).sequence })}
        onClick={(event: SyntheticEvent) => switchPlayPreview(event, ref)}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " ") {
          switchPlayPreview(event, undefined)
        } }}>
        <GlobalHotKeys keyMap={videoPlayerKeyMap} handlers={handlers} allowChanges={true} />
        <div css={previewModeTextStyle(theme)}>
          {t("video.previewButton")}
        </div>
        {isPlayPreview ? <FaToggleOn css={switchIconStyle} /> : <FaToggleOff css={switchIconStyle} />}
      </div>
    </ThemedTooltip>
  );
}

/**
 * Start/Pause playing the videos
 */
const PlayButton: React.FC<{
  selectIsPlaying:(state: RootState) => boolean,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectIsPlaying,
  setIsPlaying,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const theme = useSelector(selectTheme);

  // Change play mode from "on" to "off" and vice versa
  const switchIsPlaying = (event: KeyboardEvent | SyntheticEvent) => {
    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    dispatch(setIsPlaying(!isPlaying))
  }

  // Maps functions to hotkeys
  const handlers = {
    play: (keyEvent?: KeyboardEvent) => { if (keyEvent) { switchIsPlaying(keyEvent) } }
  }

  const playButtonStyle = css({
    justifySelf: 'center',
    outline: 'none',
    color: `${theme.icon_color}`,

    background: '#3073b8',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    boxShadow: `${theme.boxShadow_tiles}`
  })

  return (
    <ThemedTooltip title={isPlaying ? t("video.pauseButton-tooltip") : t("video.playButton-tooltip")}>
      <div>
        <GlobalHotKeys keyMap={videoPlayerKeyMap} handlers={handlers} allowChanges={true} />
        <div css={[basicButtonStyle(theme), playButtonStyle]}
          role="button" aria-pressed={isPlaying} tabIndex={0} aria-hidden={false}
          aria-label={t("video.playButton-tooltip")}
          onClick={(event: SyntheticEvent) => { switchIsPlaying(event) }}
          onKeyDown={(event: React.KeyboardEvent) => { if (event.key === "Enter") { // "Space" is handled by global key
            switchIsPlaying(event)
          } }}>
          {isPlaying ? <FiPause css={{fontSize: 24}} /> : <FiPlay css={{fontSize: 24}} />}
        </div>
      </div>
    </ThemedTooltip>
  );
}

/**
 * Live update for the current time
 */
const TimeDisplay: React.FC<{
  selectCurrentlyAt: (state: RootState) => number,
}> = ({
  selectCurrentlyAt,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)
  const theme = useSelector(selectTheme)

  const timeTextStyle = (theme: Theme) => css({
    display: 'inline-block',
    width: '100px',
    color: `${theme.text_black}`
  })

  return (
    <div css={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
      <ThemedTooltip title={t("video.current-time-tooltip")}>
        <time css={timeTextStyle(theme)}
          tabIndex={0} role="timer" aria-label={t("video.time-aria") + ": " + convertMsToReadableString(currentlyAt)}>
          {new Date((currentlyAt ? currentlyAt : 0)).toISOString().substr(11, 12)}
        </time>
      </ThemedTooltip>
      {" / "}
      <ThemedTooltip title={t("video.time-duration-tooltip")}>
        <div css={timeTextStyle(theme)}
          tabIndex={0} aria-label={t("video.duration-aria") + ": " + convertMsToReadableString(duration)}>
          {new Date((duration ? duration : 0)).toISOString().substr(11, 12)}
        </div>
      </ThemedTooltip>
    </div>
  );
}

export default VideoControls
