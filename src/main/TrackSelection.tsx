import React from "react";
import { css } from '@emotion/react'

import { IconType } from "react-icons";
import { FaTrash, FaTrashRestore } from "react-icons/fa";
import ReactPlayer from 'react-player'

import { Track } from '../types'
import { useSelector, useDispatch } from 'react-redux';
import { selectVideos, setTrackEnabled } from '../redux/videoSlice'
import { basicButtonStyle, deactivatedButtonStyle, flexGapReplacementStyle, titleStyle, titleStyleBold } from '../cssStyles'

import { useTranslation } from 'react-i18next';
import { selectTheme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";

/**
 * Creates the track selection.
 */
const TrackSelection: React.FC = () => {

  // Generate list of tracks
  const tracks: Track[] = useSelector(selectVideos);
  const enabledCount = tracks.filter(t => t.video_stream.enabled).length;
  const trackItems: JSX.Element[] = tracks.map((track: Track) =>
    <TrackItem key={track.id} track={track} enabledCount={enabledCount} />
  );

  const trackSelectionStyle = css({
    display: 'flex',
    width: 'auto',
    height: '100%',
    flexDirection: 'column',
    // justifyContent: 'center',
    alignItems: 'center',
  })

  const trackAreaStyle = css({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...(flexGapReplacementStyle(40, false)),
  })

  return (
    <div css={trackSelectionStyle}>
      <Header />
      <div css={trackAreaStyle}>
        { trackItems }
      </div>
    </div>
  );
}


const Header: React.FC = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  const description: string = t('trackSelection.title');

  return (
    <div css={[titleStyle(theme), titleStyleBold(theme)]}>
      { description }
    </div>
  );
}


const TrackItem: React.FC<{track: Track, enabledCount: number}> = ({track, enabledCount}) => {

  const theme = useSelector(selectTheme);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const header = track.flavor.type + ' '
    + (track.video_stream.enabled ? ''
      : `(${t('trackSelection.trackInactive', 'inactive')})`);

  const trackItemStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',

    background: `${theme.menu_background}`,
    borderRadius: '7px',
    boxShadow: `${theme.boxShadow_tiles}`,
    boxSizing: "border-box",
    padding: '20px',
    ...(flexGapReplacementStyle(25, false)),
  });

  const playerStyle = css({
    display: 'inline-block',
  });

  const headerStyle = css({
    display: 'inline-block',
    width: '100%',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    fontSize: 'larger',
  });

  // What state is the track in and can it be deactivated?
  // We do not permit deactivating the last remaining track
  // 2 -> Track is enabled and can be deactivated
  // 1 -> Track is enabled but is the last and cannot be deactivated
  // 0 -> Track is disabled and can be restored
  const deleteStatus = track.video_stream.enabled ? (enabledCount > 1 ? 0 : 1) : 2;
  const deleteEnabled = deleteStatus !== 1;
  const deleteText = [
    t('trackSelection.deleteTrackText', 'Delete Track'),
    t('trackSelection.cannotDeleteTrackText', 'Cannot Delete Track'),
    t('trackSelection.restoreTrackText', 'Restore Track')
  ][deleteStatus];
  const deleteTooltip = [
    t('trackSelection.deleteTrackTooltip', 'Do not encode and publish this track.'),
    t('trackSelection.cannotDeleteTrackTooltip', 'Cannot remove this track from publication.'),
    t('trackSelection.restoreTrackTooltip', 'Encode and publish this track.')
  ][deleteStatus];
  const deleteIcon = [FaTrash, FaTrash, FaTrashRestore][deleteStatus];
  const trackEnabledChange = () => {
    dispatch(setTrackEnabled({
      id: track.id,
      enabled: !track.video_stream.enabled,
    }))
  }

  return (
    <div css={trackItemStyle}>
      <div css={headerStyle}>{ header }</div>
      <div css={{ opacity: track.video_stream.enabled ? '1' : '0.5' }}>
        <ReactPlayer css={playerStyle} url={track.uri} />
      </div>
      <SelectButton
        text={deleteText}
        tooltip={deleteTooltip}
        handler={trackEnabledChange}
        Icon={deleteIcon}
        active={deleteEnabled} />
    </div>
  );
}

interface selectButtonInterface {
  handler: any,
  text: string,
  Icon: IconType,
  tooltip: string,
  active: boolean,
}

const SelectButton : React.FC<selectButtonInterface> = ({handler, text, Icon, tooltip, active}) => {

  const theme = useSelector(selectTheme);

  const buttonStyle = [
    active ? basicButtonStyle(theme) : deactivatedButtonStyle,
    {
      padding: '10px 5px',
      width: '25%',
      boxShadow: '',
      border: `1px solid ${theme.text}`,
      background: `${theme.element_bg}`,
    }];
  const clickHandler = () => {
    if (active) { handler() }
    ref.current?.blur();
  };
  const keyHandler = (event: React.KeyboardEvent) => {
    if (active && (event.key === " " || event.key === "Enter")) {
      handler();
    }
  };
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <ThemedTooltip title={tooltip}>
      <div css={buttonStyle}
        tabIndex={0}
        ref={ref}
        role="button"
        aria-label={tooltip}
        onClick={clickHandler}
        onKeyDown={keyHandler} >
        <Icon />
        <div>{ text }</div>
      </div>
    </ThemedTooltip>
  );
}

export default TrackSelection;
