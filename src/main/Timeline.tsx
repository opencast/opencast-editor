import React, { useState, useRef, useEffect } from 'react'

import Draggable from 'react-draggable';

import { css } from '@emotion/react'

import { useSelector, useDispatch } from 'react-redux';
import { Segment, httpRequestState } from '../types'
import {
  selectSegments, selectActiveSegmentIndex, selectDuration, selectVideoURL,  selectWaveformImages, setWaveformImages
} from '../redux/videoSlice'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSpinner } from "@fortawesome/free-solid-svg-icons";

import useResizeObserver from "use-resize-observer";

import { Waveform } from '../util/waveform'
import { convertMsToReadableString } from '../util/utilityFunctions';
import { GlobalHotKeys } from 'react-hotkeys';
import { scrubberKeyMap } from '../globalKeys';

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { RootState } from '../redux/store';
import { selectTheme } from '../redux/themeSlice';
import { ThemedTooltip } from './Tooltip';

/**
 * A container for visualizing the cutting of the video, as well as for controlling
 * the current position in the video
 * Its width corresponds to the duration of the video
 * TODO: Figure out why ResizeObserver does not update anymore if we stop passing the width to the SegmentsList
 */
const Timeline: React.FC<{
  timelineHeight?: number,
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying:(state: RootState) => boolean,
  setClickTriggered: ActionCreatorWithPayload<any, string>,
  setCurrentlyAt: ActionCreatorWithPayload<number, string>,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  timelineHeight = 250,
  selectCurrentlyAt,
  selectIsPlaying,
  setClickTriggered,
  setCurrentlyAt,
  setIsPlaying
}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    height: timelineHeight + 'px',
    width: '100%',
  });

  // Update the current time based on the position clicked on the timeline
  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / width) * (duration)))
  }

  return (
  <div ref={ref} css={timelineStyle} onMouseDown={e => setCurrentlyAtToClick(e)}>
    <Scrubber
      timelineWidth={width}
      timelineHeight={timelineHeight}
      selectCurrentlyAt={selectCurrentlyAt}
      selectIsPlaying={selectIsPlaying}
      setCurrentlyAt={setCurrentlyAt}
      setIsPlaying={setIsPlaying}
    />
    <div css={{position: 'relative', height: timelineHeight - 20 + 'px'}} >
      <Waveforms timelineHeight={timelineHeight}/>
      <SegmentsList timelineWidth={width} timelineHeight={timelineHeight} styleByActiveSegment={true} tabable={true}/>
    </div>
  </div>
  );
};

/**
 * Displays and defines the current position in the video
 * @param param0
 */
export const Scrubber: React.FC<{
  timelineWidth: number,
  timelineHeight: number,
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying:(state: RootState) => boolean,
  setCurrentlyAt: ActionCreatorWithPayload<number, string>,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  timelineWidth,
  timelineHeight,
  selectCurrentlyAt,
  selectIsPlaying,
  setCurrentlyAt,
  setIsPlaying,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying)
  const currentlyAt = useSelector(selectCurrentlyAt)
  const duration = useSelector(selectDuration)
  const activeSegmentIndex = useSelector(selectActiveSegmentIndex)  // For ARIA information display
  const segments = useSelector(selectSegments)                      // For ARIA information display
  const theme = useSelector(selectTheme)

  // Init state variables
  const [controlledPosition, setControlledPosition] = useState({x: 0,y: 0,});
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [wasPlayingWhenGrabbed, setWasPlayingWhenGrabbed] = useState(false)
  const [keyboardJumpDelta, setKeyboardJumpDelta] = useState(1000)  // In milliseconds. For keyboard navigation
  const wasCurrentlyAtRef = useRef(0)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    if(currentlyAt !== wasCurrentlyAtRef.current && !isGrabbed) {
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
  const onControlledDrag = (e: any, position: any) => {
    // Update position
    const {x} = position
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)))
  };

  // Callback for when the position changes by something other than dragging
  const updateXPos = () => {
    setControlledPosition({x: (currentlyAt / duration) * (timelineWidth), y: 0});
  };

  const onStartDrag = () => {
    setIsGrabbed(true)

    // Halt video playback
    if (isPlaying) {
      setWasPlayingWhenGrabbed(true)
      dispatch(setIsPlaying(false))
    } else {
      setWasPlayingWhenGrabbed(false)
    }
  }

  const onStopDrag = (e: any, position: any) => {
    // Update position
    const {x} = position;
    setControlledPosition({x, y: 0});
    dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));

    setIsGrabbed(false)
    // Resume video playback
    if (wasPlayingWhenGrabbed) {
      dispatch(setIsPlaying(true))
    }
  }

  // Callbacks for keyboard controls
  // TODO: Better increases and decreases than ten intervals
  // TODO: Additional helpful controls (e.g. jump to start/end of segment/next segment)
  const handlers = {
    left: () => dispatch(setCurrentlyAt(Math.max(currentlyAt - keyboardJumpDelta, 0))),
    right: () => dispatch(setCurrentlyAt(Math.min(currentlyAt + keyboardJumpDelta, duration))),
    increase: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.min(keyboardJumpDelta * 10, 1000000)),
    decrease: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.max(keyboardJumpDelta / 10, 1))
  }

  const scrubberStyle = css({
    backgroundColor: `${theme.text}`,
    height: timelineHeight - 10 + 'px', //    TODO: CHECK IF height: '100%',
    width: '1px',
    position: 'absolute',
    zIndex: 2,
    boxShadow: `${theme.boxShadow}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    outline: `${theme.scrubber}`,
  });

  const scrubberDragHandleStyle = css({
    // Base style
    background: `${theme.text}`,
    display: "inline-block",
    height: "10px",
    position: "relative",
    width: "20px",
    "&:after": {
      borderTop: `10px solid ${theme.text}`,
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      content: '""',
      height: 0,
      left: 0,
      position: "absolute",
      top: "10px",
      width: 0,
    },
    // Animation
    cursor: isGrabbed ? "grabbing" : "grab",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:focus": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  })

  const scrubberDragHandleIconStyle = css({
    transform: 'scaleY(0.7) rotate(90deg)',
    paddingRight: '5px',
    color: `${theme.background}`,
  })

  // // Possible TODO: Find a way to use ariaLive in a way that only the latest change is announced
  // const keyboardUpdateMessage = () => {
  //   return currentlyAt +  " Milliseconds"
  // }

  return (
    <GlobalHotKeys keyMap={scrubberKeyMap} handlers={handlers} allowChanges={true}>
      <Draggable
        onDrag={onControlledDrag}
        onStart={onStartDrag}
        onStop={onStopDrag}
        axis="x"
        bounds="parent"
        position={controlledPosition}
        nodeRef={nodeRef}
        >
          <div ref={nodeRef} css={scrubberStyle}>

            <div css={scrubberDragHandleStyle} aria-grabbed={isGrabbed}
              aria-label={t("timeline.scrubber-text-aria",
                         {currentTime: convertMsToReadableString(currentlyAt), segment: activeSegmentIndex,
                          segmentStatus: (segments[activeSegmentIndex].deleted ? "Deleted" : "Alive"),
                          moveLeft: scrubberKeyMap[handlers.left.name],
                          moveRight: scrubberKeyMap[handlers.right.name],
                          increase: scrubberKeyMap[handlers.increase.name],
                          decrease: scrubberKeyMap[handlers.decrease.name] })}
              tabIndex={0}>
              <FontAwesomeIcon css={scrubberDragHandleIconStyle} icon={faBars} size="1x" />
            </div>
          </div>
      </Draggable>
    </GlobalHotKeys>
  );
};

/**
 * Container responsible for rendering the segments that are created when cutting
 */
export const SegmentsList: React.FC<{
  timelineWidth: number,
  timelineHeight: number,
  styleByActiveSegment: boolean,
  tabable: boolean,
}> = ({
  timelineWidth,
  timelineHeight,
  styleByActiveSegment = true,
  tabable = true,
}) => {

  const { t } = useTranslation();

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
        <ThemedTooltip title={t("timeline.segment-tooltip", {segment: index})}>
          <div key={segment.id}
            aria-label={t("timeline.segments-text-aria",
                      {segment: index,
                        segmentStatus: (segment.deleted ? "Deleted" : "Alive"),
                        start: convertMsToReadableString(segment.start),
                        end: convertMsToReadableString(segment.end) })}
            tabIndex={tabable ? 0 : -1}
          css={{
            background: bgColor(segment.deleted, styleByActiveSegment ? activeSegmentIndex === index : false),
            borderRadius: '5px',
            borderStyle: styleByActiveSegment ? (activeSegmentIndex === index ? 'dashed' : 'solid') : 'solid',
            borderColor: 'white',
            borderWidth: '1px',
            boxSizing: 'border-box',
            width: ((segment.end - segment.start) / duration) * 100 + '%',
            height: timelineHeight - 20 + 'px',     // CHECK IF 100%
            zIndex: 1,
          }}>
          </div>
        </ThemedTooltip>
      ))
    );
  }

  const segmentsStyle = css({
    display: 'flex',
    flexDirection: 'row',
    paddingTop: '10px',
    height: '100%',
  })

  return (
    <div css={segmentsStyle}>
      {renderedSegments()}
    </div>
  );
};

/**
 * Generates waveform images and displays them
 */
export const Waveforms: React.FC<{timelineHeight: number}> = ({timelineHeight}) => {

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const videoURLs = useSelector(selectVideoURL)
  const videoURLStatus = useSelector((state: { videoState: { status: httpRequestState["status"] } }) => state.videoState.status);
  const theme = useSelector(selectTheme);

  // Update based on current fetching status
  const images = useSelector(selectWaveformImages)
  const [waveformWorkerError, setWaveformWorkerError] = useState<boolean>(false)

  const waveformDisplayTestStyle = css({
    display: 'flex',
    flexDirection: 'column',
    position: "absolute" as "absolute",
    justifyContent: 'center',
    ...(images.length <= 0) && {alignItems: 'center'},  // Only center during loading
    width: '100%',
    height: timelineHeight - 20 + 'px',   // CHECK IF     height: '100%',
    paddingTop: '10px',
    filter: `${theme.invert_wave}`,
    color: `${theme.inverted_text}`,
  });

  const waveformStyle = css({
    background: `${theme.waveform_bg}`,
    filter: `${theme.waveform_filter}`,
    borderRadius: '5px',
  });

  // When the URLs to the videos are fetched, generate waveforms
  useEffect( () => {
    if (videoURLStatus === 'success') {
      if (images.length > 0) {
        return
      }

      const newImages: string[] = []    // Store local paths to image files
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
          const waveformWorker : any = new Waveform({type: 'img', width: '2000', height: '230', samples: 100000, media: file})

          waveformWorker.onerror = function(error: string) {
            setWaveformWorkerError(true)
            console.log("Waveform could not be generated:" + error)
          }

          // When done, save path to generated waveform img
          waveformWorker.oncomplete = function(image: any, numSamples: any) {
            newImages.push(image)
            waveformsProcessed++
            // If all images are generated, rerender
            if (waveformsProcessed === array.length) {
              dispatch(setWaveformImages(newImages))
            }
          }
        }

        xhr.send()
      })
    }
  }, [dispatch, images, videoURLStatus, videoURLs]);


  const renderImages = () => {
    if (images.length > 0) {
      return (
        <img alt='Waveform' src={images[0]} css={[waveformStyle, {minHeight: 0, height: '100%'}]}></img>
        // images.map((image, index) =>
        //   <img key={index} alt='Waveform' src={image ? image : ""} css={{minHeight: 0}}></img>
        // )
      );
    } else if (waveformWorkerError) {
      return (
        // Display a flatline
        <div css={{width: '100%'}}><hr/></div>
      );
    }
    else {
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} spin size="3x"/>
          <div>{t("timeline.generateWaveform-text")}</div>
        </>
      );
    }
  }

  return (
  <div css={waveformDisplayTestStyle}>
    {renderImages()}
  </div>
  );
}

export default Timeline;
