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
    'Select or deselect which tracks and audio streams are used for processing '
    + 'and publication.');
  const deleteDescription = t('trackSelection.deleteDescription',
    'Deleting a track will result in this track not being processed and/or published when starting a workflow. '
    + 'They may still remain in the archive.');
  const masterDescription = t('trackSelection.masterDescription',
    'Marking an audio stream as main audio will result in this audio stream being transferred to all other tracks '
    + 'during publication, overwriting existing audio streams from those tracks if they exist. Using individual audio '
    + 'streams means that each track will keep its original audio stream.');

  const descriptionStyle = css({
    display: 'flex',
    alignItems: 'center',
    margin: '20px',
    padding: '10px',
    backgroundColor: '#eee',
  });

  return (
    <aside css={ descriptionStyle }>
      <FontAwesomeIcon css={{margin: '10px'}} icon={faInfoCircle} size="2x" />
      <div>
      { description }
      <ul>
        <li>{ deleteDescription }</li>
        <li>{ masterDescription }</li>
      </ul>
      </div>
    </aside>
  );
}


const TrackItem: React.FC<{track: Track, enabledCount: number}> = ({track, enabledCount}) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const masterAudio: string | null = useSelector(selectMasterAudio);
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

  // Configure if tracks can be deactivated.
  // We do not permit deactivating the last remaining track
  const deleteEnabled = enabledCount > 1 || !track.video_stream.enabled;
  const deleteText = track.video_stream.enabled
    ? t('trackSelection.deleteTrackText', 'Delete Track')
    : t('trackSelection.restoreTrackText', 'Restore Track');
  const deleteTooltip = deleteEnabled ? (track.video_stream.enabled
    ? t('trackSelection.deleteTrackTooltip', 'Do not encode and publish this track.')
    : t('trackSelection.deleteTrackTooltip', 'Encode and publish this track.'))
    : t('trackSelection.cannotDeleteTrackTooltip', 'Cannot remove this track from publication.');
  const deleteIcon = track.video_stream.enabled ? faTrash : faTrashRestore
  const trackEnabledChange = () => {
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
  const audioText = [
    t('trackSelection.masterAudioText', 'Main Audio'),
    t('trackSelection.inactiveAudioText', 'Deactivated'),
    t('trackSelection.individualAudioText', 'Individual Audio')][audioState];
  const audioTooltip = [
    t('trackSelection.masterAudioTooltip', 'Use this audio stream for all published tracks, overwriting existing ones if necessary'),
    t('trackSelection.inactiveAudioTooltip', 'This audio stream is deactivated and will be overwritten.'),
    t('trackSelection.individualAudioTooltip', 'Use individual audio streams on all tracks')][audioState];
  const audioIcon = [faVolumeUp,faVolumeMute, faVolumeDown][audioState];
  const audioActive = audioState !== 1 && track.video_stream.enabled;
  const audioStreamChange = () => {
    dispatch(setMasterAudio({
      id: track.id,
    }))
  }

  return (
    <div css={ trackItemStyle }>
      <div css={ headerStyle }>{ header }</div>
      <div css={{ width: '95%', opacity: track.video_stream.enabled ? '1' : '0.5' }}>
        <ReactPlayer css={ playerStyle } url={ track.uri } width="90%" />
      </div>
      <SelectButton
        text={ deleteText }
        tooltip={ deleteTooltip }
        handler={ trackEnabledChange }
        icon={ deleteIcon }
        active={ deleteEnabled }/>
      <SelectButton
        text={ audioText }
        tooltip={ audioTooltip }
        handler={ audioStreamChange }
        icon={ audioIcon }
        active={ audioActive } />
    </div>
  );
}

const SelectButton : React.FC<{handler: any, text: string, icon: any, tooltip: string, active: boolean}> = ({handler, text, icon, tooltip, active}) => {
  const buttonStyle = [
    active ? basicButtonStyle : deactivatedButtonStyle,
    {
      margin: '10px',
      padding: '16px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
      width: '25%'
    }];
  const clickHandler = () => {
    active && handler();
  };
  const keyHandler = (event: React.KeyboardEvent) => {
    if (active && (event.key === " " || event.key === "Enter")) {
      handler();
    }
  };
  return (
    <div css={ buttonStyle }
         tabIndex={ 0 }
         role="button"
         title={ tooltip }
         aria-label={ tooltip }
         onClick={ clickHandler }
         onKeyDown={ keyHandler } >
      <FontAwesomeIcon icon={ icon } size="1x" />
      <div>{ text }</div>
    </div>
  );
}

export default TrackSelection;
