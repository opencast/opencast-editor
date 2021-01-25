import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, errorBoxStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";
import { faSpinner, faCheck, faExclamationCircle, faChevronLeft, faFileExport } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, selectSegments, selectTracks, } from '../redux/videoSlice'
import { postVideoInformationWithWorkflow, selectStatus, selectError } from '../redux/workflowPostAndProcessSlice'

import { PageButton } from './Finish'
import { setEnd } from "../redux/endSlice";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration : React.FC<{}> = () => {

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)

  const workflowConfigurationStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    gap: '30px',
  })

  return (
    <div css={workflowConfigurationStyle} title="Workflow Configuration Area">
      <h2>Workflow Configuration</h2>
      <FontAwesomeIcon icon={faTools} size="10x" />
      Placeholder
      <div>Satisfied with your configuration?</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label="No, take me back" iconName={faChevronLeft}/>
        <SaveAndProcessButton text="Yes, start processing"/>
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus === "failed")} title="Error Box" role="alert">
        <span>An error has occured. Please wait a bit and try again.</span><br />
        {postAndProcessError ? "Details: " + postAndProcessError : "No error details are available."}<br />
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

  const saveAndProcess = () => {
    dispatch(postVideoInformationWithWorkflow({
      segments: segments,
      tracks: tracks,
      workflow: [{id: workflows[selectedWorkflowIndex].id}],
    }))
  }

  // Update based on current fetching status
  let icon = faFileExport
  let spin = false
  if (workflowStatus === 'loading') {
    icon = faSpinner
    spin = true
  } else if (workflowStatus === 'success') {
    icon = faCheck
    spin = false
    dispatch(setEnd({hasEnded: true, value: 'success'}))
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
    spin = false
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
