import React, { useEffect, useState } from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle,
  navigationButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faExclamationCircle, faChevronLeft, faSave, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectHasChanges, selectSegments, selectTracks, setHasChanges as videoSetHasChanges } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'

import { PageButton } from './Finish'

import { useTranslation } from 'react-i18next';
import { AppDispatch } from "../redux/store";
import { postMetadata, selectPostError, selectPostStatus, setHasChanges as metadataSetHasChanges,
  selectHasChanges as metadataSelectHasChanges } from "../redux/metadataSlice";
import { selectSubtitles } from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { Flavor } from "../types";
import { selectTheme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save : React.FC<{}> = () => {

  const { t } = useTranslation();

  const finishState = useSelector(selectFinishState)

  const postWorkflowStatus = useSelector(selectStatus);
  const postError = useSelector(selectError)
  const postMetadataStatus = useSelector(selectPostStatus);
  const postMetadataError = useSelector(selectPostError);
  const theme = useSelector(selectTheme);
  const metadataHasChanges = useSelector(metadataSelectHasChanges)
  const hasChanges = useSelector(selectHasChanges)

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  const render = () => {
    // Post (successful) save
    if (postWorkflowStatus === 'success' && postMetadataStatus === 'success'
      && !hasChanges && !metadataHasChanges) {
      return(
        <>
          <FontAwesomeIcon icon={faCheckCircle} size="10x" />
          <div>{t("save.success-text")}</div>
        </>
      )
    // Pre save
    } else {
      return (
        <>
          <span css={{maxWidth: '500px'}}>
            {t("save.info-text")}
          </span>
          <div css={backOrContinueStyle}>
            <PageButton pageNumber={0} label={t("various.goBack-button")} iconName={faChevronLeft}/>
            <SaveButton />
          </div>
        </>
      )
    }
  }

  return (
    <div css={saveStyle}>
      <h1>{t("save.headline-text")}</h1>
      {render()}
      <div css={errorBoxStyle(postWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postError ? t("various.error-details-text", {errorMessage: postError}) : t("various.error-text")}<br />
      </div>
      <div css={errorBoxStyle(postMetadataStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postMetadataError ? t("various.error-details-text", {errorMessage: postMetadataError}) : t("various.error-text")}<br />
      </div>
    </div>
  );
}

/**
 * Button that sends a post request to save current changes
 */
export const SaveButton: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Initialize redux variables
  const dispatch = useDispatch<AppDispatch>()

  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const subtitles = useSelector(selectSubtitles)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);
  const theme = useSelector(selectTheme);
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);

  // Update based on current fetching status
  let icon = faSave
  let spin = false
  let tooltip = null
  if (workflowStatus === 'failed' || metadataStatus === 'failed'){
    icon = faExclamationCircle
    spin = false
    tooltip = t("save.confirmButton-failed-tooltip")
  } else if (workflowStatus === 'success' && metadataStatus === 'success') {
    icon = faCheck
    spin = false
    tooltip = t("save.confirmButton-success-tooltip")
  } else if (workflowStatus === 'loading' || metadataStatus === 'loading')  {
    icon = faSpinner
    spin = true
    tooltip = t("save.confirmButton-attempting-tooltip")
  }

  const ariaSaveUpdate = () => {
    if(workflowStatus === 'success') {
      return t("save.success-tooltip-aria")
    }
  }

  const prepareSubtitles = () => {
    const subtitlesForPosting = []

    for (const identifier in subtitles) {
      let flavor: Flavor = {type: identifier.split("/")[0], subtype: identifier.split("/")[1]}
      subtitlesForPosting.push({flavor: flavor, subtitle: serializeSubtitle(subtitles[identifier])})

    }
    return subtitlesForPosting
  }

  // Dispatches first save request
  // Subsequent save requests should be wrapped in useEffect hooks,
  // so they are only sent after the previous one has finished
  const save = () => {
    setMetadataSaveStarted(true)
    dispatch(postMetadata())
  }

  // Subsequent save request
  useEffect(() => {
    if (metadataStatus === 'success' && metadataSaveStarted) {
      setMetadataSaveStarted(false)
      dispatch(postVideoInformation({
        segments: segments,
        tracks: tracks,
        subtitles: prepareSubtitles()
      }))

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStatus])

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === 'success' && metadataStatus === 'success') {
      dispatch(videoSetHasChanges(false))
      dispatch(metadataSetHasChanges(false))
    }
  }, [dispatch, metadataStatus, workflowStatus])

  return (
    <ThemedTooltip title={tooltip == null ? tooltip = "" : tooltip}>
      <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={ save }
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          save()
        }}}>
        <FontAwesomeIcon icon={icon} spin={spin} size="1x"/>
        <span>{t("save.confirm-button")}</span>
        <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
      </div>
    </ThemedTooltip>
  );
}


export default Save;
