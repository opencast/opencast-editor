import { css } from "@emotion/react"
import { faArrowDown, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles"

/**
 * Displays everything needed to edit subtitles
 */
 const SubtitleListEditor : React.FC<{}> = () => {

  const dummyData : [string, string, string][] = [
    ["", "", ""],
    ["Bla", "00:00:00.000", "00:00:03.000"],
    ["Fischers Frizt fischt frische Fische. Frische Fische fischt Fischers Fritz!", "00:00:05.000", "00:00:07.000"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]

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
    paddingTop: '2px',  // Else the select highlighting gets cut off
    paddingBottom: '2px',
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
    height: '100px',
    ...(flexGapReplacementStyle(20, false)),
  })

  const timeAreaStyle = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  })

  // const functionButtonAreaStyle = css({
  //   display: 'grid',
  //   gridTemplateRows: '[row1-start] 20% [row1-end] 50% [third-line] 20% [last-line]',
  //   // gridTemplateRows: '[row1-start] 50% [row1-end] 50% [last-line]',
  //   gridTemplateColumns: 'repeat(2, 50%)',
  //   placeitems: 'center',
  //   gridGap: '10px',
  //   flexGrow: '1',
  //   minWidth: '50px',
  // })

  const functionButtonAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    ...(flexGapReplacementStyle(10, false)),
    flexGrow: '1',
    minWidth: '50px',
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
    maxWidth: '35px',
    maxHeight: '15px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    // gridRow: 'row1-end',
  })

  return (
    <div css={segmentStyle}>
      <textarea css={[fieldStyle, textFieldStyle]} name={"test"} defaultValue={textInit}></textarea>
      <div css={functionButtonAreaStyle}>
        {/* <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faArrowUp} size="1x" />
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div> */}
        <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faTrash} size="1x" />
        </div>
        <div css={[basicButtonStyle, addSegmentButtonStyle]}>
          <FontAwesomeIcon icon={faArrowDown} size="1x" />
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </div>
      </div>
      <div css={timeAreaStyle}>
        <input css={[fieldStyle, timeFieldStyle]} id={"start"} type={"text"} value={startInit}></input>
        <input css={[fieldStyle, timeFieldStyle]} id={"end"} type={"text"} value={endInit}></input>
      </div>
      {/* <input id={"end"} type={"text"} value={end} onInput={e => setEnd((e.target as HTMLInputElement).value)}></input> */}
    </div>
  );
}

export default SubtitleListEditor
