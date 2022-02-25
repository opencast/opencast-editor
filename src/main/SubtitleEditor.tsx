import React, { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { SegmentsList as CuttingSegmentsList, Waveforms } from "./Timeline";
import ReactPlayer from "react-player";
import { basicButtonStyle } from "../cssStyles";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectCurrentlyAt,
  selectDummyData,
  selectIsPlaying,
  setClickTriggered,
  setCurrentlyAt,
  setDummySegment,
  setIsPlaying,
} from '../redux/subtitleSlice'
import { useDispatch, useSelector } from "react-redux";
import useResizeObserver from "use-resize-observer";
import { selectDuration } from "../redux/videoSlice";
import { RootState } from "../redux/store";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { setIsDisplayEditView } from "../redux/subtitleSlice";
import Draggable from "react-draggable";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
 const SubtitleEditor : React.FC<{}> = () => {

  const subtitleEditorStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    width: '100%'
  })

  const subAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '50%',
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

  return (
    <div css={subtitleEditorStyle}>
      <div css={headerRowStyle}>
        <BackButton />
        <div css={[titleStyle, titleStyleBold]}>
          Subtitle Editor - [Language Name]
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
    </div>
  );
}

const SubtitleListEditor : React.FC<{}> = () => {

  const listStyle = css({
    backgroundColor: 'red',
    height: '100%',
    width: '60%',
  })

  return (
    <div css={listStyle}>
      List View
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
  const refTop = useRef<HTMLDivElement>(null);

  const timelineCutoutInMs = 10000

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    height: '220px',
    width: (duration / timelineCutoutInMs) * 100 + '%'
  });

  // Update the current time based on the position clicked on the timeline
  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log("Set currently at")
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / width) * (duration)))
  }

  // Apply horizonal scrolling when scrolled from somewhere else
  useEffect(() => {
    if (currentlyAt !== undefined && refTop.current) {
      refTop.current.scrollTo(((currentlyAt / duration)) * refTop.current.scrollWidth, 0)
    }
  }, [currentlyAt, duration, width]);

  return (
    <div css={{width: '100%', height: '230px'}}>
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
            <div
              css={{position: 'absolute', width: '2px', height: '100%', ...(refTop.current) && {left: (refTop.current.clientWidth / 2) + ((currentlyAt / duration)) * refTop.current.scrollWidth}, top: '10px', background: 'black'}}
            />
            <Waveforms />
            <CuttingSegmentsList timelineWidth={width}/>
          </div>

        </div>

      </div>
      <div
        title="Mini Timeline"
        onMouseDown={e => setCurrentlyAtToClick(e)}
        css={{position: 'relative', width: '100%', height: '15px', background: 'lightgrey'}}
      >
        <div
          css={{position: 'absolute', width: '2px', height: '100%', left: (currentlyAt / duration) * (width), top: 0, background: 'black'}}
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

export default SubtitleEditor;
