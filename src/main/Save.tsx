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
import { selectSegments, selectTracks, setHasChanges as videoSetHasChanges } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'

import { PageButton } from './Finish'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { postMetadata, selectPostError, selectPostStatus, setHasChanges as metadataSetHasChanges } from "../redux/metadataSlice";
import { selectTheme } from "../redux/themeSlice";

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

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  const render = () => {
    // Post (successful) save
    if (postWorkflowStatus === 'success' && postMetadataStatus === 'success') {
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
    <div css={saveStyle} title={t("save.saveArea-tooltip")}>
      <h1>{t("save.headline-text")}</h1>
      {render()}
      <div css={errorBoxStyle(postWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postError ? t("various.error-details-text", {errorMessage: postError}) : t("various.error-noDetails-text")}<br />
      </div>
      <div css={errorBoxStyle(postMetadataStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postMetadataError ? t("various.error-details-text", {errorMessage: postMetadataError}) : t("various.error-noDetails-text")}<br />
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
  const dispatch = useDispatch()

  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);
  const theme = useSelector(selectTheme);
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);

  // Update based on current fetching status
  let icon = faSave
  let spin = false
  let tooltip = t("save.confirmButton-default-tooltip")
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
      console.log("EDIT")
      dispatch(postVideoInformation({
        segments: segments,
        tracks: tracks,
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
    <div css={[basicButtonStyle, navigationButtonStyle(theme)]} title={tooltip}
      role="button" tabIndex={0}
      onClick={ save }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        save()
      }}}>
      <FontAwesomeIcon icon={icon} spin={spin} size="1x"/>
      <span>{t("save.confirm-button")}</span>
      <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
    </div>
  );
}


export default Save;
