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
      nodeRef={nodeRef}
      >
      <div ref={nodeRef} css={scrubberStyle} title="Scrubber">
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
  const bgColor = (deleted: boolean, index: boolean) => {
    if (!deleted && !index) {
      return 'rgba(0, 0, 255, 0.4)'
    } else if (deleted && !index) {
      return 'rgba(255, 0, 0, 0.4)'
    } else if (!deleted && index) {
      return 'rgba(0, 0, 200, 0.4)'
    } else if (deleted && index) {
      return 'rgba(200, 0, 0, 0.4)'
    }
  }

  // Render the individual segments
  const renderedSegments = () => {
    return (
      segments.map( (segment: Segment, index: number) => (
        <div key={segment.id} title="Segment" css={{
          backgroundColor: bgColor(segment.deleted, activeSegmentIndex === index),//segment.state === "alive" ? 'rgba(0, 0, 255, 0.4)' : 'rgba(255, 0, 0, 0.4)',
          borderRadius: '5px',
          borderStyle: 'solid',
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


  const renderImages = () => {
    if (images) {
      return (
        images.map(image =>
          <img alt='Waveform' src={image ? image : ""} css={{minHeight: 0}}></img>
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
