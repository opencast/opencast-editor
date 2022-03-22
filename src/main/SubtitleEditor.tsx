import React, { useEffect } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectCaptions,
} from '../redux/videoSlice'
import { useDispatch, useSelector } from "react-redux";
import { Track } from "../types";
import SubtitleListEditor from "./SubtitleListEditor";
import {
  setIsDisplayEditView,
  selectCurrentlyAt,
  setClickTriggered,
  setCurrentlyAt,
  fetchSubtitle,
  selectErrorByFlavor,
  resetRequestState,
  selectGetStatus,
  selectSelectedSubtitleByFlavor,
  selectSelectedSubtitleFlavor,
  setSubtitle
} from '../redux/subtitleSlice'
import { settings } from "../config";
import SubtitleVideoArea from "./SubtitleVideoArea";
import SubtitleTimeline from "./SubtitleTimeline";
import { useTranslation } from "react-i18next";

/**
 * Displays an editor view for a selected subtitle file
 */
 const SubtitleEditor : React.FC<{}> = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch()
  const getStatus = useSelector(selectGetStatus)
  const getError = useSelector(selectErrorByFlavor)
  const captionTracks = useSelector(selectCaptions) // track objects received from Opencast
  const subtitle = useSelector(selectSelectedSubtitleByFlavor)
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
      dispatch(setSubtitle({identifier: selectedFlavorSubtype, subtitles: []}))
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

  const getTitle = () => {
    return (settings.subtitles.languages !== undefined && subtitle && selectedFlavorSubtype) ?
      settings.subtitles.languages[selectedFlavorSubtype] : t("subtitles.editTitle-loading")
  }

  const subtitleEditorStyle = css({
    display: 'block',
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
    width: '100%',
    height: '5%',
  })

  const subAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '74%',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '10px',
    ...(flexGapReplacementStyle(30, true)),
    borderBottom: '1px solid #BBB',
  })

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

  const render = () => {
    if (getError !== undefined) {
      return (
        <span>{"Subtitle Parsing Error(s): " + getError}</span>
      )
    } else {
      return(
        <>
          <div css={headerRowStyle}>
            <BackButton />
            <div css={[titleStyle, titleStyleBold]}>
              {t("subtitles.editTitle", {title: getTitle()})}
            </div>
            <div css={{width: '50px'}}></div>
          </div>
          <div css={subAreaStyle}>
            <SubtitleListEditor />
            <SubtitleVideoArea />
          </div>
          <SubtitleTimeline
            selectCurrentlyAt={selectCurrentlyAt}
            setCurrentlyAt={setCurrentlyAt}
            setClickTriggered={setClickTriggered}
          />
        </>
      )
    }
  }

  return (
    <div css={subtitleEditorStyle}>
      {render()}
    </div>
  );
}


/**
 * Takes you to a different page
 */
 export const BackButton : React.FC<{}> = () => {

  const { t } = useTranslation();
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
      title={t("subtitles.backButton-tooltip")}
      aria-label={t("subtitles.backButton-tooltip")}
      onClick={ () => dispatch(setIsDisplayEditView(false)) }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        dispatch(setIsDisplayEditView(false))
      }}}>
      <FontAwesomeIcon icon={faChevronLeft} size="1x" />
      <span>{t("subtitles.backButton")}</span>
    </div>
  );
}

export default SubtitleEditor
