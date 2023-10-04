import React, { useState, useRef, useEffect, useImperativeHandle } from "react";

import { css } from '@emotion/react'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAtInSeconds, setIsPlaying,
  selectVideoURL, selectVideoCount, selectDurationInSeconds,
  setPreviewTriggered, selectPreviewTriggered, setAspectRatio, selectAspectRatio, setClickTriggered, selectClickTriggered, setCurrentlyAt
} from '../redux/videoSlice'

import ReactPlayer, { Config } from 'react-player'

import { roundToDecimalPlace } from '../util/utilityFunctions'

import { useTranslation } from 'react-i18next';

import { sleep } from './../util/utilityFunctions'

import { RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { useTheme } from "../themes";

import { backgroundBoxStyle, flexGapReplacementStyle } from '../cssStyles'

const VideoPlayers: React.FC<{refs: any, widthInPercent?: number}> = ({refs, widthInPercent = 100}) => {

  const videoURLs = useSelector(selectVideoURL)
  const videoCount = useSelector(selectVideoCount)

  const videoPlayerAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    width: widthInPercent + '%',
    borderRadius: '5px',
    ...(flexGapReplacementStyle(10, false)),

    maxHeight: '300px',
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
        first={i === 0}
        last={i === videoCount - 1}
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
        ref={el => {
          if (refs === undefined) { return }
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
    first: boolean,
    last: boolean,
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
      first,
      last,
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
    const duration = useSelector(selectDurationInSeconds)
    const previewTriggered = useSelector(selectPreviewTriggered)
    const clickTriggered = useSelector(selectClickTriggered)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aspectRatio = useSelector(selectAspectRatio)
    const theme = useTheme()

    // Init state variables
    const ref = useRef<ReactPlayer>(null);
    const [ready, setReady] = useState(false);
    const [errorState, setError] = useState(false);
    const [isAspectRatioUpdated, setIsAspectRatioUpdated] = useState(false);

    // Callback for when the video is playing
    const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
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

    const onErrorCallback = (_e: any) => {
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
    })

    useEffect(() => {
      if (!isAspectRatioUpdated && ready) {
      // Update the store with video dimensions for rendering purposes
        updateAspectRatio();
      }
    }, [isAspectRatioUpdated, ready])

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
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
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
        oldTracks.forEach(oldTrack => {
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
          track.addEventListener('error', (_e: Event) => {
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
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const canvasContext = canvas.getContext("2d");
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

    const reactPlayerStyle = css({
      aspectRatio: '16 / 9',    // Hard-coded for now because there are problems with updating this value at runtime

      overflow: 'hidden', // Required for borderRadius to show
      ...(first) && {borderTopLeftRadius: '5px'},
      ...(first) && {borderBottomLeftRadius: '5px'},
      ...(last) && {borderTopRightRadius: '5px'},
      ...(last) && {borderBottomRightRadius: '5px'},
    })

    const render = () => {
      if (!errorState) {
        return (
          <ReactPlayer url={url}
            css={[backgroundBoxStyle(theme), reactPlayerStyle]}
            ref={ref}
            width="unset"
            height="unset"
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

export default VideoPlayers
