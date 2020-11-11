import React, { useState, useRef, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsPlaying, selectCurrentlyAt, setIsPlaying, setCurrentlyAt
} from './videoSlice'

import ReactPlayer from 'react-player'

const Video: React.FC<{}> = () => {

  const [numberOfVideos, setNumberOfVideos] = useState(1);

  // const aRef = useRef();
  // const videoRefs = [useRef(), useRef()];

  // const playVideo = () => {
  //   // videoRefs.forEach(function (videoRef) {
  //   //   videoRef.play();
  //   // });
  //   aRef.play();
  // };

  const videoAreaStyle = {
    backgroundColor: 'rgba(245, 245, 0, 1)',
    borderRadius: '25px',
    display: 'flex',
    width: 'auto',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  const videoPlayerAreaStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
  };

  return (
    <div css={videoAreaStyle} title="Video Area">
      <div css={videoPlayerAreaStyle} title="Video Player Area">
        <VideoPlayer /> 
        <VideoPlayer />
      </div>
      <VideoControls 
        //onClick={() => playVideo()}
      />
      {/* <button onClick={() => playVideo()}>PLAY</button> */}
    </div>
  );
};


const VideoPlayer: React.FC<{}> = () => {

  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)

  const ref = useRef<ReactPlayer>(null);

  const currentlyAt = useSelector(selectCurrentlyAt)
  const wasAt = currentlyAt

  useEffect(() => {

  })

  const [progress, setProgress] = useState(0);
  const onProgressCallback = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds:  number }) => {
    setProgress(state.played)
  }

  return (
    <div>
    <ReactPlayer url='https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4' 
      ref={ref}
      width='320px' 
      height='240px'
      playing={isPlaying}
      onProgress={onProgressCallback}
      progressInterval={100}
    />
    {/* {dispatch(setCurrentlyAt(5))} */}
    <div>{progress}</div>
    <button onClick={() => ref.current?.seekTo(5)}></button>
    </div>
  );

    //ref.current?.getCurrentTime()

  // return (
  //   <div title="Video Player">
  //     <video width="320" height="240" controls ref={vidRef}>
  //     <source src="https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4" type="video/mp4" />
  //     Your browser does not support the video tag.
  //     </video> 
  //   </div>
  // );
};

const VideoControls: React.FC<{}> = () => {

  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)

  const videoControlsStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
  };

  return (
    <div css={videoControlsStyle} title="Video Controls">
      <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="5x" 
        onClick={() => dispatch(setIsPlaying(isPlaying ? false : true))} 
      />
      {currentlyAt}
    </div>
  );
}

export default Video;