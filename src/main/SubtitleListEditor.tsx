import { css } from "@emotion/react"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect } from "react"
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
  const defaultSegmentLength = 5

  // Automatically create a segment if there are no segments
  useEffect(() => {
    if (subtitle && subtitle.subtitles.length === 0) {
      dispatch(addCueAtIndex({identifier: subtitle.identifier, cueIndex: 0, text: "", startTime: 0, endTime: defaultSegmentLength}))
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
    paddingTop: '10px',  // Else the select highlighting gets cut off
    paddingBottom: '10px',
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

  const updateCue = (event: { target: { value: any } }) => {
    dispatch(setCueAtIndex({identifier: identifier, cueIndex: dataKey, cue: {id: cue.id, text: event.target.value, startTime: cue.startTime, endTime: cue.endTime}}))
  };

  const addCueAbove = () => {
    dispatch(addCueAtIndex({identifier: identifier, cueIndex: dataKey, text: "", startTime: cue.startTime - defaultSegmentLength, endTime: cue.startTime}))
  }

  const addCueBelow = () => {
    dispatch(addCueAtIndex({identifier: identifier, cueIndex: dataKey + 1, text: "", startTime: cue.endTime, endTime: cue.endTime + defaultSegmentLength}))
  }

  const deleteCue = () => {
    dispatch(removeCue({identifier: identifier, cue: cue}))
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
    boxShadow: '0 0 1px rgba(0, 0, 0, 0.3)',
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

  const timeFieldStyle = css({
    height: '20%',
    width: '100px',
  })

  const addSegmentButtonStyle = css({
    // maxWidth: '35px',
    // maxHeight: '15px',
    width: '32px',
    height: '32px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    zIndex: '1000',
  })

  return (
    <div css={segmentStyle}>

      <textarea
        css={[fieldStyle, textFieldStyle]}
        name={"test"}
        defaultValue={cue.text}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === "Enter") {
          // TODO: Focus the textarea in the new segment
          event.preventDefault()
          addCueAbove()
        }}}
        onChange={updateCue}
      />
      <div css={timeAreaStyle}>
        <input css={[fieldStyle, timeFieldStyle]} id={"start"} type={"text"} defaultValue={cue.startTime}></input>
        <input css={[fieldStyle, timeFieldStyle]} id={"end"} type={"text"} defaultValue={cue.endTime}></input>
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
      {/* <input id={"end"} type={"text"} value={end} onInput={e => setEnd((e.target as HTMLInputElement).value)}></input> */}
    </div>
  );
}

export default SubtitleListEditor
