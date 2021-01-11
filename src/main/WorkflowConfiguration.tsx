import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle } from '../cssStyles'
import { mediaPackageId, ocUrl } from '../config'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";
import { faSpinner, faCheck, faExclamationCircle, faChevronLeft, faFileExport } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, selectSegments, selectTracks, } from '../redux/videoSlice'
import { postVideoInformationWithWorkflow, selectStatus, selectError } from '../redux/workflowPostAndProcessSlice'

import { PageButton } from './Finish'

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

  const errorBoxStyle = css({
    ...(postAndProcessWorkflowStatus !== 'failed') && {display: "none"},
    borderColor: 'red',
    borderStyle: 'dashed',
    fontWeight: 'bold',
    padding: '10px',
  })

  return (
    <div css={workflowConfigurationStyle} title="Workflow Configuration Area">
      <h2>Workflow Configuration</h2>
      <FontAwesomeIcon icon={faTools} size="10x" />
      Placeholder
      <div>Satisfied with your configuration?</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label="No, take me back" iconName={faChevronLeft}/>
        <SaveAndProcessButton />
      </div>
      <div css={errorBoxStyle} title="Error Box">
        <span>An error has occured. Please wait a bit and try again. Details: </span><br />
        {postAndProcessError}
      </div>
    </div>
  );

}

/**
 * Button that sends a post request to save current changes
 * and starts the selected workflow
 */
const SaveAndProcessButton: React.FC<{}> = () => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const workflows = useSelector(selectWorkflows)
  const selectedWorkflowIndex = useSelector(selectSelectedWorkflowIndex)
  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const workflowStatus = useSelector(selectStatus);

  // Update based on current fetching status
  let icon = faFileExport
  let spin = false
  if (workflowStatus === 'loading') {
    icon = faSpinner
    spin = true
  } else if (workflowStatus === 'success') {
    icon = faCheck
    spin = false
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
      onClick={() =>
        dispatch(postVideoInformationWithWorkflow({
          segments: segments,
          tracks: tracks,
          mediaPackageId: mediaPackageId,
          ocUrl: ocUrl,
          workflowID: [workflows[selectedWorkflowIndex]],
        }))
      }>
      <FontAwesomeIcon  icon={icon} spin={spin} size="1x"/>
      <span>{"Yes, start processing"}</span>
    </div>
  );
}

export default WorkflowConfiguration;
