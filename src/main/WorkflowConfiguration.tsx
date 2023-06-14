import React, { useEffect, useState } from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, errorBoxStyle, flexGapReplacementStyle, spinningStyle } from '../cssStyles'

import { FiLoader, FiCheck, FiAlertCircle, FiChevronLeft, FiDatabase, FiMoreHorizontal} from "react-icons/fi";

import { useDispatch, useSelector } from 'react-redux';
import { selectSegments, selectTracks, setHasChanges as videoSetHasChanges, selectSelectedWorkflowId } from '../redux/videoSlice'
import { postVideoInformationWithWorkflow, selectStatus, selectError } from '../redux/workflowPostAndProcessSlice'

import { PageButton } from './Finish'
import { setEnd } from "../redux/endSlice";

import { useTranslation } from 'react-i18next';
import { postMetadata, selectPostError, selectPostStatus, setHasChanges as metadataSetHasChanges } from "../redux/metadataSlice";
import { AppDispatch } from "../redux/store";
import { selectSubtitles } from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { Flavor } from "../types";
import { selectTheme } from "../redux/themeSlice";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration : React.FC = () => {

  const { t } = useTranslation();

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)
  const postMetadataStatus = useSelector(selectPostStatus);
  const postMetadataError = useSelector(selectPostError);
  const theme = useSelector(selectTheme);

  const workflowConfigurationStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={workflowConfigurationStyle}>
      <h2>{t("workflowConfig.headline-text")}</h2>
      <FiMoreHorizontal css={{fontSize: 80}} />
      Placeholder
      <div>{t("workflowConfig.satisfied-text")}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label={t("various.goBack-button")} Icon={FiChevronLeft}/>
        <SaveAndProcessButton text={t("workflowConfig.confirm-button")}/>
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postAndProcessError ? t("various.error-details-text", {errorMessage: postAndProcessError}) : t("various.error-text")}<br/>
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
 * and starts the selected workflow
 */
export const SaveAndProcessButton: React.FC<{text: string}> = ({text}) => {

  // Initialize redux variables
  const dispatch = useDispatch<AppDispatch>()

  const selectedWorkflowId = useSelector(selectSelectedWorkflowId)
  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const subtitles = useSelector(selectSubtitles)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);
  const theme = useSelector(selectTheme);

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === 'success' && metadataStatus === 'success') {
      dispatch(setEnd({hasEnded: true, value: 'success'}))
      dispatch(videoSetHasChanges(false))
      dispatch(metadataSetHasChanges(false))
    }
  }, [dispatch, metadataStatus, workflowStatus])

  const prepareSubtitles = () => {
    const subtitlesForPosting = []

    for (const identifier in subtitles) {
      const flavor: Flavor = {type: identifier.split("/")[0], subtype: identifier.split("/")[1]}
      subtitlesForPosting.push({flavor: flavor, subtitle: serializeSubtitle(subtitles[identifier])})

    }
    return subtitlesForPosting
  }

  // Dispatches first save request
  // Subsequent save requests should be wrapped in useEffect hooks,
  // so they are only sent after the previous one has finished
  const saveAndProcess = () => {
    setMetadataSaveStarted(true)
    dispatch(postMetadata())
  }

  // Subsequent save request
  useEffect(() => {
    if (metadataStatus === 'success' && metadataSaveStarted) {
      setMetadataSaveStarted(false)
      dispatch(postVideoInformationWithWorkflow({
        segments: segments,
        tracks: tracks,
        workflow: [{id: selectedWorkflowId}],
        subtitles: prepareSubtitles()
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStatus])

  // Update based on current fetching status
  let Icon = FiDatabase
  let spin = false
  if (workflowStatus === 'failed' || metadataStatus === 'failed') {
    Icon = FiAlertCircle
    spin = false
  } else if (workflowStatus === 'success' && metadataStatus === 'success') {
    Icon = FiCheck
    spin = false
  } else if (workflowStatus === 'loading' || metadataStatus === 'loading') {
    Icon = FiLoader
    spin = true

  }

  const saveButtonStyle = css({
    padding: '16px',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  })

  return (
    <div css={[basicButtonStyle(theme), saveButtonStyle]}
      role="button" tabIndex={0}
      onClick={saveAndProcess}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        saveAndProcess()
      } }}>
      <Icon css={spin ? spinningStyle : undefined}/>
      <span>{text}</span>
    </div>
  );
}

export default WorkflowConfiguration;
