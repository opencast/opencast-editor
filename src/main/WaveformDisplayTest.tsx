import React, { useState, useRef, useEffect } from 'react'
import { httpRequestState } from '../types'

import { css } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import { Segment } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectSegments, selectActiveSegmentIndex, selectDuration,
  setCurrentlyAt, selectVideoURL
} from '../redux/videoSlice'

import { Waveform } from '../util/waveform'

import Worker from '../worker'




/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 */
const WaveformDisplayTest: React.FC<{}> = () => {

  const videoURLs = useSelector(selectVideoURL)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);

  const waveformDisplayTestStyle = css({
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    height: '250px',
    width: '100%',
    //backgroundImage: `url({myImg})`,
  });

    // Create new instance
  const instance = new Worker();

  const onClickk = () => {
    const data = 'Some data';

    return new Promise(async resolve => {

      // Use a web worker to process the data
      const processed = await instance.processData(data);

      resolve(processed);
    });
  };

  // Update based on current fetching status
   if (videoURLStatus === 'success') {
    console.log("HI")
    onClickk()

    console.log("HI HI")

    var blob = null
    var xhr = new XMLHttpRequest()
    xhr.open("GET", videoURLs[0])
    xhr.responseType = "blob"
    xhr.onload = function()
    {
        blob = xhr.response
        var file = new File([blob], blob)
        let waveforms = []
        waveforms.push(new Waveform({type: 'svg', samples: 100000, media: file }));
    }
    xhr.send()



  }

  // let waveforms = []
  // waveforms.push(new Waveform({type: 'svg', samples: 100000, media: videoURLs[0] }));
        // waveforms[0].oncomplete = function(image, numSamples) {

        // };

  return (
  <div css={waveformDisplayTestStyle} title="WaveformDisplayTest">

  </div>
  );
};

export default WaveformDisplayTest
