import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { SegmentsList as CuttingSegmentsList, Waveforms } from "./Timeline";
import { ZoomDropdown, ZoomSlider } from "./CuttingActions";
import {
  addCueAtIndex,
  selectCurrentlyAt,
  selectSelectedSubtitleById,
  selectSelectedSubtitleId,
  setCueAtIndex,
  setCurrentlyAt,
  setFocusSegmentId,
  setFocusSegmentTriggered,
  setFocusSegmentTriggered2,
} from "../redux/subtitleSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  moveCut,
  selectActiveSegmentIndex,
  selectDisplayDuration,
  selectDuration,
  selectSegments,
  timelineZoomIn,
  timelineZoomOut,
} from "../redux/videoSlice";
import Draggable, { DraggableEventHandler } from "react-draggable";
import { SubtitleCue } from "../types";
import { Resizable, ResizeCallbackData } from "react-resizable";
import "react-resizable/css/styles.css";
import ScrollContainer, { ScrollEvent } from "react-indiana-drag-scroll";
import { useTheme } from "../themes";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { shallowEqual } from "react-redux";
import TimelineStamps from "./TimelineStamps";
import { rewriteKeys } from "../globalKeys";
import { selectKeymap } from "../redux/hotkeySlice";
import { useResizeObserver } from "usehooks-ts";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

/**
 * Copy-paste of the timeline in Video.tsx, so that we can make some small adjustments,
 * like adding in a list of subtitle segments
 */
const SubtitleTimeline: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  // Init redux variables
  const dispatch = useAppDispatch();
  const keymap = useAppSelector(selectKeymap);
  const duration = useAppSelector(selectDuration);
  const currentlyAt = useAppSelector(selectCurrentlyAt);
  const subtitleId = useAppSelector(selectSelectedSubtitleId, shallowEqual);
  const displayDuration = useAppSelector(selectDisplayDuration);

  const ref = useRef<HTMLDivElement>(null);
  const { width = 1 } = useResizeObserver<HTMLDivElement>({ ref: ref as React.RefObject<HTMLDivElement> });
  const refTop = useRef<HTMLElement>(null);

  // How much of the timeline should be visible in milliseconds. Driven by the shared timeline zoom level
  const timelineCutoutInMs = displayDuration * 1000;

  // Callback for the zoom slider/dropdown, dispatching the zoom action to redux
  const dispatchZoomAction = (
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: number,
  ) => {
    if (action) {
      dispatch(action());
    }
    if (actionWithPayload) {
      dispatch(actionWithPayload(payload));
    }
  };

  // Hotkeys for zooming, shared with the Cutting/Chapter timelines
  useHotkeys(
    keymap.cutting.zoomIn.key,
    () => dispatch(timelineZoomIn()),
    keymap.cutting.zoomIn.options,
    [],
  );
  useHotkeys(
    keymap.cutting.zoomOut.key,
    () => dispatch(timelineZoomOut()),
    keymap.cutting.zoomOut.options,
    [],
  );

  const timelineStyle = css({
    position: "relative",     // Need to set position for Draggable bounds to work
    width: ((duration / timelineCutoutInMs)) * 100 + "%",    // Total length of timeline based on number of cutouts
    paddingLeft: "50%",
    paddingRight: "50%",
  });

  // Vars for timelineStamps
  const [scrollLeft, setScrollLeft] = useState(0);
  const [visibleWidth, setVisibleWidth] = useState(0);
  const paddingOffset = visibleWidth / 2;
  const virtualScrollLeft = scrollLeft - paddingOffset;

  // Make sure visibleWidth is set so canvas is drawn on first render
  useLayoutEffect(() => {
    updateScrollMetrics();
  }, [width, duration]);

  // Apply horizonal scrolling when scrolled from somewhere else
  useEffect(() => {
    if (currentlyAt !== undefined && refTop.current) {
      const scrollLeftMax = (refTop.current.scrollWidth - refTop.current.clientWidth);
      refTop.current.scrollTo(Math.round((currentlyAt / duration) * scrollLeftMax), 0);
    }
  }, [currentlyAt, duration, width]);

  const [keyboardJumpDelta, setKeyboardJumpDelta] = useState(1000);  // In milliseconds. For keyboard navigation

  // Callback for adding subtitle segment by hotkey
  const addCue = (time: number) => {
    dispatch(addCueAtIndex({
      identifier: subtitleId,
      cueIndex: -1,
      text: "",
      startTime: time,
      endTime: time + 5000,
    }));
  };

  // Callbacks for keyboard controls
  // TODO: Better increases and decreases than ten intervals
  // TODO: Additional helpful controls (e.g. jump to start/end of segment/next segment)
  useHotkeys(
    keymap.timeline.left.key,
    () => dispatch(setCurrentlyAt(Math.max(currentlyAt - keyboardJumpDelta, 0))),
    keymap.timeline.left.options,
    [currentlyAt, keyboardJumpDelta],
  );
  useHotkeys(
    keymap.timeline.right.key,
    () => dispatch(setCurrentlyAt(Math.min(currentlyAt + keyboardJumpDelta, duration))),
    keymap.timeline.right.options,
    [currentlyAt, keyboardJumpDelta, duration],
  );
  useHotkeys(
    keymap.timeline.increase.key,
    () => setKeyboardJumpDelta(keyboardJumpDelta => Math.min(keyboardJumpDelta * 10, 1000000)),
    keymap.timeline.increase.options,
    [keyboardJumpDelta],
  );
  useHotkeys(
    keymap.timeline.decrease.key,
    () => setKeyboardJumpDelta(keyboardJumpDelta => Math.max(keyboardJumpDelta / 10, 1)),
    keymap.timeline.decrease.options,
    [keyboardJumpDelta],
  );
  useHotkeys(
    keymap.subtitleList.addCue.key,
    () => addCue(currentlyAt),
    keymap.subtitleList.addCue.options,
    [currentlyAt],
  );

  const updateScrollMetrics = () => {
    if (!refTop.current) {
      return;
    }
    const el = refTop.current;
    setScrollLeft(el.scrollLeft);
    setVisibleWidth(el.clientWidth);
  };

  // Callback for the scroll container
  const onEndScroll = (e: ScrollEvent) => {
    // If scrolled by user
    if (!e.external && refTop && refTop.current) {
      const offsetX = refTop.current.scrollLeft;
      const scrollLeftMax = (refTop.current.scrollWidth - refTop.current.clientWidth);
      dispatch(setCurrentlyAt((offsetX / scrollLeftMax) * (duration)));

      // Blur active element after scrolling, to ensure hotkeys are working
      // This is a little hack to work around focus getting stuck in textarea elements from the subtitle list
      try {
        (document.activeElement as HTMLElement).blur();
      } catch (_e) {
        console.error("Tried to blur active element, but active element cannot be blurred.");
      }
    }
  };

  const subtitleTimelineStyle = css({
    position: "relative",
    width: "100%",
    paddingBottom: "15px",
  });

  return (
    <div css={subtitleTimelineStyle}>
      {/* "Scrubber". Sits smack dab in the middle and does not move */}
      <div
        css={{
          position: "absolute",
          width: "2px",
          height: "222px",
          ...(refTop.current) && { left: (refTop.current.clientWidth / 2) },
          background: `${theme.text}`,
          zIndex: 100,
        }}
      />
      {/* Time codes above the timeline */}
      <TimelineStamps
        durationMs={duration}
        zoomedWidth={width}
        scrollLeft={virtualScrollLeft}
        visibleWidth={visibleWidth}
        height={20}
      />
      {/* Scrollable timeline container. Has width of parent*/}
      <ScrollContainer innerRef={refTop} css={{ overflowY: "hidden", width: "100%", height: "215px" }}
        vertical={false}
        horizontal={true}
        onEndScroll={onEndScroll}
        onScroll={updateScrollMetrics}
        // dom elements with this id in the container will not trigger scrolling when dragged
        ignoreElements={".prevent-drag-scroll"}
        hideScrollbars={false}            // ScrollContainer hides scrollbars per default
      >
        {/* Container. Overflows. Width based on parent times zoom level*/}
        <div ref={ref} css={timelineStyle}>
          <TimelineSubtitleSegmentsList timelineWidth={width} />
          <div css={{ position: "relative", height: "100px" }} >
            <Waveforms timelineHeight={120} />
            <CuttingSegmentsList
              timelineWidth={width}
              timelineHeight={120}
              styleByActiveSegment={false}
              tabable={false}
              selectSegments={selectSegments}
              selectActiveSegmentIndex={selectActiveSegmentIndex}
              moveCut={moveCut}
            />
          </div>
        </div>
      </ScrollContainer>
      <div css={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "10px" }}>
        <ZoomSlider actionHandler={dispatchZoomAction}
          tooltip={t("cuttingActions.zoomSlider-tooltip", {
            hotkeyNameIn: rewriteKeys(keymap.cutting.zoomIn.key),
            hotkeyNameOut: rewriteKeys(keymap.cutting.zoomOut.key),
          })}
          ariaLabelText={t("cuttingActions.zoomSlider-aria", {
            hotkeyNameIn: rewriteKeys(keymap.cutting.zoomIn.key),
            hotkeyNameOut: rewriteKeys(keymap.cutting.zoomOut.key),
          })}
        />
        <ZoomDropdown />
      </div>
    </div>



  // <div className="layoutRoot absoluteLayout">
  //   {/* <Example /> */}
  //   <Example2 />
  //   {/* <TimelineSubtitleSegment
  //   timelineWidth={width}
  //   cue={{id: "42", text:"HI", startTime: 1000, endTime: 5000, tree:{children: [{type: "", value: ""}]}}}
  //   index={0}
  //   height={80}
  //   /> */}
  // </div>
  );
};


/**
 * Displays subtitle segments as a row of boxes
 */
const TimelineSubtitleSegmentsList: React.FC<{ timelineWidth: number; }> = ({ timelineWidth }) => {

  const arbitraryHeight = 80;
  const subtitle = useAppSelector(selectSelectedSubtitleById);

  const segmentsListStyle = css({
    position: "relative",
    width: "100%",
    height: `${arbitraryHeight}px`,
    overflow: "hidden",
  });

  return (
    <div css={segmentsListStyle}>
      {subtitle?.cues?.map((item, i) => {
        return (
          <TimelineSubtitleSegment
            timelineWidth={timelineWidth}
            cue={item}
            height={arbitraryHeight}
            key={item.idInternal}
            index={i}
          />
        );
      })}
    </div>
  );
};

/**
 * A single segments for the timeline subtitle segments list
 */
const TimelineSubtitleSegment: React.FC<{
  timelineWidth: number,
  cue: SubtitleCue,
  index: number,
  height: number;
}> = React.memo(props => {

  // Redux
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectSelectedSubtitleId);
  const duration = useAppSelector(selectDuration);

  // Dimensions and position offsets in px. Required for resizing
  const [absoluteWidth, setAbsoluteWidth] = useState(0);
  const [absoluteHeight, setAbsoluteHeight] = useState(0);
  const [absoluteLeft, setAbsoluteLeft] = useState(0);
  const [absoluteTop, setAbsoluteTop] = useState(0);

  const [controlledPosition, setControlledPosition] = useState({ x: 0, y: 0 });
  const [isGrabbed, setIsGrabbed] = useState(false);
  const nodeRef = React.useRef(null); // For supressing "ReactDOM.findDOMNode() is deprecated" warning

  const theme = useTheme();
  // Reposition scrubber when the current x position was changed externally
  useEffect(() => {
    setControlledPosition({ x: (props.cue.startTime / duration) * (props.timelineWidth), y: 0 });
  }, [props.cue.startTime, duration, props.timelineWidth]);

  // Set width and reset any resizing that may have happened meanwhile
  useEffect(() => {
    setAbsoluteWidth(((props.cue.endTime - props.cue.startTime) / duration) * props.timelineWidth);
    setAbsoluteHeight(props.height);
    setAbsoluteLeft(0);
    setAbsoluteTop(0);
  }, [duration, props.cue.endTime, props.cue.startTime, props.height, props.timelineWidth]);

  // Check for impossible timestamps and update state in redux
  const dispatchNewTimes = (newStartTime: number, newEndTime: number) => {
    if (newStartTime < 0) {
      newStartTime = 0;
    }
    if (newEndTime < newStartTime) {
      newEndTime = newStartTime;
    }

    dispatch(setCueAtIndex({
      identifier: selectedId,
      cueIndex: props.index,
      newCue: {
        id: props.cue.id,
        idInternal: props.cue.idInternal,
        text: props.cue.text,
        startTime: newStartTime,
        endTime: newEndTime,
        tree: props.cue.tree,
      },
    }));
  };

  // Resizable does not support resizing in the west/north directions out of the box,
  // so additional calculations are necessary.
  // Adapted from Resizable example code
  const onResizeAbsolute = (_event: React.SyntheticEvent, data: ResizeCallbackData): void => {
    const { size, handle } = data;
    // Possible TODO: Find a way to stop resizing a segment beyond 0ms here instead of later
    let newLeft = absoluteLeft;

    if (handle[handle.length - 1] === "w") {
      newLeft -= size.width - absoluteWidth;
    }

    setAbsoluteWidth(size.width);
    setAbsoluteLeft(newLeft);
  };

  // Update redux state based on the resize
  const onResizeStop = (_event: React.SyntheticEvent, data: ResizeCallbackData): void => {
    const { handle } = data;
    // Calc new width, factoring in offset
    const newWidth = absoluteWidth;

    const newSegmentDuration = (newWidth / props.timelineWidth) * duration;
    const timeDiff = (props.cue.endTime - props.cue.startTime) - newSegmentDuration;

    let newStartTime = props.cue.startTime;
    let newEndTime = props.cue.endTime;
    // if handle === left, update startTime
    if (handle === "w") {
      newStartTime = props.cue.startTime + timeDiff;
    }
    // if handle === right, update endTime
    if (handle === "e") {
      newEndTime = props.cue.endTime - timeDiff;
    }

    dispatchNewTimes(newStartTime, newEndTime);

    // Reset resizing
    // Required when resizing beyond 0 multiple times,
    // because the time does not change, so the reset in useEffect does not trigger
    setAbsoluteWidth(((props.cue.endTime - props.cue.startTime) / duration) * props.timelineWidth);
    setAbsoluteHeight(props.height);
    setAbsoluteLeft(0);
    setAbsoluteTop(0);
  };

  const onStartDrag: DraggableEventHandler = _e => {
    setIsGrabbed(true);
  };

  const onStopDrag: DraggableEventHandler = (_e, position) => {
    // Update position and thereby start/end times in redux
    const { x } = position;
    dispatchNewTimes(
      (x / props.timelineWidth) * (duration),
      (x / props.timelineWidth) * (duration) + (props.cue.endTime - props.cue.startTime),
    );

    setIsGrabbed(false);
  };

  const onClick = () => {
    // Scroll to segment start
    dispatch(setCurrentlyAt(props.cue.startTime));

    // Inform list view which segment was clicked
    dispatch(setFocusSegmentTriggered(true));
    dispatch(setFocusSegmentId(props.cue.idInternal));
    dispatch(setFocusSegmentTriggered2(true));
  };

  const segmentStyle = css({
    position: "absolute",

    // Apply resizable calculations
    width: absoluteWidth,
    height: absoluteHeight,
    margin: `${absoluteTop}px 0px 0px ${absoluteLeft}px`,

    background: `${theme.subtitle_segment_bg}`,
    border: `${theme.subtitle_segment_border}`,
    borderRadius: "5px",
    boxSizing: "border-box",
    color: `${theme.subtitle_segment_text}`,
    zIndex: 1,

    cursor: isGrabbed ? "grabbing" : "grab",

    // Center text
    display: "flex",
    alignItems: "center",
  });

  const textStyle = css({
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    padding: "8px",
    color: `${theme.subtitle_segment_text}`,
  });

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
        resizeHandles={["w", "e"]}
      >
        <div css={segmentStyle} ref={nodeRef} onClick={onClick} className="prevent-drag-scroll">
          <span css={textStyle}>{props.cue.text}</span>
        </div>
      </Resizable>
    </Draggable>
  );
});

// /**
//  * For debugging
//  * Minimal example: Resizable
//  */
//  const Example: React.FC = () => {

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
//     if (handle[0] === "n") {
//       newTop -= deltaHeight;
//     } else if (handle[0] === "s") {
//       newTop += deltaHeight;
//     }
//     if (handle[handle.length - 1] === "w") {
//       newLeft -= deltaWidth;
//     } else if (handle[handle.length - 1] === "e") {
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
//       resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
//     >
//       <div
//         // className="box"
//         style={{
//           width: absoluteWidth,
//           height: absoluteHeight,
//           margin: `${absoluteTop}px 0px 0px ${absoluteLeft}px`,
//         }}
//       >
//         <span className="text">
//           {"Raw use of <Resizable> element with controlled position.
//           Resize and reposition in all directions" + absoluteLeft}
//         </span>
//       </div>
//     </Resizable>
//   );
// }

// /**
//  * For debugging
//  * Minimal example: Draggable + Resizable
//  * Erratic behaviour when resizing the east handle for smallish widths
//  */
// const Example2: React.FC = () => {

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
//     if (handle[0] === "n") {
//       newTop -= deltaHeight;
//     } else if (handle[0] === "s") {
//       newTop += deltaHeight;
//     }
//     if (handle[handle.length - 1] === "w") {
//       newLeft -= deltaWidth;
//     } else if (handle[handle.length - 1] === "e") {
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
//           resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
//         >
//           <div style={ leStyle }>
//             test
//           </div>
//         </Resizable>
//       </Draggable>
//     </div>
//   )
// }

export default SubtitleTimeline;
