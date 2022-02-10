import { css } from "@emotion/react";
import { useState } from "react";
import SubtitleSelect from "./SubtitleSelect";

const Subtitle : React.FC<{}> = () => {

  const [displayEditView, setDisplayEditView] = useState(false);

  const pageSelectStyle = css({
    display: !displayEditView ? 'block' :'none',
  })

  const pageEditStyle = css({
    display: displayEditView ? 'block' :'none',
  })

  const setEditViewCallback = (displayEditView: boolean) => {
    console.log("Callback called: " + displayEditView)
    setDisplayEditView(displayEditView);
  }

  return (
    <div>
      <div css={pageSelectStyle} >
        <SubtitleSelect displayEditView={setEditViewCallback}/>
      </div>
      <div css={pageEditStyle} >
        {/* <SubtitleEdit /> */}
      </div>
    </div>
  );
}

export default Subtitle;
