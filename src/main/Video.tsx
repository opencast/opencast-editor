import React, { useState, useRef, useEffect, useImperativeHandle } from "react";

import { css } from '@emotion/react'

import { httpRequestState } from '../types'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faToggleOn, faToggleOff, faGears} from "@fortawesome/free-solid-svg-icons";

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAt, selectCurrentlyAtInSeconds, setIsPlaying,
  fetchVideoInformation, selectVideoURL, selectVideoCount, selectDurationInSeconds, selectTitle,
  setPreviewTriggered, selectPreviewTriggered, selectIsPlayPreview, setIsPlayPreview, setAspectRatio, selectAspectRatio, selectDuration, setClickTriggered, selectClickTriggered, setCurrentlyAt
} from '../redux/videoSlice'

import ReactPlayer, { Config } from 'react-player'

import { roundToDecimalPlace, convertMsToReadableString } from '../util/utilityFunctions'
import { basicButtonStyle, flexGapReplacementStyle, titleStyle, titleStyleBold } from "../cssStyles";

import { GlobalHotKeys, KeyMapOptions } from 'react-hotkeys';
import { videoPlayerKeyMap } from "../globalKeys";
import { SyntheticEvent } from "react";
import { useTranslation } from 'react-i18next';
import { selectTitleFromEpisodeDc } from "../redux/metadataSlice";
import { setError } from "../redux/errorSlice";

import { sleep } from './../util/utilityFunctions'

import { AppDispatch, RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { ThemedTooltip } from "./Tooltip";
import { selectTheme, Theme } from "../redux/themeSlice";

/**
 * Container for the videos and their controls
 * TODO: Move fetching to a more central part of the app
 */
export const Video: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch<AppDispatch>()
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);
  const error = useSelector((state: { videoState: { error: httpRequestState["error"] } }) => state.videoState.error)
  const theme = useSelector(selectTheme);
  const errorReason = useSelector((state: { videoState: { errorReason: httpRequestState["errorReason"] } }) => state.videoState.errorReason)

  // Try to fetch URL from external API
  useEffect(() => {
    if (videoURLStatus === 'idle') {
      dispatch(fetchVideoInformation())
    } else if (videoURLStatus === 'failed') {
      if (errorReason === 'workflowActive') {
        dispatch(setError({error: true, errorTitle: t("error.workflowActive-errorTitle"), errorMessage: t("error.workflowActive-errorMessage"), errorDetails: undefined, errorIcon: faGears}))
      } else {
        dispatch(setError({error: true, errorTitle: undefined, errorMessage: t("video.comError-text"), errorDetails: error, errorIcon: undefined}))
      }
    }
  }, [videoURLStatus, dispatch, error, t, errorReason])

  // Update based on current fetching status
  // let content
  // if (videoURLStatus === 'loading') {
  //   content = <div className="loader">Loading...</div>
  // } else if (videoURLStatus === 'success') {
  //   content = ""//<div className="loader">Success...</div>
  // } else if (videoURLStatus === 'failed') {
  //   content = <div>{error}</div>
  // }

  // Style
  const videoAreaStyle = css({
    display: 'flex',
    width: 'auto',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px',
    borderBottom: `${theme.menuBorder}`,
  });

  return (
    <div css={videoAreaStyle}>
      <VideoHeader />
      <VideoPlayers refs={undefined}/>
      <VideoControls
        selectCurrentlyAt={selectCurrentlyAt}
        selectIsPlaying={selectIsPlaying}
        selectIsPlayPreview={selectIsPlayPreview}
        setIsPlaying={setIsPlaying}
        setIsPlayPreview={setIsPlayPreview}
      />
    </div>
  );
};

export const VideoPlayers: React.FC<{refs: any, widthInPercent?: number}> = ({refs, widthInPercent=100}) => {

  const videoURLs = useSelector(selectVideoURL)
  const videoCount = useSelector(selectVideoCount)

  const videoPlayerAreaStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: widthInPercent + '%',
  });

  // Initialize video players
  const videoPlayers: JSX.Element[] = [];
  for (let i = 0; i < videoCount; i++) {
    videoPlayers.push(
      <VideoPlayer
        key={i}
        dataKey={i}
        url={videoURLs[i]}
        isPrimary={i === 0}
        subtitleUrl={""}
        selectIsPlaying={selectIsPlaying}
        selectCurrentlyAtInSeconds={selectCurrentlyAtInSeconds}
        selectPreviewTriggered={selectPreviewTriggered}
        selectClickTriggered={selectClickTriggered}
        selectAspectRatio={selectAspectRatio}
        setIsPlaying={setIsPlaying}
        setPreviewTriggered={setPreviewTriggered}
        setClickTriggered={setClickTriggered}
        setCurrentlyAt={setCurrentlyAt}
        setAspectRatio={setAspectRatio}
        ref={(el) => {
          if (refs === undefined) return
          (refs.current[i] = el)
        }}
      />
    );
  }

  return (
    <div css={videoPlayerAreaStyle}>
      {videoPlayers}
    </div>
  );
}

/**
 * A single video player
 * @param {string} url - URL to load video from
 * @param {boolean} isPrimary - If the player is the main control
 */
export const VideoPlayer = React.forwardRef(
  (props: {
    dataKey: number,
    url: string | undefined,
    isPrimary: boolean,
    subtitleUrl: string,
    selectIsPlaying:(state: RootState) => boolean,
    selectCurrentlyAtInSeconds: (state: RootState) => number,
    selectPreviewTriggered:(state: RootState) => boolean,
    selectClickTriggered:(state: RootState) => boolean,
    selectAspectRatio: (state: RootState) => number,
    setIsPlaying: ActionCreatorWithPayload<boolean, string>,
    setPreviewTriggered: ActionCreatorWithPayload<any, string>,
    setClickTriggered: ActionCreatorWithPayload<any, string>,
    setCurrentlyAt: any,
    setAspectRatio: ActionCreatorWithPayload<{dataKey: number} & {width: number, height: number}, string>,
  },
  forwardRefThing
) => {
  const {
    dataKey,
    url,
    isPrimary,
    selectIsPlaying,
    subtitleUrl,
    selectCurrentlyAtInSeconds,
    selectPreviewTriggered,
    selectClickTriggered,
    selectAspectRatio,
    setIsPlaying,
    setPreviewTriggered,
    setClickTriggered,
    setCurrentlyAt,
    setAspectRatio,
  } = props

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAtInSeconds)
  const duration  = useSelector(selectDurationInSeconds)
  const previewTriggered = useSelector(selectPreviewTriggered)
  const clickTriggered = useSelector(selectClickTriggered)
  const aspectRatio = useSelector(selectAspectRatio)
  const theme = useSelector(selectTheme)

  // Init state variables
  const ref = useRef<ReactPlayer>(null);
  const [ready, setReady] = useState(false);
  const [errorState, setError] = useState(false);
  const [isAspectRatioUpdated, setIsAspectRatioUpdated] = useState(false);

  // Callback for when the video is playing
  const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds:  number }) => {
    if (isPrimary) {
      // Only update redux if there was a substantial change
      if (roundToDecimalPlace(currentlyAt, 3) !== roundToDecimalPlace(state.playedSeconds, 3) &&
          state.playedSeconds !== 0 &&
          // Avoid overwriting video restarts
          state.playedSeconds < duration) {
        dispatch(setCurrentlyAt(state.playedSeconds * 1000))
      }
    }
  }

  // Tries to get video dimensions from the HTML5 elements until they are not 0,
  // then updates the store
  async function updateAspectRatio() {
    if (ref.current && ref.current.getInternalPlayer()) {
      let w = (ref.current.getInternalPlayer() as HTMLVideoElement).videoWidth
      let h = (ref.current.getInternalPlayer() as HTMLVideoElement).videoHeight
      while (w === 0 || h === 0) {
        await sleep(100);
        w = (ref.current.getInternalPlayer() as HTMLVideoElement).videoWidth
        h = (ref.current.getInternalPlayer() as HTMLVideoElement).videoHeight
      }
      dispatch(setAspectRatio({dataKey, width: w, height: h}))
      setIsAspectRatioUpdated(true)
    }
  }

  // Callback for checking whether the video element is ready
  const onReadyCallback = () => {
    setReady(true);
  }

  const onPlay = () => {
    // Restart the video from the beginning when at the end
    if (isPrimary && currentlyAt >= duration) {
      dispatch(setCurrentlyAt(0))
      // Flip-flop the "isPlaying" switch, or else the video won't start playing
      dispatch(setIsPlaying(false));
      dispatch(setIsPlaying(true));
    }
  }

  const onEndedCallback = () => {
    if (isPrimary && currentlyAt !== 0) {
      dispatch(setIsPlaying(false));
      dispatch(setCurrentlyAt(duration * 1000)); // It seems onEnded is called before the full duration is reached, so we set currentlyAt to the very end
    }
  }

  const onErrorCallback = (e: any) => {
    setError(true)
  }

  useEffect(() => {
    // Seek if the position in the video got changed externally
    if (!isPlaying && ref.current && ready) {
      ref.current.seekTo(currentlyAt, "seconds")
    }
    if (previewTriggered && ref.current && ready) {
      ref.current.seekTo(currentlyAt, "seconds")
      dispatch(setPreviewTriggered(false))
    }
    if (clickTriggered && ref.current && ready) {
      ref.current.seekTo(currentlyAt, "seconds")
      dispatch(setClickTriggered(false))
    }
    if (!isAspectRatioUpdated && ready) {     //     if (!isAspectRatioUpdated && ref.current && ready) {
      // Update the store with video dimensions for rendering purposes
      updateAspectRatio();
    }
  })

  // Callback specifically for the subtitle editor view
  // When changing urls while the player is playing, don't reset to 0
  // (due to onProgressCallback resetting to 0),
  // but keep the current currentlyAt
  useEffect(() => {
    if (ref.current && ready) {
      ref.current.seekTo(currentlyAt, "seconds")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  // Trigger a workaround for subtitles not being displayed in the video in Firefox
  useEffect(() => {
    // Only trigger workaround in Firefox, as it will cause issues in Chrome
    // @ts-ignore
    if (typeof InstallTrigger !== 'undefined') {
      reAddTrack()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitleUrl])

  const playerConfig: Config = {
    file: {
      attributes: {
        // Skip player when navigating page with keyboard
        tabIndex: '-1',
        crossOrigin: "anonymous"    // allow thumbnail generation
      },
      tracks: [
        {kind: 'subtitles', src: subtitleUrl, srcLang: 'en', default: true, label: 'I am irrelevant'}
      ]
    }
  }

  /**
   * Workaround for subtitles not appearing in Firefox (or only appearing on inital mount, then disappearing
   * when changed). Removes old tracks and readds them, because letting React to it does not seem
   * to work properly.
   * Fairly hacky, currently only works for a page with only one video
   * https://github.com/CookPete/react-player/issues/490
   */
  function reAddTrack() {
    const video = document.querySelector('video');

    if (video) {
      const oldTracks = video.querySelectorAll('track');
      oldTracks.forEach((oldTrack) => {
        video.removeChild(oldTrack);
      });
    }

    if (playerConfig && playerConfig.file && playerConfig.file.tracks) {
      // eslint-disable-next-line array-callback-return
      playerConfig.file.tracks.map((t, trackIdx) => {
        const track = document.createElement('track');
        track.kind = t.kind!;
        track.label = t.label!;
        track.srclang = t.srcLang!;
        track.default = t.default!;
        track.src = t.src!;
        track.track.mode = 'showing'    // Because the load callback may sometimes not execute properly
        track.addEventListener('error', (e: Event) => {
          console.warn(`Cannot load track ${t.src!}`)
        });
        track.addEventListener('load', (e: Event) => {
          const textTrack = e.currentTarget as HTMLTrackElement;
          if (textTrack) {
            if (t.default === true) {
              textTrack.track.mode = 'showing';
              video!.textTracks[trackIdx].mode = 'showing'; // thanks Firefox
            } else {
              textTrack.track.mode = 'hidden';
              video!.textTracks[trackIdx].mode = 'hidden'; // thanks Firefox
            }
          }
        });
        const video = document.querySelector('video');
        if (video) {
          video.appendChild(track);
        }
      });
    }
  }

  // External functions
  useImperativeHandle(forwardRefThing, () => ({
    // Renders the current frame in the video element to a canvas
    // Returns the data url
    captureVideo() {
      const video = ref.current?.getInternalPlayer() as HTMLVideoElement
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      var canvasContext = canvas.getContext("2d");
      if (canvasContext !== null) {
        canvasContext.drawImage(video, 0, 0);
        return canvas.toDataURL('image/png')
      }
    }
  }));

  const errorBoxStyle = css({
    ...(!errorState) && {display: "none"},
    borderColor: `${theme.error}`,
    borderStyle: 'dashed',
    fontWeight: 'bold',
    padding: '10px',
  })

  const playerWrapper = css({
    position: 'relative',
    width: '100%',
    paddingTop: aspectRatio + '%',
  });

  const reactPlayerStyle = css({
    position: 'absolute',
    top: 0,
    left: 0,
    background: ' black',
  })

  const render = () => {
    if (!errorState) {
      return(
        <div css={playerWrapper}>
          <ReactPlayer url={url}
            css={reactPlayerStyle}
            ref={ref}
            width='100%'
            height='100%'
            playing={isPlaying}
            muted={!isPrimary}
            onProgress={onProgressCallback}
            progressInterval={100}
            onReady={onReadyCallback}
            onPlay={onPlay}
            onEnded={onEndedCallback}
            onError={onErrorCallback}
            tabIndex={-1}
            config={playerConfig}
            disablePictureInPicture
          />
        </div>
      );
    } else {
      return (
        <div css={errorBoxStyle} role="alert">
          <span>{t("video.loadError-text")} </span>
        </div>
      );
    }
  }

  return (
    <>
      {render()}
    </>
  );

  // return (
  //   <div title="Video Player">
  //     <video width="320" height="240" controls ref={vidRef}>
  //     <source src="https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4" type="video/mp4" />
  //     Your browser does not support the video tag.
  //     </video>
  //   </div>
  // );
});

/**
 * Contains controls for manipulating multiple video players at once
 * Flexbox magic keeps the play button at the center
 */
export const VideoControls: React.FC<{
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

  const videoControlsRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    ...(flexGapReplacementStyle(50, false)),
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
        <PreviewMode
          selectIsPlayPreview={selectIsPlayPreview}
          setIsPlayPreview={setIsPlayPreview}
        />
      </div>
        <PlayButton
          selectIsPlaying={selectIsPlaying}
          setIsPlaying={setIsPlaying}
        />
      <div css={rightSideBoxStyle}>
        <TimeDisplay
          selectCurrentlyAt={selectCurrentlyAt}
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
    preview: (keyEvent?: KeyboardEvent) => { if(keyEvent) { switchPlayPreview(keyEvent, undefined) } }
  }

  const previewModeStyle = css({
    cursor: "pointer",
    display: 'flex',
    ...(flexGapReplacementStyle(10, false)),
    justifyContent: 'center',
    alignItems: 'center'
  })

  const switchIconStyle = (theme: Theme) => css({
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.05)',
    },
    color: `${theme.icon_color}`,
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
        onClick={ (event: SyntheticEvent) => switchPlayPreview(event, ref) }
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " ") {
          switchPlayPreview(event, undefined)
        }}}>
        <GlobalHotKeys keyMap={videoPlayerKeyMap} handlers={handlers} allowChanges={true} />
        <div css={{display: 'inline-block', flexWrap: 'nowrap'}}>
          {t("video.previewButton")}
        </div>
        <FontAwesomeIcon css={switchIconStyle(theme)} icon={isPlayPreview ? faToggleOn : faToggleOff} size="1x"/>
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
    play: (keyEvent?: KeyboardEvent) => { if(keyEvent) { switchIsPlaying(keyEvent) } }
  }

  return (
    <ThemedTooltip title={isPlaying ? t("video.pauseButton-tooltip") : t("video.playButton-tooltip")}>
      <div>
      <GlobalHotKeys keyMap={videoPlayerKeyMap} handlers={handlers} allowChanges={true} />
      <FontAwesomeIcon css={[basicButtonStyle(theme), {justifySelf: 'center', outline: 'none', color: `${theme.icon_color}`}]} icon={isPlaying ? faPause : faPlay} size="2x"
        role="button" aria-pressed={isPlaying} tabIndex={0} aria-hidden={false}
        aria-label={t("video.playButton-tooltip")}
        onClick={(event: SyntheticEvent) => { switchIsPlaying(event) }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === "Enter") { // "Space" is handled by global key
          switchIsPlaying(event)
        }}}
      />
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

  return (
    <div css={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
      <ThemedTooltip title={t("video.current-time-tooltip")}>
        <time css={{display: 'inline-block', width: '100px'}}
          tabIndex={0} role="timer" aria-label={t("video.time-aria")+": " + convertMsToReadableString(currentlyAt)}>
          {new Date((currentlyAt ? currentlyAt : 0)).toISOString().substr(11, 12)}
        </time>
      </ThemedTooltip>
      {" / "}
      <ThemedTooltip title={t("video.time-duration-tooltip")}>
        <div tabIndex={0} aria-label={t("video.duration-aria")+": " + convertMsToReadableString(duration)}>
          {new Date((duration ? duration : 0)).toISOString().substr(11, 12)}
        </div>
      </ThemedTooltip>
    </div>
  );
}

/**
 * Displays elements above the video, e.g. title
 */
const VideoHeader: React.FC<{}> = () => {

  const title = useSelector(selectTitle)
  const metadataTitle = useSelector(selectTitleFromEpisodeDc)

  return (
    <div css={[titleStyle, titleStyleBold]}>
        {metadataTitle ? metadataTitle : title}
    </div>
  );
}

export default Video;
