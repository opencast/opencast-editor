import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, errorBoxStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";
import { faSpinner, faCheck, faExclamationCircle, faChevronLeft, faFileExport } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, selectSegments, selectTracks, } from '../redux/videoSlice'
import { postVideoInformationWithWorkflow, selectStatus, selectError } from '../redux/workflowPostAndProcessSlice'

import { PageButton } from './Finish'
import { setEnd } from "../redux/endSlice";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { postMetadata, selectPostError, selectPostStatus } from "../redux/metadataSlice";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration : React.FC<{}> = () => {

  const { t } = useTranslation();

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)
  const postMetadataStatus = useSelector(selectPostStatus);
  const postMetadataError = useSelector(selectPostError);

  const workflowConfigurationStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={workflowConfigurationStyle} title={t("workflowConfig.area-tooltip")}>
      <h2>{t("workflowConfig.headline-text")}</h2>
      <FontAwesomeIcon icon={faTools} size="10x" />
      Placeholder
      <div>{t("workflowConfig.satisfied-text")}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label={t("various.goBack-button")} iconName={faChevronLeft}/>
        <SaveAndProcessButton text={t("workflowConfig.confirm-button")}/>
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus === "failed")} title="Error Box" role="alert">
        <span>{t("various.error-text")}</span><br />
        {postAndProcessError ? t("various.error-details-text", {errorMessage: postAndProcessError}) : t("various.error-noDetails-text")}<br/>
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
 * and starts the selected workflow
 */
export const SaveAndProcessButton: React.FC<{text: string}> = ({text}) => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const workflows = useSelector(selectWorkflows)
  const selectedWorkflowIndex = useSelector(selectSelectedWorkflowIndex)
  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);

  const saveAndProcess = () => {
    dispatch(postMetadata())
    dispatch(postVideoInformationWithWorkflow({
      segments: segments,
      tracks: tracks,
      workflow: [{id: workflows[selectedWorkflowIndex].id}],
    }))
  }

  // Update based on current fetching status
  let icon = faFileExport
  let spin = false
  if (workflowStatus === 'failed' || metadataStatus === 'failed') {
    icon = faExclamationCircle
    spin = false
  } else if (workflowStatus === 'success' && metadataStatus === 'success') {
    icon = faCheck
    spin = false
    dispatch(setEnd({hasEnded: true, value: 'success'}))
  } else if (workflowStatus === 'loading' || metadataStatus === 'loading') {
    icon = faSpinner
    spin = true

  }

  const saveButtonStyle = css({
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  })

  return (
    <div css={[basicButtonStyle, saveButtonStyle]} title={"Start processing button"}
      role="button" tabIndex={0}
      onClick={ saveAndProcess }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        saveAndProcess()
      }}}>
      <FontAwesomeIcon  icon={icon} spin={spin} size="1x"/>
      <span>{text}</span>
    </div>
  );
}

export default WorkflowConfiguration;
