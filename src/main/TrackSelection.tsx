import React from "react";
import { css } from '@emotion/react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faTrash,
  faTrashRestore,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import ReactPlayer from 'react-player'

import { Track }  from '../types'
import { useSelector, useDispatch } from 'react-redux';
import { selectTracks, selectMasterAudio, setTrackEnabled, setMasterAudio } from '../redux/videoSlice'
import { basicButtonStyle, deactivatedButtonStyle } from '../cssStyles'

import { useTranslation } from 'react-i18next';


/**
 * Creates the track selection.
 */
const TrackSelection: React.FC<{}> = () => {

  // Generate list of tracks
  const tracks: Track[] = useSelector(selectTracks);
  const enabledCount = tracks.filter(t => t.video_stream.enabled).length;
  const trackItems: JSX.Element[] = tracks.map((track: Track) =>
    <TrackItem key={ track.id } track={ track } enabledCount={ enabledCount } />
  );

  return (
    <div>
      { trackItems }
      <Description />
    </div>
  );
}


const Description: React.FC<{}> = () => {

  const { t } = useTranslation();

  const description: string = t('trackSelection.description',
    'Select or deselect which audio and video streams are used for processing.');

  const descriptionStyle = css({
    display: 'flex',
    alignItems: 'center',
    margin: '20px',
    backgroundColor: '#eee',
  });

  return (
    <div css={ descriptionStyle }>
      <FontAwesomeIcon css={{margin: '20px'}} icon={faInfoCircle} size="2x" />
      { description }
    </div>
  );
}


const TrackItem: React.FC<{track: Track, enabledCount: number}> = ({track, enabledCount}) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const masterAudio: string | null = useSelector(selectMasterAudio);
  const header = track.flavor.type + ' '
    + (track.video_stream.enabled ? '' :  `(${t('lalala', 'inactive')})`);

  const trackItemStyle = css({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px',
    paddingBottom: '10px',
    backgroundColor: '#eee',
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
    borderBottom: '1px solid white',
    textTransform: 'capitalize',
    fintSize: 'larger',
  });

  const deleteText = track.video_stream.enabled ? 'Delete Track' : 'Restore Track';
  const deleteIcon = track.video_stream.enabled ? faTrash : faTrashRestore
  const deleteEnabled = enabledCount > 1 || !track.video_stream.enabled;
  const trackEnabledChange = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch(setTrackEnabled({
      id: track.id,
      enabled: !track.video_stream.enabled,
    }))
  }

  // What audio state is this track in:
  // 2 -> this track is master audio track
  // 1 -> another track is a master audio track
  // 0 -> there is no master audio track
  const audioState = masterAudio ? (masterAudio === track.id ? 2 : 1) : 0;
  const audioText = ['Use as main audio', 'Deactivated', 'Use other tracks'][audioState];
  const audioIcon = [faVolumeUp,faVolumeMute, faVolumeDown][audioState];
  const audioActive = audioState !== 1 && track.video_stream.enabled;
  const audioStreamChange = (event: React.MouseEvent<HTMLInputElement>) => {
    dispatch(setMasterAudio({
      id: track.id,
    }))
  }

  return (
    <div css={ trackItemStyle }>
      <div css={ headerStyle }>{ header }</div>
      <div css={{ opacity: track.video_stream.enabled ? '1' : '0.5' }}>
      <ReactPlayer css={ playerStyle } url={ track.uri } width="90%" />
      </div>
      <SelectButton
        text={ deleteText }
        handler={ trackEnabledChange }
        icon={ deleteIcon }
        active={ deleteEnabled }/>
      <SelectButton
        text={ audioText }
        handler={ audioStreamChange }
        icon={ audioIcon }
        active={ audioActive } />
    </div>
  );
}

const SelectButton : React.FC<{handler: any, text: string, icon: any, active: boolean}> = ({handler, text, icon, active}) => {
  const buttonStyle = [
    active ? basicButtonStyle : deactivatedButtonStyle,
    {
      margin: '10px',
      padding: '16px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
      width: '25%'
    }];
  const activeHandler = (event: React.MouseEvent<HTMLInputElement>) => {
    active && handler(event);
  }
  return (
    <div css={ buttonStyle } role="button" onClick={ activeHandler } >
      <FontAwesomeIcon icon={ icon } size="1x" />
      <div>{ text }</div>
    </div>
  );
}

export default TrackSelection;
