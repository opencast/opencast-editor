import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle, nagivationButtonStyle } from '../cssStyles'

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
import { Trans } from "react-i18next";

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save : React.FC<{}> = () => {

  const { t } = useTranslation();

  const finishState = useSelector(selectFinishState)

  const postWorkflowStatus = useSelector(selectStatus);
  const postError = useSelector(selectError)

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '30px',
  })

  return (
    <div css={saveStyle} title={t("save-saveArea-tooltip")}>
      <h1>{t("save-headline-text")}</h1>
      <span css={{maxWidth: '500px'}}>
        {t("save-info-text")}
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label={t("goBack-button")} iconName={faChevronLeft}/>
        <SaveButton />
      </div>
      <div css={errorBoxStyle(postWorkflowStatus === "failed")} title="Error Box" role="alert">
        <span>{t("save-error-text")}</span><br />
        {postError ? <Trans i18nKey="save-error-details-text">"Details: " {{posterror: postError}}</Trans> : t("save-error-noDetails-text")}<br />
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

  // Update based on current fetching status
  let icon = faSave
  let spin = false
  let tooltip = t("save-confirmButton-default-tooltip")
  if (workflowStatus === 'loading') {
    icon = faSpinner
    spin = true
    tooltip = t("save-confirmButton-attempting-tooltip")
  } else if (workflowStatus === 'success') {
    icon = faCheck
    spin = false
    tooltip = t("save-confirmButton-success-tooltip")
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
    spin = false
    tooltip = t("save-confirmButton-failed-tooltip")
  }

  const ariaSaveUpdate = () => {
    if(workflowStatus === 'success') {
      return t("save-success-tooltip-aria")
    }
  }

  const save = () => {
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
      <span>{t("save-confirm-button")}</span>
      <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
    </div>
  );
}


export default Save;
