import React, { useState, useRef, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faToggleOn, faToggleOff, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAt, selectCurrentlyAtInSeconds, setIsPlaying, setCurrentlyAtInSeconds
} from '../redux/videoSlice'
import { 
  fetchVideoURL, selectVideoURL, selectVideoCount, selectDurationInSeconds, selectTitle, selectPresenters
} from '../redux/videoURLSlice'

import ReactPlayer from 'react-player'

import { roundToDecimalPlace } from '../util/utilityFunctions'

/**
 * Container for the videos and their controls
 * TODO: Complete fetching
 * TODO: Move fetching to a more central part of the app
 */
const Video: React.FC<{}> = () => {

  // Init redux variables
  const dispatch = useDispatch()
  const videoURLs = useSelector(selectVideoURL)
  const videoCount = useSelector(selectVideoCount)
  const videoURLStatus = useSelector((state: { videoURL: { status: string } }) => state.videoURL.status);
  const error = useSelector((state: { videoURL: { error: any } }) => state.videoURL.error)

  // Try to fetch URL from external API
  useEffect(() => {
    if (videoURLStatus === 'idle') {
      dispatch(fetchVideoURL())
    }
  }, [videoURLStatus, dispatch])

  // Update based on current fetching status
  let content
  if (videoURLStatus === 'loading') {
    content = <div className="loader">Loading...</div>
  } else if (videoURLStatus === 'success') {
    content = ""//<div className="loader">Success...</div>
  } else if (videoURLStatus === 'failed') {
    content = <div>{error}</div>
  }
  
  // Initialize video players
  const videoPlayers: JSX.Element[] = [];
  for (let i = 0; i < videoCount; i++) {  
    // videoPlayers.push(<VideoPlayer key={i} url='https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4' />);
    videoPlayers.push(<VideoPlayer key={i} url={videoURLs[i]} isMuted={i === 0 ? true : false}/>);
  }

  // Style
  const videoAreaStyle = {
    backgroundColor: 'snow',
    display: 'flex',
    width: 'auto',
    flex: '7',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #BBB',
  };

  const videoPlayerAreaStyle = {
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  };

  return (
    <div css={videoAreaStyle} title="Video Area">
      {content}
      <VideoHeader />
      <div css={videoPlayerAreaStyle} title="Video Player Area">
        {videoPlayers}
      </div>
      <VideoControls />
    </div>
  );
};

/**
 * A single video player
 * @param param0 
 */
const VideoPlayer: React.FC<{url: string, isMuted: boolean}> = ({url, isMuted}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAtInSeconds)
  const duration  = useSelector(selectDurationInSeconds)
  const [ready, setReady] = useState(false);

  // Init state variables
  const ref = useRef<ReactPlayer>(null);

  // Callback for when the video is playing
  const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds:  number }) => {
    // Only update redux if there was a substantial change
    if (roundToDecimalPlace(currentlyAt, 3) !== roundToDecimalPlace(state.playedSeconds, 3)) {
      dispatch(setCurrentlyAtInSeconds(state.playedSeconds))
    }    
  }

  // Callback for checking whether the video element is ready
  const onReadyCallback = () => {
    setReady(true);
  }

  const onEndedCallback = () => {
    dispatch(setIsPlaying(false));
    dispatch(setCurrentlyAtInSeconds(duration)); // It seems onEnded is called before the full duration is reached, so we set currentlyAt to the very end
  }

  useEffect(() => {
    // Seek if the position in the video got changed externally
    if(!isPlaying && ref.current && ready) {
      ref.current.seekTo(currentlyAt, "seconds")
    }
  })

  const playerStyle = css({
    minWidth: '320px',
    minHeight: '240px',
  })

  return (
    <ReactPlayer url={url}
      ref={ref}
      width='100%'
      height='auto'
      playing={isPlaying}
      muted={isMuted}
      css={playerStyle}
      onProgress={onProgressCallback}
      progressInterval={100}
      onReady={onReadyCallback}
      onEnded={onEndedCallback}
    />
  );

  // return (
  //   <div title="Video Player">
  //     <video width="320" height="240" controls ref={vidRef}>
  //     <source src="https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4" type="video/mp4" />
  //     Your browser does not support the video tag.
  //     </video> 
  //   </div>
  // );
};

/**
 * Contains controls for manipulating multiple video players at once
 * TODO: Add missing controls
 * TODO: Turn time display into a control
 */
const VideoControls: React.FC<{}> = () => {

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)

  const [isSkipping, setIsSkipping] = useState(false)

  // Style
  const videoControlStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
  }

  const videoControlsRowStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
    gap: '20px',
  };

  const playButtonStyle = {
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  }

  const skipToggleStyle = {
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.05)',
    },
  }

  return (
    <div css={videoControlStyle} title="Video Controls">
      <div css={videoControlsRowStyle} title="Video Controls Top Row">
        <div>
          <FontAwesomeIcon icon={faEyeSlash} size="2x" />
          <FontAwesomeIcon css={skipToggleStyle} icon={isSkipping ? faToggleOn : faToggleOff} size="2x" 
            onClick={() => setIsSkipping(isSkipping ? false : true)} 
          />
        </div> 
        <FontAwesomeIcon css={playButtonStyle} icon={isPlaying ? faPause : faPlay} size="5x" 
          onClick={() => dispatch(setIsPlaying(isPlaying ? false : true))} 
        />
        {new Date((currentlyAt ? currentlyAt : 0)).toISOString().substr(11, 12)}
      </div>
      {/* <div css={videoControlsRowStyle} title="Video Controls Bottom Row">


       
      </div> */}
    </div>
  );
}

/**
 * Displays elements above the video, e.g. title
 */
const VideoHeader: React.FC<{}> = () => {
  const title = useSelector(selectTitle)
  const presenters = useSelector(selectPresenters)

  const titleStyle = {
    fontSize: 'large'
  }

  return (
    <div title="Video Area Header">
      <div css={titleStyle} title="Video Title">{title}</div>
      <div title="Video Presenters">by {presenters.join(", ")}</div>
    </div>
  );
}

export default Video;