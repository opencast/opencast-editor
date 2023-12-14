import React from "react";
import { css } from '@emotion/react'

import { IconType } from "react-icons";
import { LuTrash, LuXCircle } from "react-icons/lu";
import { ReactComponent as TrashRestore } from '../img/trash-restore.svg';
import ReactPlayer from 'react-player'

import { Track } from '../types'
import { useSelector, useDispatch } from 'react-redux';
import { selectVideos, selectWaveformImages, setAudioEnabled, setVideoEnabled } from '../redux/videoSlice'
import { backgroundBoxStyle, basicButtonStyle, customIconStyle, deactivatedButtonStyle, flexGapReplacementStyle, titleStyle, titleStyleBold } from '../cssStyles'

import { useTranslation } from 'react-i18next';
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { outOfBounds } from "../util/utilityFunctions";

/**
 * Creates the track selection.
 */
const TrackSelection: React.FC = () => {

  // Generate list of tracks
  const tracks: Track[] = useSelector(selectVideos);
  const enabledCount = tracks.filter(t => t.video_stream.enabled).length;
  const images = useSelector(selectWaveformImages)
  const trackItems: JSX.Element[] = tracks.map((track: Track, index: number) =>
    <TrackItem
      key={track.id}
      track={track}
      enabledCount={enabledCount}
      waveform={outOfBounds(images, index) ? undefined : images[index]}
    />
  );

  const trackSelectionStyle = css({
    display: 'flex',
    width: 'auto',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  })

  const trackAreaStyle = css({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(10, false)),
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
  const theme = useTheme()

  const description: string = t('trackSelection.title');

  return (
    <div css={[titleStyle(theme), titleStyleBold(theme)]}>
      { description }
    </div>
  );
}


const TrackItem: React.FC<{track: Track, enabledCount: number, waveform: string | undefined}> = ({track, enabledCount, waveform}) => {

  const theme = useTheme()

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const header = track.flavor.type

  const imagesMaxWidth = 475

  const trackItemStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
  });

  const trackitemSubStyle = css({
    display: 'flex',
    flexDirection: 'row',
    ...(flexGapReplacementStyle(20, true)),

    justifyContent: 'space-around',
    flexWrap: 'wrap',
  })

  const imagesStyle = css({
    display: 'flex',
    flexDirection: 'column',
    ...(flexGapReplacementStyle(20, true)),
  })

  const playerStyle = css({
    aspectRatio: '16 / 9',
    width: '100%',
    maxWidth: `${imagesMaxWidth}px`,
  });

  const imgStyle = css({
    height: '54px',   // Keep height consistent in case the image does not render
    width: '100%',
    maxWidth: `${imagesMaxWidth}px`,

    filter: `${theme.invert_wave}`,
    color: `${theme.inverted_text}`,
  })

  const headerStyle = css({
    fontWeight: 'bold',
    fontSize: 'larger',
    color: `${theme.text}`,
    '&:first-letter': {
      textTransform: 'capitalize',
    },
  });

  const buttonsStyle = css({
    // TODO: Avoid hard-coding max-width
    "@media (max-width: 1550px)": {
      width: '100%',
    },
    display: 'flex',
    flexDirection: 'column',
  })

  // What state is the video stream in and can it be deactivated?
  // We do not permit deactivating the last remaining video
  // 2 -> Video is enabled and can be deactivated
  // 1 -> Video is enabled but is the last and cannot be deactivated
  // 0 -> Video is disabled and can be restored
  const deleteStatus = track.video_stream.enabled ? (enabledCount > 1 ? 0 : 1) : 2;
  const deleteEnabled = deleteStatus !== 1;
  const deleteTextVideo = [
    t('trackSelection.deleteVideoText'),
    t('trackSelection.cannotDeleteVideoText'),
    t('trackSelection.restoreVideoText')
  ][deleteStatus];
  const deleteTooltipVideo = [
    t('trackSelection.deleteVideoTooltip'),
    t('trackSelection.cannotDeleteVideoTooltip'),
    t('trackSelection.restoreVideoTooltip')
  ][deleteStatus];
  const deleteIcon = [LuTrash, LuXCircle, TrashRestore][deleteStatus];
  const videoEnabledChange = () => {
    dispatch(setVideoEnabled({
      trackId: track.id,
      enabled: !track.video_stream.enabled,
    }))
  }

  // What state is the audio stream in and can it be deactivated?
  // 2 -> Audio is enabled and can be deactivated
  // 1 -> Audio is not available on this track and thus cannot be de-/activated
  // 0 -> Audio is disabled and can be restored
  const deleteStatusAudio = track.audio_stream.available ? (track.audio_stream.enabled ? 0 : 2) : 1;
  const deleteEnabledAudio = deleteStatusAudio !== 1;
  const deleteTextAudio = [
    t('trackSelection.deleteAudioText'),
    t('trackSelection.noAudioText'),
    t('trackSelection.restoreAudioText')
  ][deleteStatusAudio];
  const deleteTooltipAudio = [
    t('trackSelection.deleteAudioTooltip'),
    t('trackSelection.noAudioTooltip'),
    t('trackSelection.restoreAudioTooltip')
  ][deleteStatusAudio];
  const deleteIconAudio = [LuTrash, LuXCircle, TrashRestore][deleteStatusAudio];
  const audioEnabledChange = () => {
    dispatch(setAudioEnabled({
      trackId: track.id,
      enabled: !track.audio_stream.enabled,
    }))
  }

  return (
    <div css={[backgroundBoxStyle(theme), trackItemStyle]}>
      <div css={headerStyle}>{ header }</div>
      <div css={trackitemSubStyle}>
        <div css={imagesStyle}>
          <ReactPlayer
            width="unset"
            height="unset"
            css={playerStyle}
            style={{opacity: track.video_stream.enabled ? '1' : '0.5'}}
            url={track.uri}
          />
          {track.audio_stream.available ?
            <img
              src={waveform ?? "/placeholder-waveform.png"}
              css={imgStyle}
              style={{opacity: track.audio_stream.enabled ? '1' : '0.5'}}
              alt="placeholder for audio stream"
            />
            :
            <img
              src="/placeholder-waveform-empty.png"
              css={imgStyle}
              style={{opacity: '0.5'}}
              alt="placeholder for unavailable audio stream"
            />
          }
        </div>
        <div css={buttonsStyle}>
          <SelectButton
            text={deleteTextVideo}
            tooltip={deleteTooltipVideo}
            handler={videoEnabledChange}
            Icon={deleteIcon}
            active={deleteEnabled}
            positionAtEnd={false}
          />
          <SelectButton
            text={deleteTextAudio}
            tooltip={deleteTooltipAudio}
            handler={audioEnabledChange}
            Icon={deleteIconAudio}
            active={deleteEnabledAudio}
            positionAtEnd={true}
          />
        </div>
      </div>
    </div>
  );
}

interface selectButtonInterface {
  handler: any,
  text: string,
  Icon: IconType | React.FunctionComponent,
  tooltip: string,
  active: boolean,
  positionAtEnd: boolean,   // Just here to align the audio button with the corresponding image
}

const SelectButton : React.FC<selectButtonInterface> = ({handler, text, Icon, tooltip, active, positionAtEnd}) => {

  const theme = useTheme();

  const buttonStyle = [
    active ? basicButtonStyle(theme) : deactivatedButtonStyle,
    {
      padding: '16px',
      maxHeight: '21px',
      boxShadow: '',
      background: `${theme.element_bg}`,
      textWrap: 'nowrap',
      ...(positionAtEnd && {marginTop: 'auto'}),
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
      <div
        css={buttonStyle}
        tabIndex={0}
        ref={ref}
        role="button"
        aria-label={tooltip}
        onClick={clickHandler}
        onKeyDown={keyHandler} >
        <Icon css={customIconStyle}/>
        { text }
      </div>
    </ThemedTooltip>
  );
}

export default TrackSelection;
