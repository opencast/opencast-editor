import { css } from "@emotion/react"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect } from "react"
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles"

/**
 * Displays everything needed to edit subtitles
 */
 const SubtitleListEditor : React.FC<{}> = () => {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dummyData : [string, string, string][] = [
    ["", "", ""],
    ["Bla", "00:00:00.000", "00:00:03.000"],
    ["Fischers Frizt fischt frische Fische. Frische Fische fischt Fischers Fritz!", "00:00:05.000", "00:00:07.000"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]

  // Automatically create a segment if there are no segments
  useEffect(() => {
    if (dummyData.length === 0) {
      // TODO: Actually create a segment here
      console.log("TODO: Create a segment")
    }
  }, [dummyData])

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
        {dummyData.map((item, i) => {
          return (
            <SubtitleListSegment textInit={item[0]} startInit={item[1]} endInit={item[2]} key={i}/>
          )
        })}
      </div>
    </div>
  );
}

/**
 * A single subtitle segment
 */
const SubtitleListSegment : React.FC<{textInit: string, startInit: string, endInit: string}> = ({textInit, startInit, endInit}) => {

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

      <textarea css={[fieldStyle, textFieldStyle]} name={"test"} defaultValue={textInit}></textarea>
      <div css={timeAreaStyle}>
        <input css={[fieldStyle, timeFieldStyle]} id={"start"} type={"text"} value={startInit}></input>
        <input css={[fieldStyle, timeFieldStyle]} id={"end"} type={"text"} value={endInit}></input>
      </div>

      <div css={functionButtonAreaStyle} className="functionButtonAreaStyle">
        <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div>
        {/* <div></div> */}
        <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faTrash} size="1x" />
        </div>
        <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div>
      </div>
      {/* <input id={"end"} type={"text"} value={end} onInput={e => setEnd((e.target as HTMLInputElement).value)}></input> */}
    </div>
  );
}

export default SubtitleListEditor
