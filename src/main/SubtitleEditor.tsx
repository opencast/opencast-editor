import React, { useEffect } from "react";
import { css } from "@emotion/react";
import Timeline from "./Timeline";
import ReactPlayer from "react-player";
import { basicButtonStyle } from "../cssStyles";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectCaptions,
} from '../redux/videoSlice'
import { useDispatch, useSelector } from "react-redux";
import { resolve } from "node:path/win32";
import { readBuilderProgram } from "typescript";
import { client } from "../util/client";
import { fetchSubtitle, selectCaption, selectGetError, selectGetStatus } from "../redux/subtitleSlice";
import { Track } from "../types";
import { parseSync, stringifySync } from 'subtitle'

/**
 * Displays a menu for selecting what should be done with the current changes
 */
 const SubtitleEditor : React.FC<{displayEditView: (e: boolean) => void}> = (displayEditView) => {

  const dispatch = useDispatch()
  const getStatus = useSelector(selectGetStatus);
  const getError = useSelector(selectGetError);
  const leCaption = useSelector(selectCaption);

  const selectedFlavorSubtype = "source+en"
  const captions = useSelector(selectCaptions)
  let caption: Track | undefined = undefined

  for (const cap of captions) {
    if (cap.flavor.subtype === selectedFlavorSubtype) {
      caption = cap
    }
  }

  if (!caption) {
    // TODO: Create a new caption
    //  How to save it?
  }

  useEffect(() => {
    if (getStatus === 'idle' && caption !== undefined) {
      dispatch(fetchSubtitle(caption.uri))
    } else if (getStatus === 'failed') {
      // dispatch(getError({error: true, errorMessage: t("video.comError-text"), errorDetails: error}))
    }
  }, [getStatus, dispatch, caption])

  // const fileReader = new FileReader()
  // fileReader.onload = (event) => console.log(event)

  // const reader = (file: string) => {
  //   return new Promise((resolve, reject) => {
  //     const fileReader = new FileReader();
  //     fileReader.onload = () => resolve(fileReader.result);
  //     fileReader.readAsDataURL(file);
  //   })
  // }

  // const readFile = (file: string) => {
  //   reader(file).then(result => console.log(result));
  // }

  // if (caption !== undefined) {
  //   readFile(caption.uri)
  // }

  useEffect(() => {
    if (getStatus === 'success' && leCaption !== undefined) {
      // TODO: Parse caption
      const nodes = parseSync(leCaption)
      console.log(nodes)

      // // do something with your subtitles
      // // ...

      // const output = stringifySync(nodes, { format: 'WebVTT' })
      // console.log(output)
    }
  }, [getStatus, dispatch, leCaption])



  const subtitleEditorStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingRight: '20px',
    paddingLeft: '20px',
    gap: '20px',
    height: '100%',
  })

  const headerRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  })

  const subAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60%',
    width: '100%',
  })

  const videoPlayerAreaStyle = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '40%',
  });

  // Taken from VideoHeader. Maybe generalize this to cssStyles.tsx
  const titleStyle = css({
    display: 'inline-block',
    padding: '15px',
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    maxWidth: '500px',
  })

  const titleStyleBold = css({
    fontWeight: 'bold',
    fontSize: '24px',
    verticalAlign: '-2.5px',
  })

  return (
    <div css={subtitleEditorStyle}>
      <div>{"HEE HOO" + leCaption}</div>
      <div css={headerRowStyle}>
        <BackButton displayEditView={displayEditView.displayEditView}/>
        <div css={[titleStyle, titleStyleBold]}>
          Subtitle Editor - [Language Name]
        </div>
        <div css={{widht: '50px'}}></div>
      </div>
      <div css={subAreaStyle}>
        <SubtitleListEditor />
        <div css={videoPlayerAreaStyle}>
          <SubtitleVideoPlayer />
        </div>
      </div>
      <Timeline />
    </div>
  );
}

const SubtitleListEditor : React.FC<{}> = () => {

  const listStyle = css({
    backgroundColor: 'red',
    height: '100%',
    width: '60%',
  })

  return (
    <div css={listStyle}>
      List View
    </div>
  );
}

const SubtitleVideoPlayer : React.FC<{}> = () => {

  const url = "https://data.lkiesow.io/opencast/test-media/goat.mp4"

  const playerWrapper = css({
    position: 'relative',
    width: '100%',
    paddingTop: '50%',
  });

  const reactPlayerStyle = css({
    position: 'absolute',
    top: 0,
    left: 0,
  })

  const render = () => {
    return(
      <div css={playerWrapper}>
        <ReactPlayer url={url}
          css={reactPlayerStyle}
          controls={true}
          // ref={ref}
          width='100%'
          height='100%'
          // playing={isPlaying}
          // muted={!isPrimary}
          // onProgress={onProgressCallback}
          progressInterval={100}
          // onReady={onReadyCallback}
          // onEnded={onEndedCallback}
          // onError={onErrorCallback}
          tabIndex={-1}
          // config={playerConfig}
          // disablePictureInPicture
        />
      </div>
    );
  }

  return (
    <>
      {render()}
    </>
  );
}


/**
 * Takes you to a different page
 */
 export const BackButton : React.FC<{displayEditView: (e: boolean) => void}> = ({displayEditView}) => {

  const backButtonStyle = css({
    width: '50px',
    height: '10px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, backButtonStyle]}
      role="button" tabIndex={0}
      onClick={ () => displayEditView(false) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        displayEditView(false)
      }}}>
      <FontAwesomeIcon icon={faChevronLeft} size="1x" />
      <span>{"Back"}</span>
    </div>
  );
}

export default SubtitleEditor;
