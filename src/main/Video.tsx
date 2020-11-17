import React, { useState, useRef, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAt, setIsPlaying, setCurrentlyAt, setDuration, addSegment
} from '../redux/videoSlice'
import { fetchVideoURL, selectVideoURL, selectVideoCount, selectDuration, } from '../redux/videoURLSlice'

import ReactPlayer from 'react-player'

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
  const videoDuration = useSelector(selectDuration)
  const videoURLStatus = useSelector((state: { videoURL: { status: string } }) => state.videoURL.status);
  const error = useSelector((state: { videoURL: { error: any } }) => state.videoURL.error)

  // Init state
  const [numberOfVideos, setNumberOfVideos] = useState(2);

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
    content = <div className="loader">Success...</div>
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
    backgroundColor: 'wheat',
    borderRadius: '25px',
    display: 'flex',
    width: 'auto',
    flex: '7',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  const videoPlayerAreaStyle = {
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
  };

  return (
    <div css={videoAreaStyle} title="Video Area">
      {content}
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
  let currentlyAt = useSelector(selectCurrentlyAt)
  const duration  = useSelector(selectDuration)
  const [ready, setReady] = useState(false);

  // Init state variables
  const ref = useRef<ReactPlayer>(null);

  // Callback for when the video is playing
  const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds:  number }) => {
    dispatch(setCurrentlyAt(state.playedSeconds))
  }

  // Callback to get video duration
  const onDurationCallback = ( duration: number ) => {
    dispatch(setDuration(duration))
  }

  // Callback for checking whether the video element is ready
  const onReadyCallback = () => {
    setReady(true);
  }

  const onEndedCallback = () => {
    dispatch(setIsPlaying(false));
    dispatch(setCurrentlyAt(duration)); // It seems onEnded is called before the full duration is reached, so we set currentlyAt to the very end
  }

  useEffect(() => {
    // Seek if the position in the video got changed externally
    if(!isPlaying && ref.current && ready) {
      console.log("useEffect seekTO CurrentlyAt: "+currentlyAt)
      ref.current.seekTo(currentlyAt, "seconds")
    }
  })

  return (
    <ReactPlayer url={url}
      ref={ref}
      // width='320px' 
      // height='240px'
      playing={isPlaying}
      muted={isMuted}
      onProgress={onProgressCallback}
      progressInterval={100}
      onDuration={onDurationCallback}
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

  return (
    <div css={videoControlStyle} title="Video Controls">
      <div css={videoControlsRowStyle} title="Video Controls Top Row">
        <FontAwesomeIcon css={playButtonStyle} icon={isPlaying ? faPause : faPlay} size="5x" 
          onClick={() => dispatch(setIsPlaying(isPlaying ? false : true))} 
        />
      </div>
      <div css={videoControlsRowStyle} title="Video Controls Bottom Row">
        <div>
          {new Date((currentlyAt ? currentlyAt : 0) * 1000).toISOString().substr(11, 12)}
        </div>        
      </div>
    </div>
  );
}

export default Video;