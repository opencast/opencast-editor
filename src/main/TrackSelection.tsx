import React from "react";
import { css } from "@emotion/react";
import { Alert, Checkbox, FormControlLabel } from "@mui/material";
import ReactPlayer from "react-player";

import { Track } from "../types";
import {
  selectCustomizedTrackSelection,
  selectVideos,
  selectWaveformImages,
  setAudioEnabled,
  setCustomizedTrackSelection,
  setVideoEnabled,
} from "../redux/videoSlice";
import {
  BREAKPOINT_MEDIUM,
  backgroundBoxStyle,
  checkboxStyle,
  flexGapReplacementStyle,
  titleStyle,
  titleStyleBold,
} from "../cssStyles";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { outOfBounds } from "../util/utilityFunctions";
import { useAppDispatch, useAppSelector } from "../redux/store";

/**
 * Creates the track selection.
 */
const TrackSelection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Generate list of tracks
  const tracks: Track[] = useAppSelector(selectVideos);
  const enabledCount = tracks.reduce(
    (memo: number, track: Track) => memo + !!track.video_stream.enabled + !!track.audio_stream.enabled,
    0
  );
  const images = useAppSelector(selectWaveformImages);
  const customizedTrackSelection: boolean = useAppSelector(selectCustomizedTrackSelection);

  const videoTrackItems: JSX.Element[] = tracks.map(
    (track: Track) => (
      <VideoTrackItem
        key={track.id}
        track={track}
        enabledCount={enabledCount}
        customizable={customizedTrackSelection}
      />)
  );

  const audioTrackItems: JSX.Element[] = tracks.map(
    (track: Track, index: number) => (
      <AudioTrackItem
        key={track.id}
        track={track}
        waveform={outOfBounds(images, index) ? undefined : images[index]}
        enabledCount={enabledCount}
        customizable={customizedTrackSelection}
      />
    )
  );

  const onChange = () => {
    if (customizedTrackSelection) {
      tracks.forEach(track => {
        if (track.video_stream.available) {
          dispatch(setVideoEnabled({
            trackId: track.id,
            enabled: true,
          }));
        }
        if (track.audio_stream.available) {
          dispatch(setAudioEnabled({
            trackId: track.id,
            enabled: true,
          }));
        }
      });
    }

    dispatch(setCustomizedTrackSelection(!customizedTrackSelection));
  };

  const styles = {
    trackSelection: css({
      display: "flex",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      gap: "2rem",
      alignSelf: "center",
    }),

    trackArea: css({
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      ...(flexGapReplacementStyle(10, false)),
    }),

    leftAlignedSection: css({
      alignSelf: "start",
    }),

    selectionSection: css({
      transition: "all 0.05s",
      ...(
        customizedTrackSelection
          ? {}
          : {
            opacity: "0.7",
            pointerEvents: "none",
            filter: "grayscale(80%) blur(1.5px) brightness(80%)",
          }
      ),
    }),

    trackSection: css({
      "& h3": {
        marginBlock: "0",
      },
    }),
  };

  return (
    <div css={styles.trackSelection}>
      <Header />
      <section css={styles.leftAlignedSection}>
        <TrackSelectionEnabler
          customizable={customizedTrackSelection}
          onChange={onChange}
        />
      </section>
      <section css={[styles.selectionSection, styles.leftAlignedSection]}>
        <SelectionAlert tracks={tracks} customizable={customizedTrackSelection} />
      </section>
      <section css={[styles.selectionSection, styles.trackSection]}>
        <header><h3>{t("trackSelection.videoTracksHeader")}</h3></header>
        <div css={styles.trackArea}>{ videoTrackItems }</div>
      </section>
      <section css={[styles.selectionSection, styles.trackSection]}>
        <header><h3>{t("trackSelection.audioTracksHeader")}</h3></header>
        <div css={styles.trackArea}>{ audioTrackItems }</div>
      </section>
    </div>
  );
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const description: string = t("trackSelection.title");

  return (
    <div css={[titleStyle(theme), titleStyleBold(theme)]}>
      {description}
    </div>
  );
};

const TrackSelectionEnabler: React.FC<{
  customizable: boolean,
  onChange: () => void,
}> = ({
  customizable,
  onChange,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const label = t("trackSelection.customizeLabel");

  return (
    <FormControlLabel control={
      <Checkbox
        css={checkboxStyle(theme)}
        checked={customizable}
        onChange={onChange}
      />
    } label={label} />
  );
};

const VideoTrackItem: React.FC<{
  track: Track,
  enabledCount: number,
  customizable: boolean,
}> = ({
  track,
  enabledCount,
  customizable,
}) => {
  const dispatch = useAppDispatch();
  const imagesMaxWidth = 300;
  const imagesMaxWidthMedium = 150;
  const disabled = !customizable || (track.video_stream.enabled && enabledCount === 1);

  const playerStyle = css({
    aspectRatio: "16 / 9",
    width: "100%",
    opacity: track.video_stream.enabled ? "1" : "0.5",
    maxWidth: `${imagesMaxWidthMedium}px`,
    [`@media (min-width: ${BREAKPOINT_MEDIUM}px)`]: {
      "&": { maxWidth: `${imagesMaxWidth}px` },
    },
  });

  const playerRootStyle = {
    filter: track.video_stream.enabled ? "none" : "grayscale(80%) blur(1.5px) brightness(80%)",
    opacity: track.video_stream.enabled ? "1" : "0.5",
  };

  const videoEnabledChange = () => {
    dispatch(setVideoEnabled({
      trackId: track.id,
      enabled: !track.video_stream.enabled,
    }));
  };

  return (
    <TrackItem
      header={track.flavor.type}
      checked={track.video_stream.enabled}
      disabled={disabled}
      onChange={videoEnabledChange}
    >
      <ReactPlayer
        width="unset"
        height="unset"
        css={playerStyle}
        style={playerRootStyle}
        url={track.uri}
        config={{ attributes: { tabIndex: "-1" } }}
      />
    </TrackItem>
  );
};

const AudioTrackItem: React.FC<{
  track: Track,
  waveform: string | undefined
  enabledCount: number,
  customizable: boolean,
}> = ({
  track,
  waveform,
  enabledCount,
  customizable,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const imagesMaxWidth = 300;
  const imagesMaxWidthMedium = 150;
  const disabled = !customizable || (track.audio_stream.enabled && enabledCount === 1);

  const imgStyle = css({
    height: "54px",   // Keep height consistent in case the image does not render
    width: "100%",
    filter: `${theme.invert_wave}`,
    color: `${theme.inverted_text}`,
    maxWidth: `${imagesMaxWidthMedium}px`,
    [`@media (min-width: ${BREAKPOINT_MEDIUM}px)`]: {
      "&": { maxWidth: `${imagesMaxWidth}px` },
    },
  });

  const audioEnabledChange = () => {
    dispatch(setAudioEnabled({
      trackId: track.id,
      enabled: !track.audio_stream.enabled,
    }));
  };

  return (
    <TrackItem
      header={track.flavor.type}
      checked={track.audio_stream.enabled}
      disabled={!track.audio_stream.available || disabled}
      onChange={audioEnabledChange}
    >
      {track.audio_stream.available ?
        <img
          src={waveform ?? "/placeholder-waveform.png"}
          css={imgStyle}
          style={{ opacity: track.audio_stream.enabled ? "1" : "0.5" }}
          alt="placeholder for audio stream"
        />
        :
        <img
          src="/placeholder-waveform-empty.png"
          css={imgStyle}
          style={{ opacity: "0.5" }}
          alt="placeholder for unavailable audio stream"
        />
      }
    </TrackItem>
  );
};

const TrackItem: React.FC<{
  header: string,
  checked: boolean,
  disabled: boolean,
  onChange: () => void,
  children: React.ReactNode,
}> = ({
  header,
  checked,
  disabled,
  onChange,
  children,
}) => {
  const theme = useTheme();

  const styles = {
    trackItem: css({
      display: "flex",
      flexDirection: "column",
      alignItems: "left",
      cursor: disabled ? "not-allowed" : "pointer",
    }),

    trackitemSub: css({
      display: "flex",
      flexDirection: "row",
      ...(flexGapReplacementStyle(20, true)),
      justifyContent: "space-around",
      flexWrap: "wrap",
    }),

    images: css({
      display: "flex",
      flexDirection: "column",
      ...(flexGapReplacementStyle(20, true)),
    }),

    header: css({
      fontWeight: "bold",
      textTransform: "capitalize",
      display: "flex",
      alignItems: "center",
      gap: "0.5em",
    }),
  };

  return (
    <label css={[backgroundBoxStyle(theme), styles.trackItem]}>
      <div css={styles.header}>
        <Checkbox
          css={checkboxStyle(theme)}
          checked={checked}
          onChange={onChange}
          disabled={disabled} />
        {header}
      </div>
      <div css={styles.trackitemSub}>
        <div css={styles.images}>
          {children}
        </div>
      </div>
    </label>
  );
};

interface selectionAlertInterface {
  tracks: Track[],
  customizable: boolean,
}

const SelectionAlert: React.FC<selectionAlertInterface> = ({
  tracks,
  customizable,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const video = tracks.filter(t => t.video_stream.enabled).length;
  const audio = tracks.filter(t => t.audio_stream.enabled).length;

  const lines = customizable ? [
    t("trackSelection.selectionAlertInfoVideo", { count: video }),
    t("trackSelection.selectionAlertInfoAudio", { count: audio }),
  ] : [];

  return (
    <Alert variant="outlined" severity="info" css={css({ color: theme.inverted_text })}>
      <div css={css({ marginBlockEnd: customizable ? "1em" : "0" })}>
        {t("trackSelection.help")}
      </div>

      {lines.map((line, index) => (<div key={index}>{line}</div>))}
    </Alert>
  );
};

export default TrackSelection;
