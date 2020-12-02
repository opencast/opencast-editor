import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faDotCircle, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import {
  selectWorkflows, selectSelectedWorkflowIndex, setSelectedWorkflowIndex, selectSegments,
} from '../redux/videoSlice'
import {
  postVideoInformation
} from '../redux/workflowPostSlice'
import {
  postVideoInformationWithWorkflow
} from '../redux/workflowPostAndProcessSlice'

/**
 * Allows the user to select a workflow
 * Allows the user to save his current changes and start a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  // Initialite redux states
  const workflows = useSelector(selectWorkflows)
  // Monitor post request to display error messages if they fail
  const postWorkflowStatus = useSelector((state: { workflowPostState: { status: string } }) => state.workflowPostState.status);
  const postAndProcessWorkflowStatus = useSelector((state: { workflowPostAndProcessState: { status: string } }) => state.workflowPostAndProcessState.status);
  const postError = useSelector((state: { workflowPostState: { error: any } }) => state.workflowPostState.error)
  const postAndProcessError = useSelector((state: { workflowPostAndProcessState: { error: any } }) => state.workflowPostAndProcessState.error)

  // Create workflow selection
  const workflowButtons = () => {
    return (
      workflows.map( (workflow: any, index: number) => (
        <WorkflowButton key={index} stateName={workflow.name} workflowIndex={index}/>
      ))
    );
  }

  const workflowStyle = css({
    backgroundColor: 'snow',
    borderRight: '1px solid #BBB',
    width: '350px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'left',
    padding: '20px',
    paddingRight: '40px',
    gap: '30px',
  })

  const saveButtonAreaStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  const errorBoxStyle = css({
    ...(postWorkflowStatus !== 'failed' && postAndProcessWorkflowStatus !== 'failed') && {display: "none"},
    borderColor: 'red',
    borderStyle: 'dashed',
    fontWeight: 'bold',
    padding: '10px',
  })

  return (
    <div css={workflowStyle} title="Workflow Selection Area">
      <h2>Workflow Selection</h2>
      {workflowButtons()}
      <div css={saveButtonAreaStyle} title="Save Button Area">
        <SaveButton />
        {workflows.length > 0 ? <SaveAndProcessButton /> : ""}
      </div>
      <div css={errorBoxStyle} title="Error Box">
        <span>An error has occured. Please wait a bit and try again. Details: </span><br />
        {postError}<br />
        {postAndProcessError}
      </div>
    </div>
  );
}

/**
 * Clicking this button sets the associated workflow as selected
 * @param param0
 */
const WorkflowButton: React.FC<{stateName: string, workflowIndex: number}> = ({stateName, workflowIndex}) => {

  const dispatch = useDispatch();
  const selectedWorkflowIndex = useSelector(selectSelectedWorkflowIndex)

  const workflowButtonStyle = css({
    backgroundColor: 'snow',
    borderRadius: '10px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: workflowIndex !== selectedWorkflowIndex ? 'black' : 'lightblue',
    fontSize: 'medium',
    padding: '16px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    gap: '10px',
  });

  return (
    <div css={workflowButtonStyle} title={"Workflow Button for "+stateName}
      onClick={() =>
        dispatch(setSelectedWorkflowIndex(workflowIndex))
      }>
      <span>{stateName}</span>
    </div>
  );
}

/**
 * Button that sends a post request to save current changes
 * TODO: Create a wrapper for this and the other save button?
 */
const SaveButton: React.FC<{}> = () => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const segments = useSelector(selectSegments)
  const workflowStatus = useSelector((state: { workflowPostState: { status: string } }) => state.workflowPostState.status);

  // Update based on current fetching status
  let icon = faDotCircle
  if (workflowStatus === 'loading') {
    icon = faSpinner
  } else if (workflowStatus === 'success') {
    icon = faCheck
  } else if (workflowStatus === 'failed') {
    icon = faTimes
  }

  const saveButtonStyle = css({
    flex: 1,
    backgroundColor: workflowStatus === 'failed' ? 'red' : 'green',
    borderRadius: '10px',
    fontSize: 'medium',
    padding: '16px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'snow',
  })

  return (
    <div css={saveButtonStyle} title={"Save"}
      onClick={() =>
        dispatch(postVideoInformation({
          segments: segments,
          mediaPackageId: "9bf8aec2-10f5-4c64-bfde-2752fa3a394d",
        }))
      }>
      <FontAwesomeIcon  icon={icon} size="1x"/>
      <span>{"Save"}</span>
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
  const workflowStatus = useSelector((state: { workflowPostAndProcessState: { status: string } }) => state.workflowPostAndProcessState.status);

  // Update based on current fetching status
  let icon = faDotCircle
  if (workflowStatus === 'loading') {
    icon = faSpinner
  } else if (workflowStatus === 'success') {
    icon = faCheck
  } else if (workflowStatus === 'failed') {
    icon = faTimes
  }

  const saveButtonStyle = css({
    flex: 1,
    backgroundColor: workflowStatus === 'failed' ? 'red' : 'green',
    borderRadius: '10px',
    fontSize: 'medium',
    padding: '16px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'snow',
  })

  return (
    <div css={saveButtonStyle} title={"Save and Process"}
      onClick={() =>
        dispatch(postVideoInformationWithWorkflow({
          segments: segments,
          mediaPackageId: "9bf8aec2-10f5-4c64-bfde-2752fa3a394d",
          workflowID: workflows[selectedWorkflowIndex],
        }))
      }>
      <FontAwesomeIcon  icon={icon} size="1x"/>
      <span>{"Save and Process"}</span>
    </div>
  );
}

export default WorkflowSelection;