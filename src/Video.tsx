import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const Video: React.FC<{}> = () => {

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
      <VideoControls />
    </div>
  );
};

const VideoPlayer: React.FC<{}> = () => {

  return (
    <div title="Video Player">
      <video width="320" height="240" controls>
      <source src="https://media.geeksforgeeks.org/wp-content/uploads/20190616234019/Canvas.move_.mp4" type="video/mp4" />
      Your browser does not support the video tag.
      </video> 
    </div>
  );
};

const VideoControls: React.FC<{}> = () => {

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
      <FontAwesomeIcon icon={faPlay} size="5x" />
      00:10:12
    </div>
  );
}

export default Video;