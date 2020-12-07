import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";
import { faSpinner, faDotCircle, faCheck, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, selectSegments, } from '../redux/videoSlice'
import { postVideoInformationWithWorkflow, selectStatus, selectError } from '../redux/workflowPostAndProcessSlice'

import { PageButton } from './FinishContent'

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
    gap: '20px',
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
      Under Construction
      <SaveAndProcessButton />
      <div css={errorBoxStyle} title="Error Box">
        <span>An error has occured. Please wait a bit and try again. Details: </span><br />
        {postAndProcessError}
      </div>
      <PageButton pageNumber={0} label="Back" />
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
  const workflowStatus = useSelector(selectStatus);

  // Update based on current fetching status
  let icon = faDotCircle
  if (workflowStatus === 'loading') {
    icon = faSpinner
  } else if (workflowStatus === 'success') {
    icon = faCheck
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
  }

  const saveButtonStyle = css({
    borderWidth: '1px',
    borderColor: workflowStatus === 'failed' ? 'red' : 'green',
    borderStyle: 'solid',
    padding: '16px',
  })

  return (
    <div css={[basicButtonStyle, saveButtonStyle]} title={"Process"}
      onClick={() =>
        dispatch(postVideoInformationWithWorkflow({
          segments: segments,
          mediaPackageId: "9bf8aec2-10f5-4c64-bfde-2752fa3a394d",
          workflowID: workflows[selectedWorkflowIndex],
        }))
      }>
      <FontAwesomeIcon  icon={icon} size="1x"/>
      <span>{"Start Processing"}</span>
    </div>
  );
}

export default WorkflowConfiguration;
