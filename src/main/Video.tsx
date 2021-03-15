import React, { useState, useRef, useEffect } from "react";

import { css } from '@emotion/react'

import { httpRequestState } from '../types'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faToggleOn, faToggleOff} from "@fortawesome/free-solid-svg-icons";

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAt, selectCurrentlyAtInSeconds, setIsPlaying, setCurrentlyAtInSeconds,
  fetchVideoInformation, selectVideoURL, selectVideoCount, selectDurationInSeconds, selectTitle, selectPresenters,
  setPreviewTriggered, selectPreviewTriggered, selectIsPlayPreview, setIsPlayPreview, setAspectRatio, selectAspectRatio, selectDuration
} from '../redux/videoSlice'

import ReactPlayer, { Config } from 'react-player'

import { roundToDecimalPlace, convertMsToReadableString } from '../util/utilityFunctions'
import { errorBoxStyle, basicButtonStyle } from "../cssStyles";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * Container for the videos and their controls
 * TODO: Move fetching to a more central part of the app
 */
const Video: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch()
  const videoURLs = useSelector(selectVideoURL)
  const videoCount = useSelector(selectVideoCount)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);
  const error = useSelector((state: { videoState: { error: httpRequestState["error"] } }) => state.videoState.error)

  // Try to fetch URL from external API
  useEffect(() => {
    if (videoURLStatus === 'idle') {
        dispatch(fetchVideoInformation())
    }
  }, [videoURLStatus, dispatch])

  // Update based on current fetching status
  // let content
  // if (videoURLStatus === 'loading') {
  //   content = <div className="loader">Loading...</div>
  // } else if (videoURLStatus === 'success') {
  //   content = ""//<div className="loader">Success...</div>
  // } else if (videoURLStatus === 'failed') {
  //   content = <div>{error}</div>
  // }

  // Initialize video players
  const videoPlayers: JSX.Element[] = [];
  for (let i = 0; i < videoCount; i++) {
    // videoPlayers.push(<VideoPlayer key={i} url='https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4' />);
    videoPlayers.push(<VideoPlayer key={i} dataKey={i} url={videoURLs[i]} isPrimary={i === 0}/>);
  }

  const errorBox = () => {
    return (
      <div css={errorBoxStyle(videoURLStatus === "failed")} title="Error Box" role="alert">
        <span>{t("video.comError-text")}</span><br />
        {error ? t("various.error-details-text", {errorMessage: error}) : t("various.error-noDetails-text")}<br />
      </div>
    );
  }

  // Style
  const videoAreaStyle = css({
    display: 'flex',
    width: 'auto',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px',
    borderBottom: '1px solid #BBB',
  });

  const videoPlayerAreaStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  });

  return (
    <div css={videoAreaStyle} title={t("video.area-tooltip")}>
      {errorBox()}
      <VideoHeader />
      <div css={videoPlayerAreaStyle} title={t("video.area-player-tooltip")}>
        {videoPlayers}
      </div>
      <VideoControls />
    </div>
  );
};

/**
 * A single video player
 * @param {string} url - URL to load video from
 * @param {boolean} isPrimary - If the player is the main control
 */
const VideoPlayer: React.FC<{dataKey: number, url: string, isPrimary: boolean}> = ({dataKey, url, isPrimary}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAtInSeconds)
  const duration  = useSelector(selectDurationInSeconds)
  const previewTriggered = useSelector(selectPreviewTriggered)
  const aspectRatio = useSelector(selectAspectRatio)

  // Init state variables
  const ref = useRef<ReactPlayer>(null);
  const [ready, setReady] = useState(false);
  const [errorState, setError] = useState(false);

  // Callback for when the video is playing
  const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds:  number }) => {
    if (isPrimary) {
      // Only update redux if there was a substantial change
      if (roundToDecimalPlace(currentlyAt, 3) !== roundToDecimalPlace(state.playedSeconds, 3)) {
        dispatch(setCurrentlyAtInSeconds(state.playedSeconds))
      }
    }
  }

  // Callback for checking whether the video element is ready
  const onReadyCallback = () => {
    setReady(true);

    if (ref.current && ref.current.getInternalPlayer()) {
      let w = (ref.current.getInternalPlayer() as HTMLVideoElement).videoWidth
      let h = (ref.current.getInternalPlayer() as HTMLVideoElement).videoHeight
      dispatch(setAspectRatio({dataKey, width: w, height: h}))
    }
  }

  const onEndedCallback = () => {
    if (isPrimary) {
      dispatch(setIsPlaying(false));
      dispatch(setCurrentlyAtInSeconds(duration)); // It seems onEnded is called before the full duration is reached, so we set currentlyAt to the very end
    }
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
  })

  const onErrorCallback = (e: any) => {
    setError(true)
  }

  // Skip player when navigating page with keyboard
  const playerConfig: Config = {
    file: { attributes: { tabIndex: '-1' }}
  }

  const errorBoxStyle = css({
    ...(!errorState) && {display: "none"},
    borderColor: 'red',
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
  })

  const render = () => {
    if (!errorState) {
      return(
        <div css={playerWrapper} title="playerWrapper">
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
        <div css={errorBoxStyle} title="Error Box" role="alert">
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
};

/**
 * Contains controls for manipulating multiple video players at once
 * Flexbox magic keeps the play button at the center
 */
const VideoControls: React.FC<{}> = () => {

  const { t } = useTranslation();

  const videoControlsRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    gap: '50px',
  })

  const leftSideBoxStyle = css({
    width: '100%',
    display: 'flex',
    justifyContent: 'right'
  })

  const rightSideBoxStyle = css({
    width: '100%',
    display: 'flex',
    justifyContent: 'left'
  })

  return (
    <div css={videoControlsRowStyle} title={t("video.controls-tooltip")}>
      <div css={leftSideBoxStyle}>
        <PreviewMode />
      </div>
      <PlayButton />
      <div css={rightSideBoxStyle}>
        <TimeDisplay />
      </div>
    </div>
  );
}

/**
 * Enable/Disable Preview Mode
 */
const PreviewMode: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlayPreview = useSelector(selectIsPlayPreview)

  // Change preview mode from "on" to "off" and vice versa
  const switchPlayPreview = () => {
    dispatch(setIsPlayPreview(!isPlayPreview))
  }

  const previewModeStyle = css({
    cursor: "pointer",
    display: 'flex',
    gap: '10px',
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
  })

  var title = (isPlayPreview ? t("video.previewButton-on-tooltip") : t("video.previewButton-off-tooltip"));

  return (
    <div css={previewModeStyle}
      title={title}
      role="switch" aria-checked={isPlayPreview} tabIndex={0} aria-hidden={false}
      aria-label={t("video.previewButton-aria")}
      onClick={ switchPlayPreview }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " ") {
        switchPlayPreview()
      }}}>
      <div css={{display: 'inline-block', flexWrap: 'nowrap'}}>
        {t("video.previewButton")}
      </div>
      <FontAwesomeIcon css={switchIconStyle} icon={isPlayPreview ? faToggleOn : faToggleOff} size="1x"/>
    </div>
  );
}

/**
 * Start/Pause playing the videos
 */
const PlayButton: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)

  // Change play mode from "on" to "off" and vice versa
  const switchIsPlaying = () => {
    dispatch(setIsPlaying(!isPlaying))
  }

  return (
    <FontAwesomeIcon css={[basicButtonStyle, {justifySelf: 'center'}]} icon={isPlaying ? faPause : faPlay} size="2x"
      title={t("video.playButton-tooltip")}
      role="button" aria-pressed={isPlaying} tabIndex={0} aria-hidden={false}
      aria-label={t("video.playButton-tooltip")}
      onClick={ switchIsPlaying }
      onKeyDown={(event: React.KeyboardEvent<SVGSVGElement>) => { if (event.key === " " || event.key === "Enter") {
        switchIsPlaying()
      }}}
    />
  );
}

/**
 * Live update for the current time
 */
const TimeDisplay: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)

  return (
    <div css={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
      <time css={{display: 'inline-block', width: '100px'}}
        title={t("video.time-duration-tooltip")}
        tabIndex={0} role="timer" aria-label={t("video.time-aria")+": " + convertMsToReadableString(currentlyAt)}>
        {new Date((currentlyAt ? currentlyAt : 0)).toISOString().substr(11, 12)}
      </time>
      {" / "}
      <div tabIndex={0} aria-label={t("video.duration-aria")+": " + convertMsToReadableString(duration)}>
        {new Date((duration ? duration : 0)).toISOString().substr(11, 12)}
      </div>
    </div>
  );
}

/**
 * Displays elements above the video, e.g. title
 */
const VideoHeader: React.FC<{}> = () => {

  const { t } = useTranslation();

  const title = useSelector(selectTitle)
  const presenters = useSelector(selectPresenters)

  const titleStyle = css({
    display: 'inline-block',
    padding: '15px',
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    maxWidth: '500px',
  })

  const titleStyleBold = css({
    fontWeight: 'bold',
    fontSize: '24px',
    verticalAlign: '-2.5px',
  })

  let presenter_header;
  if (presenters && presenters.length) {
      presenter_header = <div css={titleStyle} title={t("video.presenter-tooltip")}>by {presenters.join(", ")}</div>
  }
  return (
    <div title={t("video.area-tooltip")} css={{fontSize: '16px'}}>
      <div css={[titleStyle, titleStyleBold]} title={t("video.title-tooltip")}>{title}</div>
      {presenter_header}
    </div>
  );
}

export default Video;
