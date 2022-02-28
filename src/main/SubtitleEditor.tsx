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
import { fetchSubtitle, resetRequestState, selectGetError, selectGetStatus, selectSelectedSubtitleByFlavor, selectSelectedSubtitleFlavor, setSubtitle } from "../redux/subtitleSlice";
import { setIsDisplayEditView } from "../redux/subtitleSlice";
import { Track } from "../types";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
 const SubtitleEditor : React.FC<{}> = () => {

  const dispatch = useDispatch()
  const getStatus = useSelector(selectGetStatus)
  const getError = useSelector(selectGetError)
  const captionTracks = useSelector(selectCaptions) // track objects received from Opencast
  const subtitle = useSelector(selectSelectedSubtitleByFlavor)

  // let selectedFlavorSubtype = "source+en"
  const selectedFlavorSubtype = useSelector(selectSelectedSubtitleFlavor)
  let captionTrack: Track | undefined = undefined   // track object received from Opencast

  // If subtitle is not in our redux store, dynamically fetch it
  // First, Get the correct captions url
  // TODO: Turn this into a redux selector, possibly by figuring out "currying"
  if (subtitle === undefined) {
    for (const cap of captionTracks) {
      if (cap.flavor.subtype === selectedFlavorSubtype) {
        captionTrack = cap
      }
    }
  }

  useEffect(() => {
    // Instigate fetching caption data from Opencast
    if (getStatus === 'idle' && subtitle === undefined && captionTrack !== undefined && selectedFlavorSubtype) {
      dispatch(fetchSubtitle({identifier: selectedFlavorSubtype, uri: captionTrack.uri}))
    // Or create a new subtitle instead
    } else if (getStatus === 'idle' && subtitle === undefined && captionTrack === undefined && selectedFlavorSubtype) {
      // Create an empty subtitle
      dispatch(setSubtitle({identifier: selectedFlavorSubtype, subtitle: {}}))
      // Reset request
      dispatch(resetRequestState())
    // Error while fetching
    } else if (getStatus === 'failed') {
      // TODO: Smart error handling
      // dispatch(setError({error: true, errorMessage: t("video.comError-text"), errorDetails: error}))
      // Reset request
      dispatch(resetRequestState())
    } else if (getStatus === 'success') {
      // Reset request
      dispatch(resetRequestState())
    }
  }, [getStatus, dispatch, captionTrack, subtitle, selectedFlavorSubtype])

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
    height: '100%',
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
      {/* TODO: Remove example visualization */}
      <div>{"HEE HO" + subtitle?.identifier}</div>
      <div>
        {subtitle?.subtitle.map((cue: any, index: number) =>
          <span key={index}>{cue.text}</span>
        )}
      </div>
      <span>{getError}</span>
      <div css={headerRowStyle}>
        <BackButton />
        <div css={[titleStyle, titleStyleBold]}>
          Subtitle Editor - [Language Name]
        </div>
        <div css={{width: '50px'}}></div>
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
 export const BackButton : React.FC<{}> = () => {

  const dispatch = useDispatch();

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
      onClick={ () => dispatch(setIsDisplayEditView(false)) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        dispatch(setIsDisplayEditView(false))
      }}}>
      <FontAwesomeIcon icon={faChevronLeft} size="1x" />
      <span>{"Back"}</span>
    </div>
  );
}

export default SubtitleEditor
