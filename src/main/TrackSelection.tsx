import React from "react";
import { css } from '@emotion/react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle} from "@fortawesome/free-solid-svg-icons";

import { Track }  from '../types'
import { useSelector, useDispatch } from 'react-redux';
import { selectTracks, setStreamEnabled } from '../redux/videoSlice'

import { useTranslation } from 'react-i18next';


/**
 * Creates the track selection.
 */
const TrackSelection: React.FC<{}> = () => {

  // Generate list of tracks
  const tracks: Track[] = useSelector(selectTracks);
  const trackItems: JSX.Element[] = tracks.map((track: Track) =>
    <TrackItem key={ track.id } track={ track } />
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


const TrackItem: React.FC<{track: Track}> = ({track}) => {

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const type = track.flavor.type,
        labelAudio = t('trackSelection.useAudio', 'Use audio stream'),
        labelVideo = t('trackSelection.useVideo', 'Use video stream');

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
    margin: '10px'
  });

  const blockStyle = css({
    display: 'inline-block',
    width: '20%',
    minWidth: '150px',
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

  const streamChange = (event: React.FormEvent<HTMLInputElement>) => {
    dispatch(setStreamEnabled({
      id: track.id,
      enabled: event.currentTarget.checked,
      type: event.currentTarget.id.charAt(0)
    }))
  }

  return (
    <div css={ trackItemStyle }>
      <div css={ headerStyle }>{ type }</div>
      <video css={ playerStyle } src={ track.uri } controls />
      <div css={ blockStyle }>
        <input id={ `a-${track.id}` }
               type="checkbox"
               onChange={ streamChange }
               checked={ track.audio_stream.enabled } />
        <label htmlFor={ `a-${track.id}` }>{ labelAudio }</label>
      </div>
      <div css={ blockStyle }>
        <input id={ `v-${track.id}` }
               type="checkbox"
               onChange={ streamChange }
               checked={ track.video_stream.enabled } />
        <label htmlFor={ `v-${track.id}` }>{ labelVideo }</label>
      </div>
    </div>
  );
}

export default TrackSelection;
