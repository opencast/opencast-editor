import React, { useState, useRef, useEffect } from 'react'

import Draggable from 'react-draggable';

import { css } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import { Segment } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectSegments, selectActiveSegmentIndex, selectDuration,
  setCurrentlyAt
} from '../redux/videoSlice'

// import { selectDuration, } from '../redux/videoURLSlice'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

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
    backgroundColor: 'snow',
    height: '250px',
    width: '100%',
    //backgroundImage: `url({myImg})`,
  });
  
  return (
  <div ref={ref} css={timelineStyle} title="Timeline">
    <Scrubber timelineWidth={width}/>
    <div css={{height: '230px'}}>
      <img alt='waveform2' src={myImg} style={{position: "absolute" as "absolute", height: '230px', width: '100%', top: '10px'}}></img>
      <SegmentsList timelineWidth={width}/>
    </div>
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
  const [isGrabbed, setIsGrabbed] = useState(false) 
  const wasCurrentlyAtRef = useRef(0)

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    if(currentlyAt !== wasCurrentlyAtRef.current) {
      updateXPos();
      wasCurrentlyAtRef.current = currentlyAt;
    }
  })

  // // Reposition scrubber when the timeline width changes
  // useEffect(() => {
  //   setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [timelineWidth])

  // Callback for when the scrubber gets dragged by the user
  // const onControlledDrag = (e: any, position: any) => {
  //   const {x, y} = position;
  //   dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));
  // };

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    const y = controlledPosition.y;
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y});
  };

  const onStartDrag = () => {
    setIsGrabbed(true)
  }

  const onStopDrag = (e: any, position: any) => {
    const {x, y} = position;
    setControlledPosition({x, y});
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));

    setIsGrabbed(false)
  }

  const scrubberStyle = css({
    backgroundColor: 'rgba(255, 0, 0, 1)',
    height: '250px',
    width: '1px',
    position: 'absolute' as 'absolute',
    zIndex: 2,
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
    cursor: isGrabbed ? "grabbing" : "grab",
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
      onStart={onStartDrag}
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
 */
const SegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const segments = useSelector(selectSegments)
  const duration = useSelector(selectDuration)
  const activeSegmentIndex = useSelector(selectActiveSegmentIndex)

  /**
   * Returns a background color based on whether the segment is to be deleted
   * and whether the segment is currently active
   */ 
  const bgColor = (state: boolean, index: boolean) => {
    if (state && !index) {
      return 'rgba(0, 0, 255, 0.4)' 
    } else if (!state && !index) {
      return 'rgba(255, 0, 0, 0.4)' 
    } else if (state && index) {
      return 'rgba(0, 0, 200, 0.4)' 
    } else if (!state && index) {
      return 'rgba(200, 0, 0, 0.4)'
    }
  }

  // Render the individual segments
  const renderedSegments = () => {
    return (
      segments.map( (segment: Segment, index: number) => (
        <div key={segment.id} title="Segment" css={{
          backgroundColor: bgColor(segment.isAlive, activeSegmentIndex === index),//segment.state === "alive" ? 'rgba(0, 0, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)',
          borderRadius: '5px',
          borderStyle: 'solid',
          borderColor: 'white',
          borderWidth: '1px',
          boxSizing: 'border-box',
          width: ((segment.endTime - segment.startTime) / duration) * 100 + '%',
          height: '230px',
          zIndex: 1,
        }}>
        </div>
        
      ))
    );
  }

  const segmentsStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    paddingTop: '10px',
  })

  return (
    <div css={segmentsStyle} title="Segments">
      {renderedSegments()}
    </div>
  );
};

export default Timeline;
