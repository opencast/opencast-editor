import React, { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { SegmentsList as CuttingSegmentsList, Waveforms } from "./Timeline";
import ReactPlayer from "react-player";
import { basicButtonStyle } from "../cssStyles";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectCaptions,
} from '../redux/videoSlice'
import { useDispatch, useSelector } from "react-redux";
import { fetchSubtitle, resetRequestState, selectGetError, selectGetStatus, selectSelectedSubtitleByFlavor, selectSelectedSubtitleFlavor, setSubtitle } from "../redux/subtitleSlice";
import { Track } from "../types";
import SubtitleListEditor from "./SubtitleListEditor";
import {
  setIsDisplayEditView,
  selectCurrentlyAt,
  selectDummyData,
  selectIsPlaying,
  setClickTriggered,
  setCurrentlyAt,
  setDummySegment,
  setIsPlaying,
} from '../redux/subtitleSlice'
import useResizeObserver from "use-resize-observer";
import { selectDuration } from "../redux/videoSlice";
import { RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import Draggable from "react-draggable";
import { settings } from "../config";

/**
 * Displays an editor view for a selected subtitle file
 */
 const SubtitleEditor : React.FC<{}> = () => {

  const dispatch = useDispatch()
  const getStatus = useSelector(selectGetStatus)
  const getError = useSelector(selectGetError)
  const captionTracks = useSelector(selectCaptions) // track objects received from Opencast
  const subtitle = useSelector(selectSelectedSubtitleByFlavor)

  // let selectedFlavorSubtype = "source+en"
  const selectedFlavorSubtype = useSelector(selectSelectedSubtitleFlavor)
  let captionTrack: Track | undefined = undefined   // track object received from Opencast

  // If subtitle is not in our redux store, dynamically fetch it
  // First, Get the correct captions url
  // TODO: Turn this into a redux selector, possibly by figuring out "currying"
  if (subtitle === undefined) {
    for (const cap of captionTracks) {
      if (cap.flavor.subtype === selectedFlavorSubtype) {
        captionTrack = cap
      }
    }
  }

  useEffect(() => {
    // Instigate fetching caption data from Opencast
    if (getStatus === 'idle' && subtitle === undefined && captionTrack !== undefined && selectedFlavorSubtype) {
      dispatch(fetchSubtitle({identifier: selectedFlavorSubtype, uri: captionTrack.uri}))
    // Or create a new subtitle instead
    } else if (getStatus === 'idle' && subtitle === undefined && captionTrack === undefined && selectedFlavorSubtype) {
      // Create an empty subtitle
      dispatch(setSubtitle({identifier: selectedFlavorSubtype, subtitle: []}))
      // Reset request
      dispatch(resetRequestState())
    // Error while fetching
    } else if (getStatus === 'failed') {
      // TODO: Smart error handling
      // dispatch(setError({error: true, errorMessage: t("video.comError-text"), errorDetails: error}))
      // Reset request
      dispatch(resetRequestState())
    } else if (getStatus === 'success') {
      // Reset request
      dispatch(resetRequestState())
    }
  }, [getStatus, dispatch, captionTrack, subtitle, selectedFlavorSubtype])


  const getTitle = () => {
    return (settings.subtitles.languages !== undefined && subtitle && subtitle.identifier) ? settings.subtitles.languages[subtitle?.identifier] : "Loading"
  }

  const subtitleEditorStyle = css({
    display: 'block',
    paddingRight: '20px',
    paddingLeft: '20px',
    gap: '20px',
    height: '100%',
  })

  const headerRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '5%',
  })

  const subAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '75%',
    width: '100%',
  })

  const videoPlayerAreaStyle = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '40%',
  });

  // Taken from VideoHeader. Maybe generalize this to cssStyles.tsx
  const titleStyle = css({
    display: 'inline-block',
    padding: '15px',
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    maxWidth: '500px',
  })

  const titleStyleBold = css({
    fontWeight: 'bold',
    fontSize: '24px',
    verticalAlign: '-2.5px',
  })

  const render = () => {
    if (getError !== undefined) {
      return (
        <span>{"Subtitle Parsing Error(s): " + getError}</span>
      )
    } else {
      return(
        <>
          <div>
            {subtitle?.subtitles.map((cue: any, index: number) =>
              <span key={index}>{cue.text}</span>
            )}
          </div>
          <div css={headerRowStyle}>
            <BackButton />
            <div css={[titleStyle, titleStyleBold]}>
              {"Subtitle Editor - " + getTitle()}
            </div>
            <div css={{width: '50px'}}></div>
          </div>
          <div css={subAreaStyle}>
            <SubtitleListEditor />
            <div css={videoPlayerAreaStyle}>
              <SubtitleVideoPlayer />
            </div>
          </div>
          <SubtitleTimeline
            selectIsPlaying={selectIsPlaying}
            selectCurrentlyAt={selectCurrentlyAt}
            setIsPlaying={setIsPlaying}
            setCurrentlyAt={setCurrentlyAt}
            setClickTriggered={setClickTriggered}
          />
        </>
      )
    }
  }

  return (
    <div css={subtitleEditorStyle}>
      {render()}
    </div>
  );
}

const SubtitleVideoPlayer : React.FC<{}> = () => {

  const url = "https://data.lkiesow.io/opencast/test-media/goat.mp4"

  const playerWrapper = css({
    position: 'relative',
    width: '100%',
    paddingTop: '50%',
  });

  const reactPlayerStyle = css({
    position: 'absolute',
    top: 0,
    left: 0,
  })

  const render = () => {
    return(
      <div css={playerWrapper}>
        <ReactPlayer url={url}
          css={reactPlayerStyle}
          controls={true}
          // ref={ref}
          width='100%'
          height='100%'
          // playing={isPlaying}
          // muted={!isPrimary}
          // onProgress={onProgressCallback}
          progressInterval={100}
          // onReady={onReadyCallback}
          // onEnded={onEndedCallback}
          // onError={onErrorCallback}
          tabIndex={-1}
          // config={playerConfig}
          // disablePictureInPicture
        />
      </div>
    );
  }

  return (
    <>
      {render()}
    </>
  );
}

/**
 * Copy-paste of the timeline in Video.tsx, so that we can make some small adjustments,
 * like adding in a list of subtitle segments
 */
const SubtitleTimeline: React.FC<{
  selectCurrentlyAt: (state: RootState) => number,
  selectIsPlaying:(state: RootState) => boolean,
  setClickTriggered: ActionCreatorWithPayload<any, string>,
  setCurrentlyAt: ActionCreatorWithPayload<number, string>,
  setIsPlaying: ActionCreatorWithPayload<boolean, string>,
}> = ({
  selectCurrentlyAt,
  selectIsPlaying,
  setClickTriggered,
  setCurrentlyAt,
  setIsPlaying
}) => {

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)
  const currentlyAt = useSelector(selectCurrentlyAt)

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();
  const { ref: refMini, width: widthMiniTimeline = 1, } = useResizeObserver<HTMLDivElement>();
  const refTop = useRef<HTMLDivElement>(null);

  const timelineCutoutInMs = 10000    // How much of the timeline should be visible in milliseconds. Aka a specific zoom level

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    height: '220px',
    width: (duration / timelineCutoutInMs) * 100 + '%'    // Total length of timeline based on number of cutouts
  });

  // Update the current time based on the position clicked on the miniTimeline
  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / widthMiniTimeline) * (duration)))
  }

  // Apply horizonal scrolling when scrolled from somewhere else
  useEffect(() => {
    if (currentlyAt !== undefined && refTop.current) {
      refTop.current.scrollTo(((currentlyAt / duration)) * refTop.current.scrollWidth, 0)
    }
  }, [currentlyAt, duration, width]);

  // draws a triangle on top of the middle line
  const triangleStyle = css({
    width: 0,
    height: 0,
    left: '-19px',
    borderLeft: '20px solid transparent',
    borderRight: '20px solid transparent',
    position: "relative",
    borderTop: '20px solid black',
  })

  return (
    <div css={{position: 'relative', width: '100%', height: '230px'}}>
      {/* Sits smack dab in the middle and does not move */}
      <div
        css={{position: 'absolute',
        width: '2px',
        height: '190px',
        ...(refTop.current) && {left: (refTop.current.clientWidth / 2)},
        top: '10px',
        background: 'black'}}>
          <div css={triangleStyle} />
      </div>
      {/* Scrollable timeline */}
      <div ref={refTop} css={{overflow: 'hidden', width: '100%', height: '100%'}}>
        <div ref={ref} css={timelineStyle} title="Timeline"
          // onMouseDown={e => setCurrentlyAtToClick(e)}
        >
          {/* <Scrubber
            timelineWidth={width}
            selectCurrentlyAt={selectCurrentlyAt}
            selectIsPlaying={selectIsPlaying}
            setCurrentlyAt={setCurrentlyAt}
            setIsPlaying={setIsPlaying}
          /> */}
          <div css={{height: '10px'}} />    {/* Fake padding. TODO: Figure out a better way to pad absolutely positioned elements*/}
          <TimelineSubtitleSegmentsList timelineWidth={width}/>
          <div css={{position: 'relative', height: '100px'}} >
            <Waveforms />
            <CuttingSegmentsList timelineWidth={width}/>
          </div>
        </div>
      </div>
      {/* Mini Timeline. Makes it easier to understand position in scrollable timeline */}
      <div
        title="Mini Timeline"
        onMouseDown={e => setCurrentlyAtToClick(e)}
        css={{position: 'relative', width: '100%', height: '15px', background: 'lightgrey'}}
        ref={refMini}
      >
        <div
          css={{position: 'absolute', width: '2px', height: '100%', left: (currentlyAt / duration) * (widthMiniTimeline), top: 0, background: 'black'}}
        >
        </div>
      </div>
    </div>
  );
};


/**
 * Displays subtitle segments as a row of boxes
 */
const TimelineSubtitleSegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  const dummyData = useSelector(selectDummyData)

  const segmentsListStyle = css({
    position: 'relative',
    width: '100%',
    height: '80px',
    overflow: 'hidden',
  })

  return (
    <div css={segmentsListStyle}>
      {dummyData.map((item, i) => {
        return (
          <TimelineSubtitleSegment timelineWidth={timelineWidth} textInit={item[0]} startInit={item[1]} endInit={item[2]} key={i} index={i}/>
        )
      })}
    </div>
  );

}

/**
 * A single segments for the timeline subtitle segments list
 */
const TimelineSubtitleSegment: React.FC<{timelineWidth: number, textInit: string, startInit: number, endInit: number, index: number}> = ({timelineWidth, textInit, startInit, endInit, index}) => {

  const dispatch = useDispatch()
  const duration = useSelector(selectDuration)
  const [controlledPosition, setControlledPosition] = useState({x: 0, y: 0})
  const [isGrabbed, setIsGrabbed] = useState(false)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  // Callback for when the scrubber gets dragged by the user
  const onControlledDrag = (e: any, position: any) => {
    // Update position
    const {x} = position
    dispatch(setDummySegment({
      index: index,
      text: textInit,
      start: (x / timelineWidth) * (duration),
      end: (x / timelineWidth) * (duration) + (endInit - startInit),
    }))
  }

  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    // if(currentlyAt !== wasCurrentlyAtRef.current && !isGrabbed) {
      // updateXPos();
      setControlledPosition({x: (startInit / duration) * (timelineWidth), y: 0});
      // wasCurrentlyAtRef.current = currentlyAt;
    // }
  },[duration, startInit, timelineWidth])

  const onStartDrag = () => {
    setIsGrabbed(true)

    // // Halt video playback
    // if (isPlaying) {
    //   setWasPlayingWhenGrabbed(true)
    //   dispatch(setIsPlaying(false))
    // } else {
    //   setWasPlayingWhenGrabbed(false)
    // }
  }
  const onStopDrag = (e: any, position: any) => {
    // // Update position
    // const {x} = position;
    // setControlledPosition({x, y: 0});
    // dispatch(setCurrentlyAt((x / timelineWidth) * (duration)));

    setIsGrabbed(false)
    // // Resume video playback
    // if (wasPlayingWhenGrabbed) {
    //   dispatch(setIsPlaying(true))
    // }
  }

  const segmentStyle = css({
    // Use absolute positioning to allow for overlap
    position: 'absolute',
    // top: 0,
    // left: (startInit / duration) * 100 + '%',
    height: '100%',
    width: ((endInit - startInit) / duration) * 100 + '%',

    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '5px',
    borderStyle: 'solid',
    borderColor: 'dark-grey',
    borderWidth: '1px',
    boxSizing: 'border-box',
    zIndex: 1,

    cursor: isGrabbed ? "grabbing" : "grab",

    // Center text
    display: 'flex',
    alignItems: 'center',
  })

  const textStyle = css({
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    padding: '2px',
    color: 'white',
  })

  return (
    <Draggable
      onDrag={onControlledDrag}
      onStart={onStartDrag}
      onStop={onStopDrag}
      axis="x"
      bounds="parent"
      position={controlledPosition}
      // defaultPosition={{x: (startInit / duration) * (timelineWidth), y: 0}}
      nodeRef={nodeRef}
      >
        <div ref={nodeRef} css={segmentStyle}>
          <span css={textStyle}>{textInit}</span>
        </div>
    </Draggable>
  );
}


/**
 * Takes you to a different page
 */
 export const BackButton : React.FC<{}> = () => {

  const dispatch = useDispatch();

  const backButtonStyle = css({
    width: '50px',
    height: '10px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, backButtonStyle]}
      role="button" tabIndex={0}
      onClick={ () => dispatch(setIsDisplayEditView(false)) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        dispatch(setIsDisplayEditView(false))
      }}}>
      <FontAwesomeIcon icon={faChevronLeft} size="1x" />
      <span>{"Back"}</span>
    </div>
  );
}

export default SubtitleEditor
