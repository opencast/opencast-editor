import React, { useState, useRef, useEffect } from 'react'

import Draggable from 'react-draggable';

import { css } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import { Segment, httpRequestState } from '../types'
import {
  selectIsPlaying, selectCurrentlyAt, selectSegments, selectActiveSegmentIndex, selectDuration,
  selectVideoURL, setCurrentlyAt
} from '../redux/videoSlice'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSpinner } from "@fortawesome/free-solid-svg-icons";

import useResizeObserver from "use-resize-observer";

import { Waveform } from '../util/waveform'
import { convertMsToReadableString } from '../util/utilityFunctions';

/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 */
const Timeline: React.FC<{}> = () => {

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineStyle = css({
    position: 'relative' as 'relative',     // Need to set position for Draggable bounds to work
    height: '250px',
    width: '100%',
    //backgroundImage: `url({myImg})`,
  });

  return (
  <div ref={ref} css={timelineStyle} title="Timeline">
    <Scrubber timelineWidth={width}/>
    <div css={{height: '230px'}}>
      <Waveforms />
      <SegmentsList timelineWidth={width}/>
    </div>
  </div>
  );
};

/**
 * Displays and defines the current position in the video
 * @param param0
 */
const Scrubber: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)
  const activeSegmentIndex = useSelector(selectActiveSegmentIndex)  // For ARIA information display
  const segments = useSelector(selectSegments)                      // For ARIA information display

  // Init state variables
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,});
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [keyboardJumpDelta, setKeyboardJumpDelta] = useState(1000)  // In milliseconds. For keyboard navigation
  const wasCurrentlyAtRef = useRef(0)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    if(currentlyAt !== wasCurrentlyAtRef.current) {
      updateXPos();
      wasCurrentlyAtRef.current = currentlyAt;
    }
  })

  // Reposition scrubber when the timeline width changes
  useEffect(() => {
    if(currentlyAt && duration) {
      setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineWidth])

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

  // TODO: Better/more intuitive controls
  // TODO: Better increases and decreases than ten intervals
  // TODO: Additional helpful controls (e.g. jump to start/end of segment/next segment)
  const keyboardControls = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if(event.altKey) {
      switch (event.key) {
        case "j":
          // Left pressed
          dispatch(setCurrentlyAt(Math.max(currentlyAt - keyboardJumpDelta, 0)))
          break;
        case "l":
          // Right pressed
          dispatch(setCurrentlyAt(Math.min(currentlyAt + keyboardJumpDelta, duration)))
          break;
        case "i":
          // Up pressed
          setKeyboardJumpDelta(Math.min(keyboardJumpDelta * 10, 1000000))
          break;
        case "k":
          // Up pressed
          setKeyboardJumpDelta(Math.max(keyboardJumpDelta / 10, 1))
          break;
      }
    }
  }

  const scrubberStyle = css({
    backgroundColor: 'black',
    height: '250px',
    width: '1px',
    position: 'absolute' as 'absolute',
    zIndex: 2,
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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

  const arrowUpStyle = css({
    width: 0,
    height: 0,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderBottom: '7px solid black',
  })

  const arrowDownStyle = css({
    width: 0,
    height: 0,
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderTop: '7px solid black',
  })

  // const ariaLive = css({
  //   position: 'absolute',
  //   left: '-99999px',
  //   height: '1px',
  //   width: '1px',
  //   overflow: 'hidden',
  // })

  // // Possible TODO: Find a way to use ariaLive in a way that only the latest change is announced
  // const keyboardUpdateMessage = () => {
  //   return currentlyAt +  " Milliseconds"
  // }

  return (
    <Draggable
      //onDrag={onControlledDrag}
      onStart={onStartDrag}
      onStop={onStopDrag}
      axis="x"
      bounds="parent"
      position={controlledPosition}
      disabled={isPlaying}
      nodeRef={nodeRef}
      >
      <div ref={nodeRef} css={scrubberStyle} title="Scrubber">
        <div css={arrowDownStyle}></div>
        <div css= {scrubberDragHandleStyle} title="dragHandle" aria-grabbed={isGrabbed}
          aria-label={"Scrubber. " + convertMsToReadableString(currentlyAt) + ". Active segment: " + activeSegmentIndex + ". "
                      + (segments[activeSegmentIndex].deleted ? "Deleted." : "Alive.")
                      + ". Controls: Alt+j and Alt+k to move the scrubber. Alt+i and Alt+k to increase/decrase the move delta."}
          tabIndex={0} onKeyDown={keyboardControls}>
          <FontAwesomeIcon css={scrubberDragHandleIconStyle} icon={faBars} size="1x" />
          {/* <div css={ariaLive} aria-live="polite" aria-atomic="true">{keyboardUpdateMessage()}</div> */}
        </div>
        <div css={arrowUpStyle}></div>
      </div>
    </Draggable>
  );
};

/**
 * Container responsible for rendering the segments that are created when cutting
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
  const bgColor = (deleted: boolean, active: boolean) => {
    if (!deleted && !active) {
      return 'rgba(0, 0, 255, 0.4)'
    } else if (deleted && !active) {
      return `repeating-linear-gradient(
                -45deg,
                rgba(255, 45, 45, 0.4),
                rgba(255, 45, 45, 0.4) 10px,
                rgba(255, 0, 0, 0.4) 10px,
                rgba(255, 0, 0, 0.4) 20px);`
    } else if (!deleted && active) {
      return 'rgba(0, 0, 200, 0.4)'
    } else if (deleted && active) {
      return `repeating-linear-gradient(
                -45deg,
                rgba(200, 45, 45, 0.4),
                rgba(200, 45, 45, 0.4) 10px,
                rgba(200, 0, 0, 0.4) 10px,
                rgba(200, 0, 0, 0.4) 20px);`
    }
  }

  // Render the individual segments
  const renderedSegments = () => {
    return (
      segments.map( (segment: Segment, index: number) => (
        <div key={segment.id} title={"Segment " + index}
          aria-label={"Segment " + index + ". " + (segment.deleted ? "Deleted." : "Alive.")
                      +  " Start: " + convertMsToReadableString(segment.start)
                      + ". End: " + convertMsToReadableString(segment.end) + "."}
          tabIndex={0}
        css={{
          background: bgColor(segment.deleted, activeSegmentIndex === index),
          borderRadius: '5px',
          borderStyle: activeSegmentIndex === index ? 'dashed' : 'solid',
          borderColor: 'white',
          borderWidth: '1px',
          boxSizing: 'border-box',
          width: ((segment.end - segment.start) / duration) * 100 + '%',
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

/**
 * Generates waveform images and displays them
 */
const Waveforms: React.FC<{}> = () => {

  const videoURLs = useSelector(selectVideoURL)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);

  const waveformDisplayTestStyle = css({
    display: 'flex',
    flexDirection: 'column',
    position: "absolute" as "absolute",
    justifyContent: 'center',
    width: '100%',
    height: '230px',
    paddingTop: '10px',
  });

  // Update based on current fetching status
  const [images, setImages] = useState<string[]>([])

  // When the URLs to the videos are fetched, generate waveforms
  useEffect( () => {
    if (videoURLStatus === 'success') {
      const images: string[] = []    // Store local paths to image files
      let waveformsProcessed : number = 0  // Counter for checking if all workers are done

      // Only display the waveform of the first video we get
      const onlyOneURL = [videoURLs[0]]

      onlyOneURL.forEach((videoURL, _index, array) => {
        // Set up blob request
        var blob = null
        var xhr = new XMLHttpRequest()
        xhr.open("GET", videoURL)
        xhr.responseType = "blob"
        xhr.onload = function()
        {
          blob = xhr.response
          var file = new File([blob], blob)

          // Start waveform worker with blob
          const waveformWorker : any = new Waveform({type: 'img', width: '2000', height: '230', samples: 100000, media: file});
          // When done, save path to generated waveform img
          waveformWorker.oncomplete = function(image: any, numSamples: any) {
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


  const renderImages = () => {
    if (images) {
      return (
        images.map((image, index) =>
          <img key={index} alt='Waveform' src={image ? image : ""} css={{minHeight: 0}}></img>
        )
      );
    } else {
      return (
        <FontAwesomeIcon icon={faSpinner} spin size="3x"/>
      );
    }
  }

  return (
  <div css={waveformDisplayTestStyle} title="WaveformDisplayTest">
    {renderImages()}
  </div>
  );
}

export default Timeline;
