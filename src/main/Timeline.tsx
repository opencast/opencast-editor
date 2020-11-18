import React, { useState, useRef, useEffect, useCallback } from 'react'

import Draggable, { ControlPosition } from 'react-draggable';

import { css, SerializedStyles } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import { Segment } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectSegments, setIsPlaying, setCurrentlyAt, addSegment, cut
} from '../redux/videoSlice'

import { selectDuration, } from '../redux/videoURLSlice'

import store from '../redux/store'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import ReactDOM from "react-dom";
import useResizeObserver from "use-resize-observer";

import myImg from '../img/placeholder_waveform.png'

/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 */
const Timeline: React.FC<{}> = () => {

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineStyle = css({
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: '250px',
    width: '100%',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    // backgroundImage: "url({myImg})",
  });
  
  return (
  <div ref={ref} css={timelineStyle} title="Timeline">
    <img alt='waveform2' src={myImg} style={{position: "absolute" as "absolute", height: '250px', width: '100%'}}></img>
    <Scrubber timelineWidth={width}/>
    <SegmentsList timelineWidth={width}/>
  </div>
  );
};

/**
 * Displays and defines the current position in the video
 * TODO: Fix position fail when starting and then quickly stopping the video
 *       Possibly because state.playedSceonds in Video is faulty for small values
 * TODO: Fix timeline width changes
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
  // useEffect(() => {
  //   setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
  // }, [timelineWidth])

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    const {x, y} = position;
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));
  };

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    const {x, y} = controlledPosition;
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y});
  };

  const onStopDrag = (e: any, position: any) => {
    const {x, y} = position;
    setControlledPosition({x, y});
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));
  }

  const scrubberStyle = css({
    backgroundColor: 'rgba(255, 0, 0, 1)',
    height: '250px',
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
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  })

  const scrubberDragHandleIconStyle = css({
    transform: 'scaleY(1.5) rotate(90deg)',
    padding: '5px',
  })

  return (
    <Draggable 
      //onDrag={onControlledDrag}
      onStop={onStopDrag}
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

/**
 * Container responsible for rendering the segments that are created when cuting
 * TODO: Complete styling
 * TODO: Fix segment width not changing correctly when changing window size
 */
const SegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const segments = useSelector(selectSegments)
  const duration = useSelector(selectDuration)  

  // Render the individual segments
  const renderedSegments = () => {
    return (
      segments.map( (segment: Segment) => (
        <div key={segment.id} title="Segment" css={{
          backgroundColor: segment.state === "alive" ? 'blue' : 'pink',
          borderRadius: '25px',
          width: ((segment.endTime - segment.startTime) / duration) * 100 + '%',
          height: '250px',
          opacity: '0.4',
        }}>
        </div>
        
      ))
    );
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