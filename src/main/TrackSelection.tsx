import React from "react";
import { css } from "@emotion/react";

import { IconType } from "react-icons";
import { LuTrash } from "react-icons/lu";
import { ReactComponent as TrashRestore } from "../img/trash-restore.svg";
import ReactPlayer from "react-player";

import { Track } from "../types";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectVideos, setTrackEnabled } from "../redux/videoSlice";
import {
  backgroundBoxStyle,
  basicButtonStyle,
  customIconStyle,
  deactivatedButtonStyle,
  flexGapReplacementStyle,
  titleStyle,
  titleStyleBold,
} from "../cssStyles";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";

/**
 * Creates the track selection.
 */
const TrackSelection: React.FC = () => {

  // Generate list of tracks
  const tracks: Track[] = useAppSelector(selectVideos);
  const enabledCount = tracks.filter(t => t.video_stream.enabled).length;
  const trackItems: JSX.Element[] = tracks.map((track: Track) =>
    <TrackItem key={track.id} track={track} enabledCount={enabledCount} />
  );

  const trackSelectionStyle = css({
    display: "flex",
    width: "auto",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
  });

  const trackAreaStyle = css({
    display: "flex",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...(flexGapReplacementStyle(10, false)),
  });

  return (
    <div css={trackSelectionStyle}>
      <Header />
      <div css={trackAreaStyle}>
        {trackItems}
      </div>
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


const TrackItem: React.FC<{ track: Track, enabledCount: number; }> = ({ track, enabledCount }) => {

  const theme = useTheme();

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const header = track.flavor.type + " "
    + (track.video_stream.enabled ? ""
      : `(${t("trackSelection.trackInactive", "inactive")})`);

  const trackItemStyle = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  });

  const trackitemSubStyle = css({
    display: "flex",
    flexDirection: "row",
    ...(flexGapReplacementStyle(20, true)),

    justifyContent: "space-around",
    flexWrap: "wrap",
  });

  const playerStyle = css({
    aspectRatio: "16 / 9",
    width: "100%",
    maxWidth: "457px",
  });

  const headerStyle = css({
    fontWeight: "bold",
    fontSize: "larger",
    color: `${theme.text}`,
    "&:first-letter": {
      textTransform: "capitalize",
    },
  });

  const buttonsStyle = css({
    // TODO: Avoid hard-coding max-width
    "@media (max-width: 1550px)": {
      width: "100%",
    },
    display: "flex",
    flexDirection: "column",
  });

  // What state is the track in and can it be deactivated?
  // We do not permit deactivating the last remaining track
  // 2 -> Track is enabled and can be deactivated
  // 1 -> Track is enabled but is the last and cannot be deactivated
  // 0 -> Track is disabled and can be restored
  const deleteStatus = track.video_stream.enabled ? (enabledCount > 1 ? 0 : 1) : 2;
  const deleteEnabled = deleteStatus !== 1;
  const deleteText = [
    t("trackSelection.deleteTrackText", "Delete Track"),
    t("trackSelection.cannotDeleteTrackText", "Cannot Delete Track"),
    t("trackSelection.restoreTrackText", "Restore Track"),
  ][deleteStatus];
  const deleteTooltip = [
    t("trackSelection.deleteTrackTooltip", "Do not encode and publish this track."),
    t("trackSelection.cannotDeleteTrackTooltip", "Cannot remove this track from publication."),
    t("trackSelection.restoreTrackTooltip", "Encode and publish this track."),
  ][deleteStatus];
  const deleteIcon = [LuTrash, LuTrash, TrashRestore][deleteStatus];
  const trackEnabledChange = () => {
    dispatch(setTrackEnabled({
      id: track.id,
      enabled: !track.video_stream.enabled,
    }));
  };

  return (
    <div css={[backgroundBoxStyle(theme), trackItemStyle]}>
      <div css={headerStyle}>{header}</div>
      <div css={trackitemSubStyle}>
        <ReactPlayer
          width="unset"
          height="unset"
          css={playerStyle}
          style={{ opacity: track.video_stream.enabled ? "1" : "0.5" }}
          url={track.uri}
        />
        <div css={buttonsStyle}>
          <SelectButton
            text={deleteText}
            tooltip={deleteTooltip}
            handler={trackEnabledChange}
            Icon={deleteIcon}
            active={deleteEnabled}
          />
        </div>
      </div>
    </div>
  );
};

interface selectButtonInterface {
  handler: () => void,
  text: string,
  Icon: IconType | React.FunctionComponent,
  tooltip: string,
  active: boolean,
}

const SelectButton: React.FC<selectButtonInterface> = ({ handler, text, Icon, tooltip, active }) => {

  const theme = useTheme();

  const buttonStyle = [
    active ? basicButtonStyle(theme) : deactivatedButtonStyle,
    {
      padding: "16px",
      maxHeight: "21px",
      boxShadow: "",
      background: `${theme.element_bg}`,
      textWrap: "nowrap",
    }];

  const clickHandler = () => {
    if (active) { handler(); }
    ref.current?.blur();
  };

  const keyHandler = (event: React.KeyboardEvent) => {
    if (active && (event.key === " " || event.key === "Enter")) {
      handler();
    }
  };

  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <ThemedTooltip title={tooltip}>
      <div
        css={buttonStyle}
        tabIndex={0}
        ref={ref}
        role="button"
        aria-label={tooltip}
        onClick={clickHandler}
        onKeyDown={keyHandler} >
        <Icon css={customIconStyle} />
        {text}
      </div>
    </ThemedTooltip>
  );
};

export default TrackSelection;
