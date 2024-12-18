import React from "react";

import { css } from "@emotion/react";

import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { LuPlay, LuPause, LuVolume2, LuVolumeX, LuSkipBack, LuSkipForward } from "react-icons/lu";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  selectDuration,
} from "../redux/videoSlice";

import { convertMsToReadableString } from "../util/utilityFunctions";
import { BREAKPOINTS, basicButtonStyle, undisplay } from "../cssStyles";

import { KEYMAP, rewriteKeys } from "../globalKeys";
import { useTranslation } from "react-i18next";

import { RootState } from "../redux/store";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { ThemedTooltip } from "./Tooltip";
import { Theme, useTheme } from "../themes";
import { useHotkeys } from "react-hotkeys-hook";
import { Slider } from "@mui/material";
import { ProtoButton } from "@opencast/appkit";

/**
 * Contains controls for manipulating multiple video players at once
 * Flexbox magic keeps the play button at the center
 */
const VideoControls: React.FC<{
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying: (state: RootState) => boolean,
  selectIsMuted: (state: RootState) => boolean,
  selectVolume: (state: RootState) => number,
  selectIsPlayPreview: (state: RootState) => boolean,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
  setIsMuted: ActionCreatorWithPayload<boolean, string>,
  setVolume: ActionCreatorWithPayload<number, string>,
  setIsPlayPreview: ActionCreatorWithPayload<boolean, string>,
  jumpToPreviousSegment?: ActionCreatorWithoutPayload<string>,
  jumpToNextSegment?: ActionCreatorWithoutPayload<string>,
}> = ({
  selectCurrentlyAt,
  selectIsPlaying,
  selectIsMuted,
  selectVolume,
  selectIsPlayPreview,
  setIsPlaying,
  setIsMuted,
  setVolume,
  setIsPlayPreview,
  jumpToPreviousSegment = undefined,
  jumpToNextSegment = undefined,
}) => {

  const theme = useTheme();

  const videoControlsRowStyle = css({
    background: `${theme.background}`,
    outline: `5px solid ${theme.background}`, // Fake the box bigger than it actually is
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    width: "100%",
    paddingTop: "10px",
    paddingBottom: "10px",
    gap: "30px",
  });

  return (
    <div css={videoControlsRowStyle}>
      <TimeDisplay
        selectCurrentlyAt={selectCurrentlyAt}
      />
      {jumpToPreviousSegment && (
        <PreviousButton
          jumpToPreviousSegment={jumpToPreviousSegment}
        />
      )}
      <PlayButton
        selectIsPlaying={selectIsPlaying}
        setIsPlaying={setIsPlaying}
      />
      {jumpToNextSegment && (
        <NextButton
          jumpToNextSegment={jumpToNextSegment}
        />
      )}
      <VolumeSlider
        selectIsMuted={selectIsMuted}
        setIsMuted={setIsMuted}
        selectVolume={selectVolume}
        setVolume={setVolume}
      />
      <PreviewMode
        selectIsPlayPreview={selectIsPlayPreview}
        setIsPlayPreview={setIsPlayPreview}
      />
    </div>
  );
};

/**
 * Enable/Disable Preview Mode
 */
const PreviewMode: React.FC<{
  selectIsPlayPreview: (state: RootState) => boolean,
  setIsPlayPreview: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectIsPlayPreview,
  setIsPlayPreview,
}) => {

  const { t } = useTranslation();
  const ref = React.useRef<HTMLDivElement>(null);

  // Init redux variables
  const dispatch = useAppDispatch();
  const isPlayPreview = useAppSelector(selectIsPlayPreview);
  const theme = useTheme();

  // Change preview mode from "on" to "off" and vice versa
  const switchPlayPreview = (ref: React.RefObject<HTMLDivElement> | undefined) => {
    dispatch(setIsPlayPreview(!isPlayPreview));

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur();
    }
  };

  // Maps functions to hotkeys
  useHotkeys(
    KEYMAP.videoPlayer.preview.key,
    () => switchPlayPreview(undefined),
    { preventDefault: true },
    [isPlayPreview]
  );

  const previewModeStyle = css({
    cursor: "pointer",
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
  });

  const switchIconStyle = css({
    color: `${theme.background_preview_icon}`,
    fontSize: "28px",
  });

  const previewModeTextStyle = (theme: Theme) => css({
    display: "inline-block",
    flexWrap: "nowrap",
    color: `${theme.text}`,
  });

  return (
    <ThemedTooltip
      title={t("video.previewButton-tooltip", {
        status: (isPlayPreview ? "on" : "off"),
        hotkeyName: rewriteKeys(KEYMAP.videoPlayer.preview.key),
      })}
    >
      <div css={previewModeStyle}
        ref={ref}
        role="switch" aria-checked={isPlayPreview} tabIndex={0} aria-hidden={false}
        aria-label={t("video.previewButton-aria", { hotkeyName: rewriteKeys(KEYMAP.videoPlayer.preview.key) })}
        onClick={() => switchPlayPreview(ref)}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " ") {
            switchPlayPreview(undefined);
          }
        }}
      >
        <div css={[previewModeTextStyle(theme), undisplay(BREAKPOINTS.medium)]}>
          {t("video.previewButton")}
        </div>
        {isPlayPreview ? <FaToggleOn css={[basicButtonStyle(theme), switchIconStyle]} />
          : <FaToggleOff css={[basicButtonStyle(theme), switchIconStyle]} />}
      </div>
    </ThemedTooltip>
  );
};

/**
 * Start/Pause playing the videos
 */
const PlayButton: React.FC<{
  selectIsPlaying: (state: RootState) => boolean,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectIsPlaying,
  setIsPlaying,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(selectIsPlaying);
  const theme = useTheme();

  // Change play mode from "on" to "off" and vice versa
  const switchIsPlaying = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  // Maps functions to hotkeys
  useHotkeys(KEYMAP.videoPlayer.play.key, () => switchIsPlaying(), { preventDefault: true }, [isPlaying]);

  const playButtonStyle = css({
    justifySelf: "center",
    outline: "none",
    color: `${theme.icon_color}`,

    background: `${theme.background_play_icon}`,
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    boxShadow: `${theme.boxShadow_tiles}`,
  });

  const playIconStyle = css({
    fontSize: 24,
    paddingLeft: "3px",
  });

  return (
    <ThemedTooltip title={isPlaying ? t("video.pauseButton-tooltip") : t("video.playButton-tooltip")}>
      <ProtoButton
        aria-label={t("video.playButton-tooltip")}
        aria-pressed={isPlaying}
        aria-hidden={false}
        onClick={() => { switchIsPlaying(); }}
        css={[basicButtonStyle(theme), playButtonStyle]}
      >
        {isPlaying ? <LuPause css={playIconStyle} /> : <LuPlay css={playIconStyle} />}
      </ProtoButton>
    </ThemedTooltip>
  );
};

/**
 * Jump to previous segment
 */
const PreviousButton: React.FC<{
  jumpToPreviousSegment: ActionCreatorWithoutPayload<string>,
}> = ({
  jumpToPreviousSegment,
}) => {

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const jumpToPrevious = () => {
    dispatch(jumpToPreviousSegment());
  };

  useHotkeys(KEYMAP.videoPlayer.previous.key, () => jumpToPrevious(), { preventDefault: true });

  const previousIconStyle = css({
    fontSize: 24,
  });

  return (
    <ThemedTooltip title={t("video.previousButton-tooltip", {
      hotkeyName: rewriteKeys(KEYMAP.videoPlayer.previous.key),
    })}>
      <div css={[basicButtonStyle(theme)]}
        role="button" tabIndex={0} aria-hidden={false}
        aria-label={t("video.previousButton-tooltip", { hotkeyName: rewriteKeys(KEYMAP.videoPlayer.previous.key) })}
        onClick={jumpToPrevious}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Enter") {
            jumpToPrevious();
          }
        }}>
        <LuSkipBack css={previousIconStyle} />
      </div>
    </ThemedTooltip>
  );
};

/**
 * Jump to next segment
 */
const NextButton: React.FC<{
  jumpToNextSegment: ActionCreatorWithoutPayload<string>,
}> = ({
  jumpToNextSegment,
}) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const jumpToNext = () => {
    dispatch(jumpToNextSegment());
  };

  useHotkeys(KEYMAP.videoPlayer.next.key, () => jumpToNext(), { preventDefault: true });

  const nextIconStyle = css({
    fontSize: 24,
  });

  return (
    <ThemedTooltip title={t("video.nextButton-tooltip", { hotkeyName: rewriteKeys(KEYMAP.videoPlayer.next.key) })}>
      <ProtoButton
        aria-label={t("video.nextButton-tooltip", { hotkeyName: rewriteKeys(KEYMAP.videoPlayer.next.key) })}
        aria-hidden={false}
        onClick={jumpToNext}
        css={[basicButtonStyle(theme)]}
      >
        <LuSkipForward css={nextIconStyle} />
      </ProtoButton>
    </ThemedTooltip>
  );
};

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
  const currentlyAt = useAppSelector(selectCurrentlyAt);
  const duration = useAppSelector(selectDuration);
  const theme = useTheme();

  const timeTextStyle = (theme: Theme) => css({
    display: "inline-block",
    color: `${theme.text}`,
  });

  return (
    <div css={{ display: "flex", flexDirection: "row", gap: "5px" }}>
      <ThemedTooltip title={t("video.current-time-tooltip")}>
        <time css={timeTextStyle(theme)}
          tabIndex={0} role="timer" aria-label={t("video.time-aria") + ": " + convertMsToReadableString(currentlyAt)}>
          {new Date((currentlyAt ? currentlyAt : 0)).toISOString().substr(11, 10)}
        </time>
      </ThemedTooltip>
      <div css={undisplay(BREAKPOINTS.medium)}>{" / "}</div>
      <ThemedTooltip title={t("video.time-duration-tooltip")}>
        <div css={[timeTextStyle(theme), undisplay(BREAKPOINTS.medium)]}
          tabIndex={0} aria-label={t("video.duration-aria") + ": " + convertMsToReadableString(duration)}>
          {new Date((duration ? duration : 0)).toISOString().substr(11, 10)}
        </div>
      </ThemedTooltip>
    </div>
  );
};

const VolumeSlider: React.FC<{
  selectIsMuted: (state: RootState) => boolean,
  setIsMuted: ActionCreatorWithPayload<boolean, string>,
  selectVolume: (state: RootState) => number,
  setVolume: ActionCreatorWithPayload<number, string>,
}> = ({
  selectIsMuted,
  setIsMuted,
  selectVolume,
  setVolume,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();
  const isMuted = useAppSelector(selectIsMuted);
  const volume = useAppSelector(selectVolume);
  const theme = useTheme();

  // Toggle video mute
  const switchIsMuted = () => {
    // Increase volume when unmuting and no volume was set before
    if (volume === 0 && isMuted) {
      dispatch(setVolume(1));
    }

    dispatch(setIsMuted(!isMuted));
  };

  const volumeOnChange = (_event: Event, newValue: number | number[]) => {
    // Disable mute when silder is moved
    if (isMuted) {
      dispatch(setIsMuted(false));
    }

    // Get first value if array given
    if (Array.isArray(newValue)) {
      newValue = newValue[0];
    }

    // Enable mute if no volume is set
    if (newValue === 0) {
      dispatch(setIsMuted(true));
    }

    dispatch(setVolume(Number(newValue)));
  };

  const volumeStyle = css({
    display: "flex",
    flexDirection: "row",
    gap: "15px",
    justifyContent: "center",
    alignItems: "center",
  });

  const sliderStyle = css({
    width: "80px",
    "& .MuiSlider-thumb": {
      color: `${theme.slider_thumb_color}`,
      "&:hover, &.Mui-focusVisible, &.Mui-active": {
        boxShadow: `${theme.slider_thumb_shadow}`,
      },
    },
    "& .MuiSlider-rail": {
      color: `${theme.slider_track_color}`,
    },
    "& .MuiSlider-track": {
      color: `${theme.slider_track_color}`,
    },
  });

  const volumeIconStyle = css({
    fontSize: 24,
    paddingLeft: "3px",
  });

  return (
    <div css={volumeStyle}>
      <ThemedTooltip title={isMuted ? t("video.unmutebutton-tooltip") : t("video.mutebutton-tooltip")}>
        <ProtoButton
          aria-label={t("video.mutebutton-tooltip")}
          aria-pressed={isMuted}
          aria-hidden={false}
          onClick={switchIsMuted}
          css={[basicButtonStyle(theme)]}
        >
          {isMuted ? <LuVolumeX css={volumeIconStyle} /> : <LuVolume2 css={volumeIconStyle} />}
        </ProtoButton>
      </ThemedTooltip>
      <ThemedTooltip title={t("video.volume-tooltip", { current: Math.trunc(volume * 100) })}>
        <Slider
          css={sliderStyle}
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={volumeOnChange}
          aria-label={t("video.volume-tooltip", { current: Math.trunc(volume * 100) })}
          valueLabelDisplay="off"
        />
      </ThemedTooltip>
    </div>
  );
};

export default VideoControls;
