import React from "react";
import SubtitleEditor from "./SubtitleEditor";
import SubtitleSelect from "./SubtitleSelect";
import { useSelector } from "react-redux";
import { selectIsDisplayEditView } from "../redux/subtitleSlice";

const Subtitle : React.FC<{}> = () => {

  const displayEditView = useSelector(selectIsDisplayEditView)

  const render = () => {
    if (displayEditView) {
      return (
        <SubtitleSelect />

      )
    } else {
      return (
        <SubtitleEditor />
      )
    }
  }

  return (
    <>
      {render()}
    </>
  );
}

export default Subtitle;
