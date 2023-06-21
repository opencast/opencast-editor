import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, flexGapReplacementStyle } from "../cssStyles";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  selectSubtitlesFromOpencastById,
} from '../redux/videoSlice'
import { useDispatch, useSelector } from "react-redux";
import SubtitleListEditor from "./SubtitleListEditor";
import {
  setIsDisplayEditView,
  selectSelectedSubtitleById,
  selectSelectedSubtitleId,
  setSubtitle
} from '../redux/subtitleSlice'
import SubtitleVideoArea from "./SubtitleVideoArea";
import SubtitleTimeline from "./SubtitleTimeline";
import { useTranslation } from "react-i18next";
import { selectTheme } from "../redux/themeSlice";
import { parseSubtitle } from "../util/utilityFunctions";
import { ThemedTooltip } from "./Tooltip";
import { generateButtonTitle } from "./SubtitleSelect";

/**
 * Displays an editor view for a selected subtitle file
 */
const SubtitleEditor : React.FC = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch()
  const [getError, setGetError] = useState<string | undefined>(undefined)
  const subtitle = useSelector(selectSelectedSubtitleById)
  const selectedId = useSelector(selectSelectedSubtitleId)
  const captionTrack = useSelector(selectSubtitlesFromOpencastById(selectedId))
  const theme = useSelector(selectTheme)

  // Prepare subtitle in redux
  useEffect(() => {
    // Parse subtitle data from Opencast
    if (subtitle?.cues === undefined && captionTrack !== undefined && captionTrack.subtitle !== undefined && selectedId) {
      try {
        dispatch(setSubtitle({identifier: selectedId, subtitles: { cues: parseSubtitle(captionTrack.subtitle), tags: captionTrack.tags } }))
      } catch (error) {
        if (error instanceof Error) {
          setGetError(error.message)
        } else {
          setGetError(String(error))
        }
      }

    // Or create a new subtitle instead
    } else if (subtitle?.cues === undefined && captionTrack === undefined && selectedId) {
      // Create an empty subtitle
      dispatch(setSubtitle({identifier: selectedId, subtitles: { cues: [], tags: [] }}))
    }
  }, [dispatch, captionTrack, subtitle, selectedId])

  const getTitle = () => {
    if (subtitle) {
      return generateButtonTitle(subtitle.tags, t)
    } else {
      return t("subtitles.editTitle-loading")
    }
  }

  const subtitleEditorStyle = css({
    display: 'flex',
    flexDirection: 'column',
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
  })

  const subAreaStyle = css({
    display: 'flex',
    flexDirection: 'row',
    flexGrow: 1,  // No fixed height, fill available space
    justifyContent: 'space-between',
    alignItems: 'top',
    width: '100%',
    paddingTop: '10px',
    paddingBottom: '10px',
    ...(flexGapReplacementStyle(30, true)),
    borderBottom: `${theme.menuBorder}`
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
      return (
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
          <SubtitleTimeline />
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
export const BackButton : React.FC = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch();

  const backButtonStyle = css({
    width: '50px',
    height: '10px',
    padding: '16px',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
    justifyContent: 'space-around'
  })

  return (
    <ThemedTooltip title={t("subtitles.backButton-tooltip")}>
      <div css={[basicButtonStyle(theme), backButtonStyle]}
        role="button" tabIndex={0}
        aria-label={t("subtitles.backButton-tooltip")}
        onClick={() => dispatch(setIsDisplayEditView(false))}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          dispatch(setIsDisplayEditView(false))
        } }}>
        <FontAwesomeIcon icon={faChevronLeft} size="1x" />
        <span>{t("subtitles.backButton")}</span>
      </div>
    </ThemedTooltip>
  );
}

export default SubtitleEditor
