import React, { useState } from 'react'

import Draggable from 'react-draggable';

import { css, SerializedStyles } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectSegments, segmentAdded,
} from './segmentsSlice'
import { Segment, Segments } from './types'

import store from './store'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Timeline: React.FC<{}> = () => {

  const timelineStyle = {
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: '200px',
    width: '100%',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };
  
  return (
  <div css={timelineStyle} title="Timeline">
    <Scrubber />
    <SegmentsList />
  </div>
  );
};

const Scrubber: React.FC<{}> = () => {

  const [deltaPosition, setDeltaPosition] = useState({
    x: 0,
    y: 0,
  }); 

  const handleDrag = (e: any, ui: any) => {
    const x = deltaPosition.x;
    const y = deltaPosition.y;
    setDeltaPosition ({
        x: x + ui.deltaX,
        y: y + ui.deltaY,
      });
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
    <Draggable onDrag={handleDrag}
      axis="x"
      bounds="parent">
      <div css={scrubberStyle} title="Scrubber">
        <div css= {scrubberDragHandleStyle} title="dragHandle">
          <FontAwesomeIcon css={scrubberDragHandleIconStyle} icon={faBars} size="1x" />
        </div>
        <div>x: {deltaPosition.x}, y: {deltaPosition.y.toFixed(0)}</div>
      </div>
    </Draggable>
  );
};

// store.dispatch(segmentAdded({
//   startTime: 0,
//   endTime: 0,
//   state: "Hello there",
// })); 

const SegmentsList: React.FC<{}> = () => {

  const segments = useSelector(selectSegments)

  const renderedSegments = () => {
    const segmentsArray = segments.segments;
    
    // if (!segmentsArray) return <div>no data</div>;
    // if (!Array.isArray(segmentsArray)) return 'results are not array' + typeof(segmentsArray);

    

    const segmentStyle = css({
      backgroundColor: 'rgba(0, 0, 240, 1)',
      borderRadius: '25px',
      width: '10%',
      height: '200px',
    })

    const timelineWidth = 2500    // TODO: Get actual width
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
      // segmentsArray.map( (segment: Segment) => (
      //   <div css={segmentStyle} title="A segment">
      //     <i>{segment.startTime}</i>
      //     <span>{segment.endTime}</span>
      //     <p>{segment.state}</p>
      //   </div>
      // )));
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