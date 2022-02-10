import React from "react";
import { css } from "@emotion/react";
import { useState } from "react";
import SubtitleEditor from "./SubtitleEditor";
import SubtitleSelect from "./SubtitleSelect";

const Subtitle : React.FC<{}> = () => {

  const [displayEditView, setDisplayEditView] = useState(false);

  const pageSelectStyle = css({
    display: !displayEditView ? 'block' :'none',
  })

  const pageEditStyle = css({
    display: displayEditView ? 'block' :'none',
    height: '100%',
  })

  const setEditViewCallback = (displayEditView: boolean) => {
    console.log("Callback called: " + displayEditView)
    setDisplayEditView(displayEditView);
  }

  return (
    <>
      <div css={pageSelectStyle} >
        <SubtitleSelect displayEditView={setEditViewCallback}/>
      </div>
      <div css={pageEditStyle} >
        <SubtitleEditor displayEditView={setEditViewCallback}/>
      </div>
    </>
  );
}

export default Subtitle;
