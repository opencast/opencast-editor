import React, { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { SegmentsList as CuttingSegmentsList, Waveforms } from "./Timeline";
import {
  selectCurrentlyAt,
  selectSelectedSubtitleByFlavor,
  selectSelectedSubtitleFlavor,
  setClickTriggered,
  setCueAtIndex,
  setCurrentlyAt,
  setFocusSegmentId,
  setFocusSegmentTriggered,
  setFocusSegmentTriggered2,
} from '../redux/subtitleSlice'
import { useDispatch, useSelector } from "react-redux";
import useResizeObserver from "use-resize-observer";
import { selectDuration } from "../redux/videoSlice";
import Draggable, { DraggableEvent } from "react-draggable";
import { SubtitleCue } from "../types";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { GlobalHotKeys } from "react-hotkeys";
import { scrubberKeyMap } from "../globalKeys";
import ScrollContainer, { ScrollEvent } from "react-indiana-drag-scroll";
import { selectTheme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";
import { useTranslation } from "react-i18next";

/**
 * Copy-paste of the timeline in Video.tsx, so that we can make some small adjustments,
 * like adding in a list of subtitle segments
 */
 const SubtitleTimeline: React.FC<{}> = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  // Init redux variables
  const dispatch = useDispatch();
  const duration = useSelector(selectDuration)
  const currentlyAt = useSelector(selectCurrentlyAt)

  const { ref, width = 1, } = useResizeObserver<HTMLDivElement>();
  const refTop = useRef<HTMLElement>(null);
  const { ref: refMini, width: widthMiniTimeline = 1, } = useResizeObserver<HTMLDivElement>();

  const timelineCutoutInMs = 10000    // How much of the timeline should be visible in milliseconds. Aka a specific zoom level

  const timelineStyle = css({
    position: 'relative',     // Need to set position for Draggable bounds to work
    width: ((duration / timelineCutoutInMs)) * 100 + '%',    // Total length of timeline based on number of cutouts
    paddingLeft: '50%',
    paddingRight: '50%',
  });

  const setCurrentlyAtToClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let rect = e.currentTarget.getBoundingClientRect()
    let offsetX = e.clientX - rect.left
    dispatch(setClickTriggered(true))
    dispatch(setCurrentlyAt((offsetX / widthMiniTimeline) * (duration)))
  }

  // Apply horizonal scrolling when scrolled from somewhere else
  useEffect(() => {
    if (currentlyAt !== undefined && refTop.current) {
      const scrollLeftMax = (refTop.current.scrollWidth - refTop.current.clientWidth)
      refTop.current.scrollTo(Math.round((currentlyAt / duration) * scrollLeftMax), 0)
    }
  }, [currentlyAt, duration, width]);

  const [keyboardJumpDelta, setKeyboardJumpDelta] = useState(1000)  // In milliseconds. For keyboard navigation

  // Callbacks for keyboard controls
  // TODO: Better increases and decreases than ten intervals
  // TODO: Additional helpful controls (e.g. jump to start/end of segment/next segment)
  const handlers = {
    left: () => dispatch(setCurrentlyAt(Math.max(currentlyAt - keyboardJumpDelta, 0))),
    right: () => dispatch(setCurrentlyAt(Math.min(currentlyAt + keyboardJumpDelta, duration))),
    increase: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.min(keyboardJumpDelta * 10, 1000000)),
    decrease: () => setKeyboardJumpDelta(keyboardJumpDelta => Math.max(keyboardJumpDelta / 10, 1))
  }

  // Callback for the scroll container
  const onEndScroll = (e: ScrollEvent) => {
    // If scrolled by user
    if (!e.external && refTop && refTop.current) {
      const offsetX = refTop.current.scrollLeft
      const scrollLeftMax = (refTop.current.scrollWidth - refTop.current.clientWidth)
      dispatch(setCurrentlyAt((offsetX / scrollLeftMax) * (duration)))
    }
  }

  return (
    <div css={{position: 'relative', width: '100%', height: '250px'}}>
      {/* "Scrubber". Sits smack dab in the middle and does not move */}
      <div
        css={{
          position: 'absolute',
          width: '2px',
          height: '190px',
          ...(refTop.current) && {left: (refTop.current.clientWidth / 2)},
          top: '10px',
          background: `${theme.text}`,
          zIndex: 100,
        }}
      />
      {/* Scrollable timeline container. Has width of parent*/}
      <ScrollContainer innerRef={refTop} css={{overflow: 'hidden', width: '100%', height: '215px'}}
        vertical={false}
        horizontal={true}
        onEndScroll={onEndScroll}
        ignoreElements={"#no-scrolling"}  // dom elements with this id in the container will not trigger scrolling when dragged
      >
        {/* Container. Overflows. Width based on parent times zoom level*/}
        <div ref={ref} css={timelineStyle}>
          <div css={{height: '10px'}} />    {/* Fake padding. TODO: Figure out a better way to pad absolutely positioned elements*/}
          <TimelineSubtitleSegmentsList timelineWidth={width}/>
          <div css={{position: 'relative', height: '100px'}} >
            <Waveforms timelineHeight={120}/>
            <CuttingSegmentsList timelineWidth={width} timelineHeight={120} styleByActiveSegment={false} tabable={false}/>
          </div>
        </div>
      </ScrollContainer>
      {/* Mini Timeline. Makes it easier to understand position in scrollable timeline */}
      <GlobalHotKeys keyMap={scrubberKeyMap} handlers={handlers} allowChanges={true}>
        <ThemedTooltip title={t('subtitleTimeline.overviewTimelineTooltip')}>
          <div
            onMouseDown={e => setCurrentlyAtToClick(e)}
            css={{
              position: 'relative',
              width: '100%',
              height: '15px',
              background: `linear-gradient(to right, grey ${(currentlyAt / duration) * 100}%, lightgrey ${(currentlyAt / duration) * 100}%)`,
              borderRadius: '3px',
            }}
            ref={refMini}
          >
            <div
              css={{position: 'absolute', width: '2px', height: '100%', left: (currentlyAt / duration) * (widthMiniTimeline), top: 0, background: 'black'}}
            />
          </div>
        </ThemedTooltip>
      </GlobalHotKeys>
    </div>



    // <div className="layoutRoot absoluteLayout">
    //   {/* <Example /> */}
    //   <Example2 />
    //   {/* <TimelineSubtitleSegment
    //   timelineWidth={width}
    //   cue={{id: '42', text:"HI", startTime: 1000, endTime: 5000, tree:{children: [{type: "", value: ""}]}}}
    //   index={0}
    //   height={80}
    //   /> */}
    // </div>
  );
};


/**
 * Displays subtitle segments as a row of boxes
 */
const TimelineSubtitleSegmentsList: React.FC<{timelineWidth: number}> = ({timelineWidth}) => {

  const arbitraryHeight = 80
  const subtitle = useSelector(selectSelectedSubtitleByFlavor)

  const segmentsListStyle = css({
    position: 'relative',
    width: '100%',
    height: `${arbitraryHeight}px`,
    overflow: 'hidden',
  })

  return (
    <div css={segmentsListStyle}>
      {subtitle?.map((item, i) => {
        return (
          <TimelineSubtitleSegment timelineWidth={timelineWidth} cue={item} height={arbitraryHeight} key={item.idInternal} index={i}/>
        )
      })}
    </div>
  );
}

/**
 * A single segments for the timeline subtitle segments list
 */
const TimelineSubtitleSegment: React.FC<{
  timelineWidth: number,
  cue: SubtitleCue,
  index: number,
  height: number
}> = React.memo(props => {

  // Redux
  const dispatch = useDispatch()
  const selectedFlavor = useSelector(selectSelectedSubtitleFlavor)
  const duration = useSelector(selectDuration)

  // Dimensions and position offsets in px. Required for resizing
  const [absoluteWidth, setAbsoluteWidth] = useState(0)
  const [absoluteHeight, setAbsoluteHeight] = useState(0)
  const [absoluteLeft, setAbsoluteLeft] = useState(0)
  const [absoluteTop, setAbsoluteTop] = useState(0)

  const [controlledPosition, setControlledPosition] = useState({x: 0, y: 0})
  const [isGrabbed, setIsGrabbed] = useState(false)
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  const theme = useSelector(selectTheme);
  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    setControlledPosition({x: (props.cue.startTime / duration) * (props.timelineWidth), y: 0});
  },[props.cue.startTime, duration, props.timelineWidth])

  // Set width and reset any resizing that may have happened meanwhile
  useEffect(() => {
    setAbsoluteWidth(((props.cue.endTime - props.cue.startTime) / duration) * props.timelineWidth)
    setAbsoluteHeight(props.height)
    setAbsoluteLeft(0)
    setAbsoluteTop(0)
  },[duration, props.cue.endTime, props.cue.startTime, props.height, props.timelineWidth])

  // Check for impossible timestamps and update state in redux
  const dispatchNewTimes = (newStartTime: number, newEndTime: number) => {
    if (newStartTime < 0) {
      newStartTime = 0
    }
    if (newEndTime < newStartTime) {
      newEndTime = newStartTime
    }

    dispatch(setCueAtIndex({
      identifier: selectedFlavor,
      cueIndex: props.index,
      newCue: {
        id: props.cue.id,
        idInternal: props.cue.idInternal,
        text: props.cue.text,
        startTime: newStartTime,
        endTime: newEndTime,
        tree: props.cue.tree
      }
    }))
  }

  // Resizable does not support resizing in the west/north directions out of the box,
  // so additional calculations are necessary.
  // Adapted from Resizable example code
  const onResizeAbsolute = (event: any, {element, size, handle}: any) => {
    // Possible TODO: Find a way to stop resizing a segment beyond 0ms here instead of later
    let newLeft = absoluteLeft;
    let newTop = absoluteTop;
    const deltaHeight = size.height - absoluteHeight;
    const deltaWidth = size.width - absoluteWidth;
    if (handle[0] === 'n') {
      newTop -= deltaHeight;
    } else if (handle[0] === 's') {
      newTop += deltaHeight;
    }
    if (handle[handle.length - 1] === 'w') {
      newLeft -= deltaWidth;
    } else if (handle[handle.length - 1] === 'e') {
      newLeft += deltaWidth;
    }

    setAbsoluteWidth(size.width)
    setAbsoluteHeight(size.height)
    setAbsoluteLeft(newLeft)
    setAbsoluteTop(newTop)
  };

  // Update redux state based on the resize
  const onResizeStop = (event: any, {element, size, handle}: any) => {
    // Calc new width, factoring in offset
    const newWidth = absoluteWidth

    const newSegmentDuration = (newWidth / props.timelineWidth) * duration
    const timeDiff = (props.cue.endTime - props.cue.startTime) - newSegmentDuration

    let newStartTime = props.cue.startTime
    let newEndTime = props.cue.endTime
    // if handle === left, update startTime
    if (handle === 'w') {
      newStartTime = props.cue.startTime + timeDiff
    }
    // if handle === right, update endTime
    if (handle === 'e') {
      newEndTime = props.cue.endTime + timeDiff
    }

    dispatchNewTimes(newStartTime, newEndTime)

    // Reset resizing
    // Required when resizing beyond 0 multiple times,
    // because the time does not change, so the reset in useEffect does not trigger
    setAbsoluteWidth(((props.cue.endTime - props.cue.startTime) / duration) * props.timelineWidth)
    setAbsoluteHeight(props.height)
    setAbsoluteLeft(0)
    setAbsoluteTop(0)
  }

  const onStartDrag = (e: DraggableEvent) => {
    setIsGrabbed(true)
  }

  const onStopDrag = (e: DraggableEvent, position: any) => {
    // Update position and thereby start/end times in redux
    const {x} = position
    dispatchNewTimes(
      (x / props.timelineWidth) * (duration),
      (x / props.timelineWidth) * (duration) + (props.cue.endTime - props.cue.startTime)
    )

    setIsGrabbed(false)
  }

  const onClick = () => {
    // Scroll to segment start
    dispatch(setCurrentlyAt(props.cue.startTime))

    // Inform list view which segment was clicked
    dispatch(setFocusSegmentTriggered(true))
    dispatch(setFocusSegmentId(props.cue.idInternal))
    dispatch(setFocusSegmentTriggered2(true))
  }

  const segmentStyle = css({
    position: 'absolute',

    // Apply resizable calculations
    width: absoluteWidth,
    height: absoluteHeight,
    margin: `${absoluteTop}px 0px 0px ${absoluteLeft}px`,

    background: `${theme.subtitle_segment_bg}`,
    border: `${theme.subtitle_segment_border}`,
    borderRadius: '5px',
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
    padding: '8px',
    color: `${theme.subtitle_segment_text}`
  })

  return (
      <Draggable
        onStart={onStartDrag}
        onStop={onStopDrag}
        defaultPosition={{ x: 10, y: 10 }}
        position={controlledPosition}
        axis="x"
        bounds="parent"
        nodeRef={nodeRef}
        cancel={".react-resizable-handle"}
      >
        <Resizable
          height={absoluteHeight}
          width={absoluteWidth}
          onResize={onResizeAbsolute}
          onResizeStop={onResizeStop}
          // TODO: The 'e' handle is currently NOT WORKING CORRECTLY!
          //  The errounous behaviour can already be seens with a minimal
          //  draggable + resizable example.
          //  Fix most likely requires changes in one of those modules
          resizeHandles={['w']}
        >
          <div css={ segmentStyle } ref={nodeRef} onClick={onClick} id="no-scrolling">
            <span css={textStyle}>{props.cue.text}</span>
          </div>
        </Resizable>
      </Draggable>
  )
})

// /**
//  * For debugging
//  * Minimal example: Resizable
//  */
//  const Example: React.FC<{}> = () => {

//   const [absoluteWidth, setAbsoluteWidth] = useState(200)
//   const [absoluteHeight, setAbsoluteHeight] = useState(200)
//   const [absoluteLeft, setAbsoluteLeft] = useState(0)
//   const [absoluteTop, setAbsoluteTop] = useState(0)

//   // On bottom layout. Used to resize the center element around its flex parent.
//   const onResizeAbsolute = (event: any, {element, size, handle}: any) => {
//     let newLeft = absoluteLeft;
//     let newTop = absoluteTop;
//     const deltaHeight = size.height - absoluteHeight;
//     const deltaWidth = size.width - absoluteWidth;
//     if (handle[0] === 'n') {
//       newTop -= deltaHeight;
//     } else if (handle[0] === 's') {
//       newTop += deltaHeight;
//     }
//     if (handle[handle.length - 1] === 'w') {
//       newLeft -= deltaWidth;
//     } else if (handle[handle.length - 1] === 'e') {
//       newLeft += deltaWidth;
//     }

//     setAbsoluteWidth(size.width)
//     setAbsoluteHeight(size.height)
//     setAbsoluteLeft(newLeft)
//     setAbsoluteTop(newTop)
//   };

//   return (
//     <Resizable
//       // className="box absolutely-positioned center-aligned"
//       height={absoluteHeight}
//       width={absoluteWidth}
//       onResize={onResizeAbsolute}
//       resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
//     >
//       <div
//         // className="box"
//         style={{
//           width: absoluteWidth,
//           height: absoluteHeight,
//           margin: `${absoluteTop}px 0px 0px ${absoluteLeft}px`,
//         }}
//       >
//         <span className="text">{"Raw use of <Resizable> element with controlled position. Resize and reposition in all directions" + absoluteLeft}</span>
//       </div>
//     </Resizable>
//   );
// }

// /**
//  * For debugging
//  * Minimal example: Draggable + Resizable
//  * Erratic behaviour when resizing the east handle for smallish widths
//  */
// const Example2: React.FC<{}> = () => {

//   const [absoluteWidth, setAbsoluteWidth] = useState(200)
//   const [absoluteHeight, setAbsoluteHeight] = useState(200)
//   const [absoluteLeft, setAbsoluteLeft] = useState(0)
//   const [absoluteTop, setAbsoluteTop] = useState(0)

//   // On bottom layout. Used to resize the center element around its flex parent.
//   const onResizeAbsolute = (event: any, {element, size, handle}: any) => {
//     let newLeft = absoluteLeft;
//     let newTop = absoluteTop;
//     const deltaHeight = size.height - absoluteHeight;
//     const deltaWidth = size.width - absoluteWidth;
//     if (handle[0] === 'n') {
//       newTop -= deltaHeight;
//     } else if (handle[0] === 's') {
//       newTop += deltaHeight;
//     }
//     if (handle[handle.length - 1] === 'w') {
//       newLeft -= deltaWidth;
//     } else if (handle[handle.length - 1] === 'e') {
//       newLeft += deltaWidth;
//     }

//     setAbsoluteWidth(size.width)
//     setAbsoluteHeight(size.height)
//     setAbsoluteLeft(newLeft)
//     setAbsoluteTop(newTop)
//   };

//   const leStyle = {
//     width: absoluteWidth,
//     height: absoluteHeight,
//     margin: `${absoluteTop}px 0px 0px ${absoluteLeft}px`,
//     backgroundColor: "red",
//   }

//   return (
//     <div>
//       <Draggable
//         defaultPosition={{ x: 10, y: 10 }}
//         onDrag={() => console.log("onDrag")}
//         cancel={".react-resizable-handle"}
//       >
//         <Resizable
//           height={absoluteHeight}
//           width={absoluteWidth}
//           onResize={onResizeAbsolute}
//           resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']}
//         >
//           <div style={ leStyle }>
//             test
//           </div>
//         </Resizable>
//       </Draggable>
//     </div>
//   )
// }

export default SubtitleTimeline
