import React, { useEffect, useRef, useState } from "react";

import Draggable from 'react-draggable';

import { css } from '@emotion/react'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectTimelineZoom, selectTimelineScrollPosition, setTimelineScrollPosition, selectWaveformImages
} from '../redux/videoSlice'

import useResizeObserver from "use-resize-observer";

/**
 * A small indicator to display alongside the timeline.
 * It should aid the user in determining their position on the timeline when
 * zooming in.
 */
const ZoomTimeline: React.FC<{}> = () => {

  // Refs
  const ref = useRef<HTMLDivElement>(null);
  let { width = 1, } = useResizeObserver<HTMLDivElement>({ ref });
  const refIndicator = useRef(null);

  // Init redux variables
  const dispatch = useDispatch();
  const zoomMultiplicator = useSelector(selectTimelineZoom)
  const timelineScrollPosition = useSelector(selectTimelineScrollPosition)
  const waveformImages = useSelector(selectWaveformImages)

  // Init state variables
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,});
  const wasTimelineScrollPosition = useRef(0)

  // Reposition indicator when scroll position was changed externally
  useEffect(() => {
    if (timelineScrollPosition !== undefined && timelineScrollPosition !== wasTimelineScrollPosition.current && !isGrabbed) {
      updateXPos();
      wasTimelineScrollPosition.current = timelineScrollPosition;
    }
  })

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    if (timelineScrollPosition !== undefined && ref.current) {
      console.log("tSP: " + timelineScrollPosition + " width: " + width)
      setControlledPosition({x: timelineScrollPosition * ref.current.scrollWidth, y: 0});
    }
  };

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    // Update position
    if (ref.current) {
      const {x} = position
      dispatch(setTimelineScrollPosition((x / ref.current.scrollWidth)))
    }
  };

  const onStartDrag = () => {
    setIsGrabbed(true)
  }

  const onStopDrag = (e: any, position: any) => {
    // Update position
    if (ref.current) {
      const {x} = position;
      setControlledPosition({x, y: 0});
      dispatch(setTimelineScrollPosition(x / ref.current.scrollWidth))
    }

    setIsGrabbed(false)
  }

  const zoomTimelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    backgroundColor: 'grey',
    height: '30px',
    width: '100%',
    overflow: 'hidden',
  })

  const zoomIndicatorStyle = css({
    position: 'absolute',
    backgroundColor: '#FFFFFF80',
    height: '100%',
    width: 100.0 / zoomMultiplicator + '%',
  })

  const render = () => {
    // Don't render if there is no zoom
    if (zoomMultiplicator === 1) {
      return (
        undefined
      )
    } else {
      return (
        <div ref={ref} css={zoomTimelineStyle}>
          <Draggable
            onDrag={onControlledDrag}
            onStart={onStartDrag}
            onStop={onStopDrag}
            axis="x"
            bounds="parent"
            position={controlledPosition}
            nodeRef={refIndicator}
            >
              <div ref={refIndicator} css={zoomIndicatorStyle}></div>
          </Draggable>

          { waveformImages.map((image, index) => {
            return <img key={index} alt='Waveform' src={image ? image : ""} css={{width: '100%', height: '100%'}}></img>
          })}
        </div>
      )
    }
  }

  return (
    <>
      {render()}
    </>
  )
}

export default ZoomTimeline;