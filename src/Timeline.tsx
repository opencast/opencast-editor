import React, { useState } from 'react'

import Draggable from 'react-draggable';

const Timeline: React.FC<{}> = () => {

  const timelineStyle = {
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: '200px',
    width: '100%',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };
  
  return (
  <div css={timelineStyle} title="Timeline">
    <Scrubber />
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

  const scrubberStyle = {
    backgroundColor: 'rgba(255, 0, 0, 1)',
    height: '200px',
    width: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  }; 

  return (
    <Draggable onDrag={handleDrag}
      axis="x"
      bounds="parent">
      <div css={scrubberStyle} title="Scrubber">
        <div>x: {deltaPosition.x}, y: {deltaPosition.y.toFixed(0)}</div>
      </div>
    </Draggable>

  );
};

export default Timeline;