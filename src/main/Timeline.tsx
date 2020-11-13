import React, { useState, useRef, useEffect, useCallback } from 'react'

import Draggable, { ControlPosition } from 'react-draggable';

import { css, SerializedStyles } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectSegments, segmentAdded,
} from '../redux/segmentsSlice'
import { Segment, Segments } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectDuration, setIsPlaying, setCurrentlyAt
} from '../redux/videoSlice'

import store from '../redux/store'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import ReactDOM from "react-dom";
import useResizeObserver from "use-resize-observer";

/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 */
const Timeline: React.FC<{}> = () => {

  //const [width, setWidth] = useState(0)
  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineStyle = {
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: '200px',
    width: '100%',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };
  
  return (
  <div ref={ref} css={timelineStyle} title="Timeline">
    <Scrubber timelineWidth={width}/>
    <SegmentsList timelineWidth={width}/>
  </div>
  );
};

/**
 * Displays and defines the current position in the video
 * TODO: Fix position fail when starting and then quickly stopping the video
 * @param param0 
 */
const Scrubber: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)

  // Init state variables
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,}); 
  const wasCurrentlyAtRef = useRef(0)

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    if(currentlyAt !== wasCurrentlyAtRef.current) {
      updateXPos();
      wasCurrentlyAtRef.current = currentlyAt;
    }
  })

  // Reposition scrubber when the timeline width changes
  useEffect(() => {
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
  }, [timelineWidth])

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    const {x, y} = position;
    setControlledPosition({x, y});
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));
    console.log("onControlledDrag was called.")
  };

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    const {x, y} = controlledPosition;
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y});
    console.log("CurrentlyAt: "+currentlyAt+"; Duration: "+duration+"; timelineWidth: "+timelineWidth)
    console.log("Result: "+(currentlyAt / duration) * (timelineWidth))
    console.log("X: "+controlledPosition.x)
  };

  const scrubberStyle = css({
    backgroundColor: 'rgba(255, 0, 0, 1)',
    height: '200px',
    width: '1px',
    position: 'absolute' as 'absolute',
    zIndex: 1,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }); 

  const scrubberDragHandleStyle = css({
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: '10px',
    height: '50px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  })

  const scrubberDragHandleIconStyle = css({
    transform: 'scaleY(1.5) rotate(90deg)',
    padding: '5px',
  })

  return (
    <Draggable onDrag={onControlledDrag}
      axis="x"
      bounds="parent"
      position={controlledPosition}
      disabled={isPlaying}
      >
      <div css={scrubberStyle} title="Scrubber">
        <div css= {scrubberDragHandleStyle} title="dragHandle">
          <FontAwesomeIcon css={scrubberDragHandleIconStyle} icon={faBars} size="1x" />
        </div>
      </div>
    </Draggable>
  );
};

// store.dispatch(segmentAdded({
//   startTime: 0,
//   endTime: 0,
//   state: "Hello there",
// })); 

/**
 * Container responsible for rendering the segments that are created when cuting
 * TODO: Complete styling
 * TODO: Fix segment width not changing correctly when changing window size
 */
const SegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const segments = useSelector(selectSegments)

  // Render the individual segments
  const renderedSegments = () => {
    const segmentsArray = segments.segments;

    const segmentStyles: SerializedStyles[] = []
    segmentsArray.map( (segment: Segment) => (
      segmentStyles.push(css({
        backgroundColor: segment.state === "alive" ? 'blue' : 'pink',
        borderRadius: '25px',
        width: (segment.endTime - segment.startTime) / (timelineWidth / 100.0) + '%',
        height: '200px',
        opacity: '0.4',
      }))
    ));

    return (
      segmentStyles.map( (style) => (
        <div css={style} title="A segment">
        </div>
      )));
  }


  const segmentsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
  })

  return (
    <div css={segmentsStyle} title="Segments">
      {renderedSegments()}
    </div>
  );
};

export default Timeline;