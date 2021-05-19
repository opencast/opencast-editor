import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle,
  nagivationButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faExclamationCircle, faChevronLeft, faSave,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectSegments, selectTracks } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'

import { PageButton } from './Finish'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { postMetadata, selectPostError, selectPostStatus } from "../redux/metadataSlice";

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

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={saveStyle} title={t("save.saveArea-tooltip")}>
      <h1>{t("save.headline-text")}</h1>
      <span css={{maxWidth: '500px'}}>
        {t("save.info-text")}
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label={t("various.goBack-button")} iconName={faChevronLeft}/>
        <SaveButton />
      </div>
      <div css={errorBoxStyle(postWorkflowStatus === "failed")} title="Error Box" role="alert">
        <span>{t("various.error-text")}</span><br />
        {postError ? t("various.error-details-text", {errorMessage: postError}) : t("various.error-noDetails-text")}<br />
      </div>
      <div css={errorBoxStyle(postMetadataStatus === "failed")} title="Error Box" role="alert">
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

  const save = () => {
    dispatch(postMetadata())
    dispatch(postVideoInformation({
      segments: segments,
      tracks: tracks,
    }))
  }

  return (
    <div css={[basicButtonStyle, nagivationButtonStyle]} title={tooltip}
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
