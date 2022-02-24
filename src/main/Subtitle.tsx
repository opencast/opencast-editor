import React from "react";
import { css } from "@emotion/react";
import SubtitleEditor from "./SubtitleEditor";
import SubtitleSelect from "./SubtitleSelect";
import { useSelector } from "react-redux";
import { selectIsDisplayEditView } from "../redux/subtitleSlice";

const Subtitle : React.FC<{}> = () => {

  const displayEditView = useSelector(selectIsDisplayEditView)

  const pageSelectStyle = css({
    display: !displayEditView ? 'block' :'none',
  })

  const pageEditStyle = css({
    display: displayEditView ? 'block' :'none',
    height: '100%',
  })

  return (
    <>
      <div css={pageSelectStyle} >
        <SubtitleSelect />
      </div>
      <div css={pageEditStyle} >
        <SubtitleEditor />
      </div>
    </>
  );
}

export default Subtitle;
