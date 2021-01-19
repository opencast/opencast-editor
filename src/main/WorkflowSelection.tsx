import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle, errorBoxStyle } from '../cssStyles'

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, setSelectedWorkflowIndex } from '../redux/videoSlice'
import { selectFinishState, selectPageNumber } from '../redux/finishSlice'

import { PageButton } from './Finish'
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { SaveAndProcessButton } from "./WorkflowConfiguration";
import { selectStatus, selectError } from "../redux/workflowPostAndProcessSlice";

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  // Initialite redux states
  const workflows = useSelector(selectWorkflows)
  const finishState = useSelector(selectFinishState)
  const pageNumber = useSelector(selectPageNumber)
  const selectedWorkflowIndex = useSelector(selectSelectedWorkflowIndex)

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)

  // Create workflow selection
  const workflowButtons = () => {
    if (workflows.length > 0) {
      return (
        workflows.map( (workflow: any, index: number) => (
          <WorkflowButton key={index} stateName={workflow.name} workflowIndex={index}/>
        ))
      );
    } else {
      return (
        "There are no workflows to select. Save your changes and contact an Opencast Administrator."
      );
    }
  }

  // Gets the description from the currently selected workflow
  const workflowDescription = () => {
    if (workflows.length > selectedWorkflowIndex && workflows[selectedWorkflowIndex].description) {
      return (
        workflows[selectedWorkflowIndex].description
      );
    } else {
      return (
        "And this is where I would put a workflow description.... if I had one!"
      );
    }
  }

  const workflowSelectionStyle = css({
    display: (finishState === "Start processing" && pageNumber === 1) ? 'flex' : 'none',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '50px',
  })

  const workflowSelectionSelectionStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'left',
    gap: '20px',
    flexWrap: 'wrap',
    maxHeight: '50vh',
  })

  return (
    <div css={workflowSelectionStyle}>
      <h2>Select a workflow</h2>
      <div css={workflowSelectionSelectionStyle} title="Workflow Selection Area">
        {workflowButtons()}
      </div>
      <div>{workflowDescription()}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label="Take me back" iconName={faChevronLeft}/>
        {/* <PageButton pageNumber={2} label="Continue" iconName={faChevronRight}/> */}
        <SaveAndProcessButton text="Start processing with workflow"/>
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus)} title="Error Box" role="alert">
        <span>An error has occured. Please wait a bit and try again.</span><br />
        {postAndProcessError ? "Details: " + postAndProcessError : "No error details are available."}<br />
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

  const selectWorkflowIndex = () => {
    dispatch(setSelectedWorkflowIndex(workflowIndex))
  }

  const workflowButtonStyle = css({
    backgroundColor: workflowIndex !== selectedWorkflowIndex ? 'snow' : '#DDD',
    padding: '16px',
  });

  return (
    <div css={[basicButtonStyle,workflowButtonStyle]} title={"Click to select this workflow"}
      role="button" tabIndex={0}
      aria-label={"Press to select the workflow: " + stateName}
      onClick={ selectWorkflowIndex }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        selectWorkflowIndex()
      }}}>
      <span>{stateName}</span>
    </div>
  );
}

export default WorkflowSelection;
