import { css, SerializedStyles } from "@emotion/react";
import { IconType } from "react-icons";
import { LuPlus, LuTrash } from "react-icons/lu";
import { memoize } from "lodash";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { basicButtonStyle } from "../cssStyles";
import { KEYMAP } from "../globalKeys";
import {
  addCueAtIndex,
  removeCue,
  selectFocusSegmentId,
  selectFocusSegmentTriggered,
  selectFocusSegmentTriggered2,
  selectSelectedSubtitleById,
  selectSelectedSubtitleId,
  setCueAtIndex,
  setCurrentlyAt,
  setFocusSegmentTriggered,
  setFocusSegmentTriggered2,
  setFocusToSegmentAboveId,
  setFocusToSegmentBelowId,
} from "../redux/subtitleSlice";
import { SubtitleCue } from "../types";
import { convertMsToReadableString } from "../util/utilityFunctions";
import { VariableSizeList } from "react-window";
import { CSSProperties } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { useHotkeys } from "react-hotkeys-hook";
import { ProtoButton, useColorScheme } from "@opencast/appkit";

/**
 * Displays everything needed to edit subtitles
 */
const SubtitleListEditor: React.FC = () => {

  const dispatch = useAppDispatch();

  const subtitle = useAppSelector(selectSelectedSubtitleById);
  const subtitleId = useAppSelector(selectSelectedSubtitleId, shallowEqual);
  const focusTriggered = useAppSelector(selectFocusSegmentTriggered, shallowEqual);
  const focusId = useAppSelector(selectFocusSegmentId, shallowEqual);
  const defaultSegmentLength = 5000;
  const segmentHeight = 100;

  const itemsRef = useRef<HTMLTextAreaElement[] | null[]>([]);
  const listRef = useRef<VariableSizeList>(null);

  // Update ref array size
  useEffect(() => {
    if (subtitle?.cues) {
      itemsRef.current = itemsRef.current.slice(0, subtitle.cues.length);
    }
  }, [subtitle?.cues]);

  // Scroll to segment when triggered by reduxState
  useEffect(() => {
    if (focusTriggered) {
      if (itemsRef && itemsRef.current && subtitle?.cues) {
        const itemIndex = subtitle?.cues.findIndex(item => item.idInternal === focusId);
        if (listRef && listRef.current) {
          listRef.current.scrollToItem(itemIndex, "center");

        }
      }
      dispatch(setFocusSegmentTriggered(false));
    }
  }, [dispatch, focusId, focusTriggered, itemsRef, subtitle?.cues]);

  // Automatically create a segment if there are no segments
  useEffect(() => {
    if (subtitle?.cues && subtitle?.cues.length === 0) {
      dispatch(addCueAtIndex({
        identifier: subtitleId,
        cueIndex: 0,
        text: "",
        startTime: 0,
        endTime: defaultSegmentLength,
      }));
    }
  }, [dispatch, subtitle?.cues, subtitleId]);

  const listStyle = css({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "60%",
    gap: "20px",
  });

  const calcEstimatedSize = React.useCallback(() => {
    return segmentHeight;
  }, []);

  const itemData = createItemData(subtitle?.cues, subtitleId, defaultSegmentLength);

  return (
    <div css={listStyle}>
      <AutoSizer>
        {({ height, width }: { height: string | number, width: string | number; }) => (
          <VariableSizeList
            height={height ? height : 0}
            itemCount={subtitle?.cues !== undefined ? subtitle?.cues.length : 0}
            itemData={itemData}
            itemSize={_index => segmentHeight}
            itemKey={(index, data) => data.items[index].idInternal}
            width={width ? width : 0}
            overscanCount={4}
            estimatedItemSize={calcEstimatedSize()}
            innerElementType={innerElementType}
            ref={listRef}
          >
            {SubtitleListSegment}
          </VariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

/**
 * Helper function for reducing rerender calls caused by react-window
 */
const createItemData = memoize((items, identifier, defaultSegmentLength) => ({
  items,
  identifier,
  defaultSegmentLength,
}));

/**
 * Global variable to synchronize padding for react-window elements
 */
const PADDING_SIZE = 20;

// Used for padding in the VariableSizeList
const innerElementType = React.forwardRef<HTMLDivElement, { style: CSSProperties; }>(({ style, ...rest }, ref) => (
  <div
    ref={ref}
    style={{
      ...style,
      // height: `${parseFloat(style.height !== undefined ? style.height.toString() : "0") + PADDING_SIZE * 2}px`,
      paddingTop: PADDING_SIZE + "px",
      zIndex: "1000",
    }}
    {...rest}
  />
));

/**
 * Type definition for SubtitleListSegment
 */
type subtitleListSegmentProps = {
  index: number,
  data: { items: SubtitleCue[], identifier: string, defaultSegmentLength: number; },
  style: CSSProperties;
};

/**
 * A single subtitle segment
 */
const SubtitleListSegment = React.memo((props: subtitleListSegmentProps) => {

  // Parse props
  const { items, identifier, defaultSegmentLength } = props.data;
  const cue = items[props.index];

  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  // Unfortunately, the focus selectors will cause every element to rerender,
  // even if they are not the ones that are focused
  // However, since the number of list segments rendered is severly limited
  // by react-window, so it should not be an issue
  const focusTriggered2 = useAppSelector(selectFocusSegmentTriggered2, shallowEqual);
  const focusId2 = useAppSelector(selectFocusSegmentId, shallowEqual);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Set focus to textarea
  useEffect(() => {
    if (focusTriggered2 && focusId2 === cue.idInternal) {
      if (textAreaRef && textAreaRef.current) {
        textAreaRef.current.focus();
      }
      dispatch(setFocusSegmentTriggered2(false));
    }
  }, [cue.idInternal, dispatch, focusId2, focusTriggered2]);

  const updateCueText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: props.index,
      newCue: {
        id: cue.id,
        idInternal: cue.idInternal,
        text: event.target.value,
        startTime: cue.startTime,
        endTime: cue.endTime,
        tree: cue.tree,
      },
    }));
  };

  const updateCueStart = (value: number) => {
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: props.index,
      newCue: {
        id: cue.id,
        idInternal: cue.idInternal,
        text: cue.text,
        startTime: value,
        endTime: cue.endTime,
        tree: cue.tree,
      },
    }));
  };

  const updateCueEnd = (value: number) => {
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: props.index,
      newCue: {
        id: cue.id,
        idInternal: cue.idInternal,
        text: cue.text,
        startTime: cue.startTime,
        endTime: value,
        tree: cue.tree,
      },
    }));
  };

  const addCueAbove = () => {
    dispatch(addCueAtIndex({
      identifier: identifier,
      cueIndex: props.index,
      text: "",
      startTime: cue.startTime - defaultSegmentLength,
      endTime: cue.startTime,
    }));
  };

  const addCueBelow = () => {
    dispatch(addCueAtIndex({
      identifier: identifier,
      cueIndex: props.index + 1,
      text: "",
      startTime: cue.endTime,
      endTime: cue.endTime + defaultSegmentLength,
    }));
  };

  const deleteCue = () => {
    dispatch(removeCue({
      identifier: identifier,
      cue: cue,
    }));
  };

  // Maps functions to hotkeys
  const hotkeyRef = useHotkeys<HTMLDivElement>([
    KEYMAP.subtitleList.addAbove.key,
    KEYMAP.subtitleList.addBelow.key,
    KEYMAP.subtitleList.jumpAbove.key,
    KEYMAP.subtitleList.jumpBelow.key,
    KEYMAP.subtitleList.delete.key,
  ], (_, handler) => {
    switch (handler.keys?.join("")) {
      case KEYMAP.subtitleList.addAbove.key.split("+").pop():
        addCueAbove();
        break;
      case KEYMAP.subtitleList.addBelow.key.split("+").pop():
        addCueBelow();
        break;
      case KEYMAP.subtitleList.jumpAbove.key.split("+").pop():
        dispatch(setFocusSegmentTriggered(true));
        dispatch(setFocusToSegmentAboveId({ identifier: identifier, segmentId: cue.idInternal }));
        break;
      case KEYMAP.subtitleList.jumpBelow.key.split("+").pop():
        dispatch(setFocusSegmentTriggered(true));
        dispatch(setFocusToSegmentBelowId({ identifier: identifier, segmentId: cue.idInternal }));
        break;
      case KEYMAP.subtitleList.delete.key.split("+").pop():
        dispatch(setFocusSegmentTriggered(true));
        dispatch(setFocusToSegmentAboveId({ identifier: identifier, segmentId: cue.idInternal }));
        deleteCue();
        break;
    }
  }, { enableOnFormTags: ["input", "select", "textarea"] }, [identifier, cue, props.index]);

  const setTimeToSegmentStart = () => {
    dispatch(setCurrentlyAt(cue.startTime));
  };

  const { scheme } = useColorScheme();

  const segmentStyle = css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "20px",
    // Make function buttons visible when hovered or focused
    "&:hover": {
      "& .functionButtonAreaStyle": {
        visibility: "visible",
      },
    },
    "&:focus-within": {
      "& .functionButtonAreaStyle": {
        visibility: "visible",
      },
    },
    "& textarea, input": {
      outline: `${theme.element_outline}`,
    },
    "& input": {
      marginTop: (scheme === "dark-high-contrast" || scheme === "light-high-contrast" ? "3%" : "0%"),
      marginBottom: (scheme === "dark-high-contrast" || scheme === "light-high-contrast" ? "3%" : "0%"),
    },
  });

  const timeAreaStyle = css({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  });

  const functionButtonAreaStyle = css({
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexGrow: "0.5",
    minWidth: "20px",
    // Hackily moves buttons beyond the segment border.
    // Specific value causes buttons from neighboring segments to overlay.
    height: "132px",
    visibility: "hidden",
  });

  const fieldStyle = css({
    fontSize: "1em",
    marginLeft: "15px",
    borderRadius: "5px",
    borderWidth: "1px",
    padding: "10px 10px",
    background: `${theme.element_bg}`,
    border: "1px solid #ccc",
    color: `${theme.text}`,
  });

  const textFieldStyle = css({
    flexGrow: "7",
    height: "80%",
    minWidth: "100px",
    // TODO: Find a way to allow resizing without breaking the UI
    //  Manual or automatic resizing can cause neighboring textareas to overlap
    //  Can use TextareaAutosize from mui, but that does not fix the overlap problem
    resize: "none",
  });

  return (
    <div ref={hotkeyRef} tabIndex={-1} css={[segmentStyle, {
      ...props.style,
      // Used for padding in the VariableSizeList
      top: props.style.top !== undefined ?
        `${parseFloat(props.style.top.toString()) + PADDING_SIZE}px` : "0px",
      height: props.style.height !== undefined ?
        `${parseFloat(props.style.height.toString()) - PADDING_SIZE}px` : "0px",
      zIndex: "1000",
    }]}>

      <textarea
        ref={textAreaRef}
        css={[fieldStyle, textFieldStyle]}
        defaultValue={cue.text}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            addCueBelow();
          }
        }}
        onChange={updateCueText}
        onFocus={() => setTimeToSegmentStart()}
      />

      <div css={timeAreaStyle}>
        <TimeInput
          generalFieldStyle={[fieldStyle,
            css({ ...(cue.startTime > cue.endTime && { borderColor: "red", borderWidth: "2px" }) })]}
          value={cue.startTime}
          changeCallback={updateCueStart}
          tooltip={t("subtitleList.startTime-tooltip")}
          tooltipAria={t("subtitleList.startTime-tooltip-aria") + ": " + convertMsToReadableString(cue.startTime)}
        />
        <TimeInput
          generalFieldStyle={[fieldStyle,
            css({ ...(cue.startTime > cue.endTime && { borderColor: "red", borderWidth: "2px" }) })]}
          value={cue.endTime}
          changeCallback={updateCueEnd}
          tooltip={t("subtitleList.endTime-tooltip")}
          tooltipAria={t("subtitleList.endTime-tooltip-aria") + ": " + convertMsToReadableString(cue.endTime)}
        />
      </div>
      <div css={functionButtonAreaStyle} className="functionButtonAreaStyle">
        <FunctionButton
          tooltip={t("subtitleList.addSegmentAbove")}
          tooltipAria={t("subtitleList.addSegmentAbove")}
          onClick={addCueAbove}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();                      // Prevent page scrolling due to Space bar press
              event.stopPropagation();                     // Prevent video playback due to Space bar press
              addCueAbove();
            }
          }}
          Icon={LuPlus}
        />
        <FunctionButton
          tooltip={t("subtitleList.deleteSegment")}
          tooltipAria={t("subtitleList.deleteSegment")}
          onClick={deleteCue}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();                      // Prevent page scrolling due to Space bar press
              event.stopPropagation();                     // Prevent video playback due to Space bar press
              deleteCue();
            }
          }}
          Icon={LuTrash}
        />
        <FunctionButton
          tooltip={t("subtitleList.addSegmentBelow")}
          tooltipAria={t("subtitleList.addSegmentBelow")}
          onClick={addCueBelow}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();                      // Prevent page scrolling due to Space bar press
              event.stopPropagation();                     // Prevent video playback due to Space bar press
              addCueBelow();
            }
          }}
          Icon={LuPlus}
        />
      </div>
    </div>
  );
});

const FunctionButton: React.FC<{
  tooltip: string,
  tooltipAria: string,
  onClick: React.MouseEventHandler,
  onKeyDown: React.KeyboardEventHandler,
  Icon: IconType;
}> = ({
  tooltip,
  tooltipAria,
  onClick,
  onKeyDown,
  Icon,
}) => {

  const theme = useTheme();

  const addSegmentButtonStyle = css({
    width: "32px",
    height: "32px",
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
    zIndex: "1000",
  });

  return (
    <ThemedTooltip title={tooltip}>
      <ProtoButton
        aria-label={tooltipAria}
        onClick={onClick}
        onKeyDown={onKeyDown}
        css={[basicButtonStyle(theme), addSegmentButtonStyle]}
      >
        <Icon />
      </ProtoButton>
    </ThemedTooltip>
  );
};

/**
 * Input field for the time values for a subtitle segment
 */
const TimeInput: React.FC<{
  value: number,
  changeCallback: (value: number) => void,
  generalFieldStyle: SerializedStyles[],
  tooltip: string,
  tooltipAria: string,
}> = ({
  value,
  changeCallback,
  generalFieldStyle,
  tooltip,
  tooltipAria,
}) => {

  // Stores the millisecond value as a string for the input element
  const [myValue, setMyValue] = useState(toHHMMSSMS(value));
  const [parsingError, setParsingError] = useState(false);

  // Update time value if it got changed externally
  useEffect(() => {
    setMyValue(toHHMMSSMS(value));
  }, [value]);

  // Update local state with user input
  // Works around "input" being read-only without an onChange callback specified
  const onChange = (event: { target: { value: string; }; }) => {
    const value = event.target.value;
    setMyValue(value);
  };

  // Update state in redux
  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setParsingError(false);

    // Parse value and pass it to parent
    const value = event.target.value;
    const milliseconds = getMillisecondsFromHHMMSSMS(value);
    if (milliseconds === undefined) {
      setParsingError(true);
      return;
    }
    changeCallback(milliseconds);

    // Make sure to set state to the parsed value
    const time = toHHMMSSMS(milliseconds);
    setMyValue(time);
  };

  const timeFieldStyle = css({
    height: "20%",
    width: "100px",
    ...(parsingError && { borderColor: "red", borderWidth: "2px" }),
  });

  return (
    <ThemedTooltip title={tooltip}>
      <input
        css={[generalFieldStyle, timeFieldStyle]}
        aria-label={tooltipAria}
        type="text"
        onChange={onChange}
        onBlur={onBlur}
        value={myValue}
      />
    </ThemedTooltip>
  );
};

/**
 * Converts a number into a string with leading zeros
 */
const fillIn = (val: number) => {
  return val < 10 ? `0${val}` : val;
};
const fillInMilliseconds = (val: number) => {
  if (val < 10) {
    return `00${val}`;
  } else if (val < 100) {
    return `0${val}`;
  } else {
    return val;
  }
};

/**
 * Utility function for TimeInpit
 * Converts a number in milliseoncsd to a string of the format HH:MM:SS:MSS
 */
function toHHMMSSMS(ms: number) {
  const milliseconds = (ms % 1000);
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const millisecondsString = fillInMilliseconds(milliseconds);
  const secondsString = fillIn(seconds);
  const minutesString = fillIn(minutes);
  const hoursString = fillIn(hours);

  return [hoursString, minutesString, secondsString, millisecondsString].join(":");
}

/**
  Utility function for TimeInpit
 * Converts a string of the format HH:MM:SS:MSS to a millisecond number
 */
function getMillisecondsFromHHMMSSMS(value: string) {
  const [str1, str2, str3, str4] = value.split(":");

  const val1 = Number(str1);
  const val2 = Number(str2);
  const val3 = Number(str3);
  const val4 = Number(str4);

  if (!isNaN(val1) && isNaN(val2) && isNaN(val3) && isNaN(val4)) {
    // milliseconds
    return val1;
  }

  if (!isNaN(val1) && !isNaN(val2) && isNaN(val3) && isNaN(val4)) {
    // seconds * 1000 + milliseconds
    return val1 * 1000 + val2;
  }

  if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3) && isNaN(val4)) {
    // minutes * 60 * 1000 + seconds * 60 + milliseconds
    return val1 * 60 * 1000 + val2 * 1000 + val3;
  }

  if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3) && !isNaN(val4)) {
    // hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 60 + milliseconds
    return val1 * 60 * 60 * 1000 + val2 * 60 * 1000 + val3 * 1000 + val4;
  }

  return undefined;
}

export default SubtitleListEditor;
