import { css, SerializedStyles } from "@emotion/react"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles"
import { addCueAtIndex, removeCue, selectSelectedSubtitleByFlavor, setCueAtIndex } from "../redux/subtitleSlice"
import { SubtitleCue } from "../types"

/**
 * Displays everything needed to edit subtitles
 */
 const SubtitleListEditor : React.FC<{}> = () => {

  const dispatch = useDispatch()

  const subtitle = useSelector(selectSelectedSubtitleByFlavor)
  const defaultSegmentLength = 5000

  // Automatically create a segment if there are no segments
  useEffect(() => {
    if (subtitle && subtitle.subtitles.length === 0) {
      dispatch(addCueAtIndex({
        identifier: subtitle.identifier,
        cueIndex: 0,
        text: "",
        startTime: 0,
        endTime: defaultSegmentLength
      }))
    }
  }, [dispatch, subtitle])

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
        {subtitle?.subtitles.map((item, i) => {
          return (
            <SubtitleListSegment
              identifier={subtitle.identifier}
              dataKey={i}
              cue={item}
              defaultSegmentLength={defaultSegmentLength}
              key={item.id}
            />
          )
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
}>= ({
  identifier,
  dataKey,
  cue,
  defaultSegmentLength,
}) => {

  const dispatch = useDispatch()

  const updateCueText = (event: { target: { value: any } }) => {
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: dataKey,
      newCue: {id: cue.id, text: event.target.value, startTime: cue.startTime, endTime: cue.endTime, tree: cue.tree}
    }))
  };

  const updateCueStart = (event: { target: { value: any } }) => {
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: dataKey,
      newCue: {id: cue.id, text: cue.text, startTime: event.target.value, endTime: cue.endTime, tree: cue.tree}
    }))
  };

  const updateCueEnd = (event: { target: { value: any } }) => {
    console.log("updateCueEnd: " + event.target.value)
    dispatch(setCueAtIndex({
      identifier: identifier,
      cueIndex: dataKey,
      newCue: {id: cue.id, text: cue.text, startTime: cue.startTime, endTime: event.target.value, tree: cue.tree}
    }))
  };

  const addCueAbove = () => {
    dispatch(addCueAtIndex({identifier: identifier,
      cueIndex: dataKey,
      text: "",
      startTime: cue.startTime - defaultSegmentLength,
      endTime: cue.startTime
    }))
  }

  const addCueBelow = () => {
    dispatch(addCueAtIndex({
      identifier: identifier,
      cueIndex: dataKey + 1,
      text: "",
      startTime: cue.endTime,
      endTime: cue.endTime + defaultSegmentLength
    }))
  }

  const deleteCue = () => {
    dispatch(removeCue({
      identifier: identifier,
      cue: cue
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

  return (
    <div css={segmentStyle}>

      <textarea
        css={[fieldStyle, textFieldStyle]}
        defaultValue={cue.text}
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
            css({...(cue.startTime > cue.endTime && {borderColor: 'red'}) })]}
          value={cue.startTime}
          changeCallback={updateCueStart}
        />
        <TimeInput
          generalFieldStyle={[fieldStyle,
            css({...(cue.startTime > cue.endTime && {borderColor: 'red'}) })]}
          value={cue.endTime}
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
}

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

  /**
   * Converts a number into a string with leading zeros
   */
  const fillIn = (val: number) => {
    return val < 10 ? `0${val}` : val
  }
  const fillInMilliseconds = (val: number) => {
    console.log("val: " + val)
    if (val < 10) {
      return `00${val}`
    } else if (val < 100) {
      return `0${val}`
    } else {
      return val
    }
  }

  /**
   * Converts a number in milliseoncsd to a string of the format HH:MM:SS:MSS
   */
  const toHHMMSSMS = (ms: number) => {
    const milliseconds = (ms % 1000)
    , seconds = Math.floor((ms/1000)%60)
    , minutes = Math.floor((ms/(1000*60))%60)
    , hours = Math.floor((ms/(1000*60*60)))
    console.log(milliseconds)
    console.log(seconds)
    console.log(minutes)
    console.log(hours)

    const millisecondsString = fillInMilliseconds(milliseconds)
    const secondsString = fillIn(seconds)
    const minutesString = fillIn(minutes)
    const hoursString = fillIn(hours)

    return [hoursString, minutesString, secondsString, millisecondsString].join(":")
  };

  // Stores the millisecond value as a string for the input element
  const [myValue, setMyValue] = useState(toHHMMSSMS(value));

  /**
   * Converts a string of the format HH:MM:SS:MSS to a millisecond number
   */
  const getMillisecondsFromHHMMSSMS = (value: string) => {
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

export default SubtitleListEditor
