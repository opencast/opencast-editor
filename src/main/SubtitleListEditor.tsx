import { css, SerializedStyles } from "@emotion/react"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles"
import { addCueAtIndex, removeCue, selectSelectedSubtitleByFlavor, selectSelectedSubtitleFlavor, setCueAtIndex } from "../redux/subtitleSlice"
import { SubtitleCue } from "../types"

/**
 * Displays everything needed to edit subtitles
 */
 const SubtitleListEditor : React.FC<{}> = () => {

  const dispatch = useDispatch()

  const subtitle = useSelector(selectSelectedSubtitleByFlavor)
  const subtitleFlavor = useSelector(selectSelectedSubtitleFlavor)
  // const timelineClickTriggered = useSelector(selectTimelineSegmentClickTriggered)
  // const timelineClicked = useSelector(selectTimelineSegmentClicked)
  const defaultSegmentLength = 5000

  // interface refAssocArrayType {
  //   [key: string]: RefObject<HTMLDivElement>
  // }

  // // TODO: Get this to work. List of references is empty
  // const segmentRefs = subtitle?.subtitles.reduce((acc: refAssocArrayType, value) => {
  //   acc[value.id] = createRef<HTMLDivElement>();
  //   return acc;
  // }, {});

  // Automatically create a segment if there are no segments
  useEffect(() => {
    if (subtitle && subtitle.length === 0) {
      dispatch(addCueAtIndex({
        identifier: subtitleFlavor,
        cueIndex: 0,
        text: "",
        startTime: 0,
        endTime: defaultSegmentLength
      }))
    }
  }, [dispatch, subtitle, subtitleFlavor])

  // // Scroll to segment when triggered by reduxState
  // useEffect(() => {
  //   if (timelineClickTriggered) {
  //     console.log("timelineClickTriggered: " + timelineClickTriggered)
  //     if (segmentRefs) {
  //       console.log("segmentRefs: " + segmentRefs)
  //       console.log(segmentRefs)
  //       const currentRef = segmentRefs[timelineClicked].current
  //       if (currentRef) {
  //         console.log("currentRef: " + currentRef)
  //         currentRef.scrollIntoView({
  //           behavior: 'smooth',
  //           block: 'start',
  //         });
  //       }
  //     }
  //     dispatch(setTimelineSegmentClickTriggered(true))
  //   }
  // }, [dispatch, segmentRefs, timelineClickTriggered, timelineClicked])

  const listStyle = css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '60%',
    ...(flexGapReplacementStyle(20, false)),
  })

  const headerStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    ...(flexGapReplacementStyle(20, false)),
    paddingRight: '20px',
  })

  const segmentListStyle = css({
    display: 'flex',
    flexDirection: 'column',
    ...(flexGapReplacementStyle(20, false)),
    paddingTop: '30px',  // Else the select highlighting gets cut off
    paddingBottom: '30px',
    paddingRight: '10px',
    overflowY: 'auto',
  })

  const cuttingActionButtonStyle = {
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div css={listStyle}>
      <div css={headerStyle}>
        <div css={[basicButtonStyle, cuttingActionButtonStyle]}>Herunterladen</div>
        <div css={[basicButtonStyle, cuttingActionButtonStyle]}>Hochladen</div>
        <div css={[basicButtonStyle, cuttingActionButtonStyle]}>Alles löschen</div>
      </div>
      <div css={segmentListStyle}>
        {subtitle?.map((item, i) => {
          // if (segmentRefs) {
            return (
              <SubtitleListSegment
                identifier={subtitleFlavor}
                dataKey={i}
                cue={item}
                defaultSegmentLength={defaultSegmentLength}
                key={item.id}
                // ref={segmentRefs[item.id]}
              />
            )
          // }
        })}
      </div>
    </div>
  );
}

/**
 * A single subtitle segment
 */
const SubtitleListSegment : React.FC<{
  identifier: string,
  dataKey: number,
  cue: SubtitleCue,
  defaultSegmentLength: number,
  // ref: RefObject<HTMLDivElement>,
}> = React.memo(props => {

  const dispatch = useDispatch()

  const updateCueText = (event: { target: { value: any } }) => {
    dispatch(setCueAtIndex({
      identifier: props.identifier,
      cueIndex: props.dataKey,
      newCue: {id: props.cue.id, text: event.target.value, startTime: props.cue.startTime, endTime: props.cue.endTime, tree: props.cue.tree}
    }))
  };

  const updateCueStart = (event: { target: { value: any } }) => {
    dispatch(setCueAtIndex({
      identifier: props.identifier,
      cueIndex: props.dataKey,
      newCue: {id: props.cue.id, text: props.cue.text, startTime: event.target.value, endTime: props.cue.endTime, tree: props.cue.tree}
    }))
  };

  const updateCueEnd = (event: { target: { value: any } }) => {
    console.log("updateCueEnd: " + event.target.value)
    dispatch(setCueAtIndex({
      identifier: props.identifier,
      cueIndex: props.dataKey,
      newCue: {id: props.cue.id, text: props.cue.text, startTime: props.cue.startTime, endTime: event.target.value, tree: props.cue.tree}
    }))
  };

  const addCueAbove = () => {
    dispatch(addCueAtIndex({identifier: props.identifier,
      cueIndex: props.dataKey,
      text: "",
      startTime: props.cue.startTime - props.defaultSegmentLength,
      endTime: props.cue.startTime
    }))
  }

  const addCueBelow = () => {
    dispatch(addCueAtIndex({
      identifier: props.identifier,
      cueIndex: props.dataKey + 1,
      text: "",
      startTime: props.cue.endTime,
      endTime: props.cue.endTime + props.defaultSegmentLength
    }))
  }

  const deleteCue = () => {
    dispatch(removeCue({
      identifier: props.identifier,
      cue: props.cue
    }))
  }

  const segmentStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100px',
    ...(flexGapReplacementStyle(20, false)),
    // Make function buttons visible when hovered or focused
    "&:hover": {
      "& .functionButtonAreaStyle": {
        visibility: "visible",
      }
    },
    "&:focus-within": {
      "& .functionButtonAreaStyle": {
        visibility: "visible",
      }
    },
  })

  const timeAreaStyle = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  })

  const functionButtonAreaStyle = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(flexGapReplacementStyle(10, false)),
    flexGrow: '0.5',
    minWidth: '20px',
    height: '152px',    // Hackily moves buttons beyond the segment border. Specific value causes buttons from neighboring segments to overlay
    visibility: 'hidden',
  })

  const fieldStyle = css({
    fontSize: '1em',
    marginLeft: '15px',
    borderRadius: '5px',
    borderWidth: '1px',
    padding: '10px 10px',
    background: 'snow',
  })

  const textFieldStyle = css({
    flexGrow: '7',
    height: '80%',
    minWidth: '100px',
    // TODO: Find a way to allow resizing without breaking the UI
    //  Manual or automatic resizing can cause neighboring textareas to overlap
    //  Can use TextareaAutosize from mui, but that does not fix the overlap problem
    resize: 'none',
  })

  const addSegmentButtonStyle = css({
    width: '32px',
    height: '32px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: '1000',
  })

  console.log("Rerender: " + props.cue.id)
  return (
    <div css={segmentStyle}
      // ref={ref}
    >

      <textarea
        css={[fieldStyle, textFieldStyle]}
        defaultValue={props.cue.text}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === "Enter") {
          // TODO: Focus the textarea in the new segment
          event.preventDefault()
          addCueBelow()
        }}}
        onChange={updateCueText}
      />

      <div css={timeAreaStyle}>
        <TimeInput
          generalFieldStyle={[fieldStyle,
            css({...(props.cue.startTime > props.cue.endTime && {borderColor: 'red'}) })]}
          value={props.cue.startTime}
          changeCallback={updateCueStart}
        />
        <TimeInput
          generalFieldStyle={[fieldStyle,
            css({...(props.cue.startTime > props.cue.endTime && {borderColor: 'red'}) })]}
          value={props.cue.endTime}
          changeCallback={updateCueEnd}
        />
      </div>

      <div css={functionButtonAreaStyle} className="functionButtonAreaStyle">
        <div css={[basicButtonStyle, addSegmentButtonStyle]}
          role="button" tabIndex={0}
          onClick={addCueAbove}
        >
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div>
        <div css={[basicButtonStyle, addSegmentButtonStyle]}
          role="button" tabIndex={0}
          onClick={deleteCue}
        >
          <FontAwesomeIcon icon={faTrash} size="1x" />
        </div>
        <div css={[basicButtonStyle, addSegmentButtonStyle]}
          role="button" tabIndex={0}
          onClick={addCueBelow}
        >
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div>
      </div>

    </div>
  );
})

/**
 * Input field for the time values for a subtitle segment
 */
const TimeInput : React.FC<{
  value: number,
  changeCallback: any,
  generalFieldStyle: SerializedStyles[]
}>= ({
  value,
  changeCallback,
  generalFieldStyle,
}) => {

  // Stores the millisecond value as a string for the input element
  const [myValue, setMyValue] = useState(toHHMMSSMS(value));

  // Update time value if it got changed externally
  useEffect(() => {
    setMyValue(toHHMMSSMS(value))
  }, [value])

  // Update local state with user input
  // Works around "input" being read-only without an onChange callback specified
  const onChange = (event: { target: { value: string; }; }) => {
    const value = event.target.value;
    setMyValue(value);
  };

  // Update state in redux
  // Also fix ill-formatted input
  const onBlur = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    const milliseconds = Math.max(0, getMillisecondsFromHHMMSSMS(value));
    changeCallback({ target: { value: milliseconds } });

    const time = toHHMMSSMS(milliseconds);
    setMyValue(time);
  };

  const timeFieldStyle = css({
    height: '20%',
    width: '100px',
  })

  return (
    <input
      css={[generalFieldStyle, timeFieldStyle]}
      type="text"
      onChange={onChange}
      onBlur={onBlur}
      value={myValue}
     />
  )
}

/**
 * Converts a number into a string with leading zeros
 */
 const fillIn = (val: number) => {
  return val < 10 ? `0${val}` : val
}
const fillInMilliseconds = (val: number) => {
  if (val < 10) {
    return `00${val}`
  } else if (val < 100) {
    return `0${val}`
  } else {
    return val
  }
}

/**
 * Utility function for TimeInpit
 * Converts a number in milliseoncsd to a string of the format HH:MM:SS:MSS
 */
  function toHHMMSSMS (ms: number)  {
  const milliseconds = (ms % 1000)
  , seconds = Math.floor((ms/1000)%60)
  , minutes = Math.floor((ms/(1000*60))%60)
  , hours = Math.floor((ms/(1000*60*60)))

  const millisecondsString = fillInMilliseconds(milliseconds)
  const secondsString = fillIn(seconds)
  const minutesString = fillIn(minutes)
  const hoursString = fillIn(hours)

  return [hoursString, minutesString, secondsString, millisecondsString].join(":")
};

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

  if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3) && isNaN(val3)) {
  // minutes * 60 * 1000 + seconds * 60 + milliseconds
    return val1 * 60 * 1000 + val2 * 1000 + val3;
  }

  if (!isNaN(val1) && !isNaN(val2) && !isNaN(val3) && !isNaN(val3)) {
  // hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 60 + milliseconds
    return val1 * 60 * 60 * 1000 + val2 * 60 * 1000 + val3 * 1000 + val4;
  }

  return 0;
};

export default SubtitleListEditor
