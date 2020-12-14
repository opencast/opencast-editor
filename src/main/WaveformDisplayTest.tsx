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

  const [updateNumber, setUpdateNumber] = useState(1234)
  const [once, setOnce] = useState(true)

  const videoURLs = useSelector(selectVideoURL)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);

  const waveformDisplayTestStyle = css({
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    width: '100%',
    //backgroundImage: `url({myImg})`,
  });

  // Update based on current fetching status
  const [images, setImages] = useState<string[]>([])

  // When the URLs to the videos are fetched, generate waveforms
  useEffect( () => {
    if (videoURLStatus === 'success') {
      const images: any[] = []    // Store local paths to image files
      let waveformsProcessed = 0  // Counter for checking if all workers are done

      videoURLs.forEach((item, index, array) => {
        // Set up blob request
        var blob = null
        var xhr = new XMLHttpRequest()
        xhr.open("GET", videoURLs[0])
        xhr.responseType = "blob"
        xhr.onload = function()
        {
            blob = xhr.response
            var file = new File([blob], blob)

            // Start waveform worker with blob
            const tmpWaveforms: any = []
            tmpWaveforms.push(new Waveform({type: 'img', width: '2000', height: '230', samples: 100000, media: file }));
            // When done, save path to generated waveform img
            tmpWaveforms[0].oncomplete = function(image: any, numSamples: any) {
              images.push(image)
              waveformsProcessed++
              // If all images are generated, rerender
              if (waveformsProcessed === array.length) {
                setImages(images)
              }
            }
        }
        xhr.send()
      })
    }
  }, [videoURLStatus, videoURLs]);

  return (
  <div css={waveformDisplayTestStyle} title="WaveformDisplayTest">
    {images.map(image =>
      <img alt='Wewform' src={image ? image : ""} style={{position: "absolute" as "absolute", height: '230px', width: '100%', top: '10px'}}></img>
    )}
    {/* <img alt='Wewform' src={leWaveform ? leWaveform.waveformImage : ""} style={{position: "absolute" as "absolute", height: '230px', width: '100%', top: '10px'}}></img> */}
    <button onClick={() => setUpdateNumber(2)}>{updateNumber}</button>
  </div>
  );
};

export default WaveformDisplayTest
