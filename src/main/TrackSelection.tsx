import React from "react";
import { css } from '@emotion/react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faTrash,
  faTrashRestore,
} from "@fortawesome/free-solid-svg-icons";
import ReactPlayer from 'react-player'

import { Track }  from '../types'
import { useSelector, useDispatch } from 'react-redux';
import { selectVideos, setTrackEnabled } from '../redux/videoSlice'
import { basicButtonStyle, deactivatedButtonStyle } from '../cssStyles'

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

  return (
    <div>
      { trackItems }
      <Description />
    </div>
  );
}


const Description: React.FC = () => {

  const { t } = useTranslation();

  const description: string = t('trackSelection.description',
    'Select or deselect which tracks are used for processing and publication.');

  const descriptionStyle = css({
    display: 'flex',
    alignItems: 'center',
    margin: '20px',
    padding: '10px',
  });

  return (
    <aside css={descriptionStyle}>
      <FontAwesomeIcon css={{margin: '10px'}} icon={faInfoCircle} size="2x" />
      { description }
    </aside>
  );
}


const TrackItem: React.FC<{track: Track, enabledCount: number}> = ({track, enabledCount}) => {

  const theme = useSelector(selectTheme);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const header = track.flavor.type + ' '
    + (track.video_stream.enabled ? ''
      :  `(${t('trackSelection.trackInactive', 'inactive')})`);

  const trackItemStyle = css({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px',
    paddingBottom: '10px',
    verticalAlign: 'middle',
  });

  const playerStyle = css({
    display: 'inline-block',
    width: '80%',
    maxHeight: '200px',
    margin: '10px',
  });

  const headerStyle = css({
    display: 'inline-block',
    width: '100%',
    fontWeight: 'bold',
    padding: '5px 25px',
    borderBottom: `${theme.menuBorder}`,
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
  const deleteIcon = [faTrash, faTrash, faTrashRestore][deleteStatus];
  const trackEnabledChange = () => {
    dispatch(setTrackEnabled({
      id: track.id,
      enabled: !track.video_stream.enabled,
    }))
  }

  return (
    <div css={trackItemStyle}>
      <div css={headerStyle}>{ header }</div>
      <div css={{ width: '95%', textAlign: 'center', opacity: track.video_stream.enabled ? '1' : '0.5' }}>
        <ReactPlayer css={playerStyle} url={track.uri} width="90%" />
      </div>
      <SelectButton
        text={deleteText}
        tooltip={deleteTooltip}
        handler={trackEnabledChange}
        icon={deleteIcon}
        active={deleteEnabled} />
    </div>
  );
}

interface selectButtonInterface {
  handler: any,
  text: string,
  icon: any,
  tooltip: string,
  active: boolean,
}

const SelectButton : React.FC<selectButtonInterface> = ({handler, text, icon, tooltip, active}) => {

  const theme = useSelector(selectTheme);
  
  const buttonStyle = [
    active ? basicButtonStyle(theme) : deactivatedButtonStyle,
    {
      margin: '10px 15px',
      padding: '16px',
      width: '25%',
      boxShadow: `${theme.boxShadow}`,
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
        <FontAwesomeIcon icon={icon} size="1x" />
        <div>{ text }</div>
      </div>
    </ThemedTooltip>
  );
}

export default TrackSelection;
