import React, { useState, useRef, useEffect, useImperativeHandle } from "react";

import { css } from "@emotion/react";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  selectIsPlaying,
  selectCurrentlyAtInSeconds,
  setIsPlaying,
  selectIsMuted,
  selectVolume,
  selectVideoURL,
  selectVideoCount,
  selectDurationInSeconds,
  setPreviewTriggered,
  selectPreviewTriggered,
  setAspectRatio,
  selectAspectRatio,
  setClickTriggered,
  selectClickTriggered,
  setJumpTriggered,
  selectJumpTriggered,
  setCurrentlyAt,
  selectVideos,
} from "../redux/videoSlice";

import ReactPlayer, { Config } from "react-player";

import { roundToDecimalPlace } from "../util/utilityFunctions";

import { useTranslation } from "react-i18next";

import { sleep } from "./../util/utilityFunctions";

import { RootState } from "../redux/store";
import { ActionCreatorWithPayload, AsyncThunk } from "@reduxjs/toolkit";

import { useTheme } from "../themes";

import { backgroundBoxStyle } from "../cssStyles";
import { BaseReactPlayerProps } from "react-player/base";
import { AsyncThunkConfig } from "@reduxjs/toolkit/dist/createAsyncThunk";

const VideoPlayers: React.FC<{
  refs?: React.MutableRefObject<(VideoPlayerForwardRef | null)[]>,
  widthInPercent?: number,
  maxHeightInPixel?: number;
}> = ({
  refs,
  widthInPercent = 100,
  maxHeightInPixel = 300,
}) => {

  const videos = useAppSelector(selectVideos);
  let primaryIndex = videos.findIndex(e => e.audio_stream.available === true);
  primaryIndex = primaryIndex < 0 ? 0 : primaryIndex;
  const videoCount = useAppSelector(selectVideoCount);

  const videoPlayerAreaStyle = css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: widthInPercent + "%",
    borderRadius: "5px",
    gap: "10px",

    maxHeight: maxHeightInPixel + "px",
  });

  // Initialize video players
  const videoPlayers: JSX.Element[] = [];
  for (let i = 0; i < videoCount; i++) {
    videoPlayers.push(
      <VideoPlayer
        key={i}
        dataKey={i}
        url={videos[i].uri}
        isPrimary={i === primaryIndex}
        subtitleUrl={""}
        first={i === 0}
        last={i === videoCount - 1}
        selectIsPlaying={selectIsPlaying}
        selectIsMuted={selectIsMuted}
        selectVolume={selectVolume}
        selectCurrentlyAtInSeconds={selectCurrentlyAtInSeconds}
        selectPreviewTriggered={selectPreviewTriggered}
        selectClickTriggered={selectClickTriggered}
        selectJumpTriggered={selectJumpTriggered}
        selectAspectRatio={selectAspectRatio}
        setIsPlaying={setIsPlaying}
        setPreviewTriggered={setPreviewTriggered}
        setClickTriggered={setClickTriggered}
        setJumpTriggered={setJumpTriggered}
        setCurrentlyAt={setCurrentlyAt}
        setAspectRatio={setAspectRatio}
        ref={el => {
          if (refs === undefined) { return; }
          (refs.current[i] = el);
        }}
      />
    );
  }

  return (
    <div css={videoPlayerAreaStyle}>
      {videoPlayers}
    </div>
  );
};

export interface VideoPlayerForwardRef {
  captureVideo: () => string | undefined,
  getWidth: () => number,
}

interface VideoPlayerProps {
  dataKey: number,
  url: string | undefined,
  isPrimary: boolean,
  subtitleUrl: string,
  first: boolean,
  last: boolean,
  selectIsPlaying: (state: RootState) => boolean,
  selectIsMuted: (state: RootState) => boolean,
  selectVolume: (state: RootState) => number,
  selectCurrentlyAtInSeconds: (state: RootState) => number,
  selectPreviewTriggered: (state: RootState) => boolean,
  selectClickTriggered: (state: RootState) => boolean,
  selectJumpTriggered: (state: RootState) => boolean,
  selectAspectRatio: (state: RootState) => number,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
  setPreviewTriggered: ActionCreatorWithPayload<boolean, string>,
  setClickTriggered: ActionCreatorWithPayload<boolean, string>,
  setJumpTriggered: ActionCreatorWithPayload<boolean, string>,
  setCurrentlyAt: ActionCreatorWithPayload<number, string> | AsyncThunk<void, number, AsyncThunkConfig>,
  setAspectRatio: ActionCreatorWithPayload<{ dataKey: number; } & { width: number, height: number; }, string>,
}

/**
 * A single video player
 * @param {string} url - URL to load video from
 * @param {boolean} isPrimary - If the player is the main control
 */
export const VideoPlayer = React.forwardRef<VideoPlayerForwardRef, VideoPlayerProps>(
  (props, forwardRefThing) => {
    const {
      dataKey,
      url,
      isPrimary,
      selectIsPlaying,
      selectIsMuted,
      selectVolume,
      subtitleUrl,
      first,
      last,
      selectCurrentlyAtInSeconds,
      selectPreviewTriggered,
      selectClickTriggered,
      selectJumpTriggered,
      selectAspectRatio,
      setIsPlaying,
      setPreviewTriggered,
      setClickTriggered,
      setCurrentlyAt,
      setAspectRatio,
    } = props;

    const { t } = useTranslation();

    // Init redux variables
    const dispatch = useAppDispatch();
    const isPlaying = useAppSelector(selectIsPlaying);
    const isMuted = useAppSelector(selectIsMuted);
    const volume = useAppSelector(selectVolume);
    const currentlyAt = useAppSelector(selectCurrentlyAtInSeconds);
    const duration = useAppSelector(selectDurationInSeconds);
    const previewTriggered = useAppSelector(selectPreviewTriggered);
    const clickTriggered = useAppSelector(selectClickTriggered);
    const jumpTriggered = useAppSelector(selectJumpTriggered);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const aspectRatio = useAppSelector(selectAspectRatio);
    const theme = useTheme();

    // Init state variables
    const ref = useRef<ReactPlayer>(null);
    const [ready, setReady] = useState(false);
    const [errorState, setError] = useState(false);
    const [isAspectRatioUpdated, setIsAspectRatioUpdated] = useState(false);

    // Callback for when the video is playing
    const onProgressCallback = (state: {
      played: number, playedSeconds: number, loaded: number, loadedSeconds: number;
    }) => {
      if (isPrimary) {
        // Only update redux if there was a substantial change
        if (roundToDecimalPlace(currentlyAt, 3) !== roundToDecimalPlace(state.playedSeconds, 3) &&
          state.playedSeconds !== 0 &&
          // Avoid overwriting video restarts
          state.playedSeconds < duration) {
          dispatch(setCurrentlyAt(state.playedSeconds * 1000));
        }
      }
    };

    // Tries to get video dimensions from the HTML5 elements until they are not 0,
    // then updates the store
    async function updateAspectRatio() {
      if (ref.current && ref.current.getInternalPlayer()) {
        let w = (ref.current.getInternalPlayer() as HTMLVideoElement).videoWidth;
        let h = (ref.current.getInternalPlayer() as HTMLVideoElement).videoHeight;
        while (w === 0 || h === 0) {
          await sleep(100);
          w = (ref.current.getInternalPlayer() as HTMLVideoElement).videoWidth;
          h = (ref.current.getInternalPlayer() as HTMLVideoElement).videoHeight;
        }
        dispatch(setAspectRatio({ dataKey, width: w, height: h }));
        setIsAspectRatioUpdated(true);
      }
    }

    // Callback for checking whether the video element is ready
    const onReadyCallback = () => {
      setReady(true);
    };

    const onPlay = () => {
      // Restart the video from the beginning when at the end
      if (isPrimary && currentlyAt >= duration) {
        dispatch(setCurrentlyAt(0));
        // Flip-flop the "isPlaying" switch, or else the video won"t start playing
        dispatch(setIsPlaying(false));
        dispatch(setIsPlaying(true));
      }
    };

    const onEndedCallback = () => {
      if (isPrimary && currentlyAt !== 0) {
        dispatch(setIsPlaying(false));
        // It seems onEnded is called before the full duration is reached, so we set currentlyAt to the very end
        dispatch(setCurrentlyAt(duration * 1000));
      }
    };

    const onErrorCallback: BaseReactPlayerProps["onError"] = _e => {
      setError(true);
    };

    useEffect(() => {
      // Seek if the position in the video got changed externally
      if (!isPlaying && ref.current && ready) {
        ref.current.seekTo(currentlyAt, "seconds");
      }
      if (previewTriggered && ref.current && ready) {
        ref.current.seekTo(currentlyAt, "seconds");
        dispatch(setPreviewTriggered(false));
      }
      if (clickTriggered && ref.current && ready) {
        ref.current.seekTo(currentlyAt, "seconds");
        dispatch(setClickTriggered(false));
      }
      if (jumpTriggered && ref.current && ready) {
        ref.current.seekTo(currentlyAt, "seconds");
        dispatch(setJumpTriggered(false));
      }
    });

    useEffect(() => {
      if (!isAspectRatioUpdated && ready) {
        // Update the store with video dimensions for rendering purposes
        updateAspectRatio();
      }
    }, [isAspectRatioUpdated, ready]);

    // Callback specifically for the subtitle editor view
    // When changing urls while the player is playing, don"t reset to 0
    // (due to onProgressCallback resetting to 0),
    // but keep the current currentlyAt
    useEffect(() => {
      if (ref.current && ready) {
        ref.current.seekTo(currentlyAt, "seconds");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    // Trigger a workaround for subtitles not being displayed in the video in Firefox
    useEffect(() => {
      // Only trigger workaround in Firefox, as it will cause issues in Chrome
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      if (typeof InstallTrigger !== "undefined") {
        reAddTrack();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subtitleUrl]);

    const playerConfig: Config = {
      file: {
        attributes: {
          // Skip player when navigating page with keyboard
          tabIndex: "-1",
          crossOrigin: "anonymous",    // allow thumbnail generation
        },
        tracks: [
          { kind: "subtitles", src: subtitleUrl, srcLang: "en", default: true, label: "I am irrelevant" },
        ],
      },
    };

    /**
     * Workaround for subtitles not appearing in Firefox (or only appearing on inital mount, then disappearing
     * when changed). Removes old tracks and readds them, because letting React to it does not seem
     * to work properly.
     * Fairly hacky, currently only works for a page with only one video
     * https://github.com/CookPete/react-player/issues/490
     */
    function reAddTrack() {
      const video = document.querySelector("video");

      if (video) {
        const oldTracks = video.querySelectorAll("track");
        oldTracks.forEach(oldTrack => {
          video.removeChild(oldTrack);
        });
      }

      if (playerConfig && playerConfig.file && playerConfig.file.tracks) {
        // eslint-disable-next-line array-callback-return
        playerConfig.file.tracks.map((t, trackIdx) => {
          const track = document.createElement("track");
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          track.kind = t.kind!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          track.label = t.label!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          track.srclang = t.srcLang!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          track.default = t.default!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          track.src = t.src!;
          track.track.mode = "showing";    // Because the load callback may sometimes not execute properly
          track.addEventListener("error", (_e: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            console.warn(`Cannot load track ${t.src!}`);
          });
          track.addEventListener("load", (e: Event) => {
            const textTrack = e.currentTarget as HTMLTrackElement;
            if (textTrack) {
              if (t.default === true) {
                textTrack.track.mode = "showing";
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                video!.textTracks[trackIdx].mode = "showing"; // thanks Firefox
              } else {
                textTrack.track.mode = "hidden";
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                video!.textTracks[trackIdx].mode = "hidden"; // thanks Firefox
              }
            }
          });
          const video = document.querySelector("video");
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
        const video = ref.current?.getInternalPlayer() as HTMLVideoElement;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const canvasContext = canvas.getContext("2d");
        if (canvasContext !== null) {
          canvasContext.drawImage(video, 0, 0);
          return canvas.toDataURL("image/png");
        }
      },
      getWidth() {
        return (ref.current?.getInternalPlayer() as HTMLVideoElement).clientWidth;
      },
    }));

    const errorBoxStyle = css({
      ...(!errorState) && { display: "none" },
      borderColor: `${theme.error}`,
      borderStyle: "dashed",
      fontWeight: "bold",
      padding: "10px",
    });

    const reactPlayerStyle = css({
      aspectRatio: "16 / 9",    // Hard-coded for now because there are problems with updating this value at runtime

      overflow: "hidden", // Required for borderRadius to show
      ...first && {
        borderTopLeftRadius: "5px",
        borderBottomLeftRadius: "5px",
      },
      ...last && {
        borderTopLeftRadius: "5px",
        borderBottomRightRadius: "5px",
      },
    });

    const videoPlayerWrapperStyles = css({
      height: "100%",
      width: "100%",
      display: "flex",

      // For single video, center!
      ...(first && last) && { justifyContent: "center" },

      // For multi videos, first from right side, sitting on end
      ...(first && !last) && { justifyContent: "end" },

      // For multi videos, last from right side, sitting on start
      ...(last && !first) && { justifyContent: "start" },

      // For multi videos, in between, fit content and center!
      ...(!first && !last) && { justifyContent: "center", flexBasis: "fit-content" },
    });

    const render = () => {
      if (!errorState) {
        return (
          <div css={videoPlayerWrapperStyles}>
            <ReactPlayer url={url}
              css={[backgroundBoxStyle(theme), reactPlayerStyle]}
              ref={ref}
              width="unset"
              height="100%"
              playing={isPlaying}
              volume={volume}
              muted={!isPrimary || isMuted}
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
    };

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

export default VideoPlayers;
