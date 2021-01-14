import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle } from '../cssStyles'

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, setSelectedWorkflowIndex } from '../redux/videoSlice'
import { selectFinishState, selectPageNumber } from '../redux/finishSlice'

import { PageButton } from './Finish'
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  // Initialite redux states
  const workflows = useSelector(selectWorkflows)
  const finishState = useSelector(selectFinishState)
  const pageNumber = useSelector(selectPageNumber)

  // Create workflow selection
  const workflowButtons = () => {
    return (
      workflows.map( (workflow: any, index: number) => (
        <WorkflowButton key={index} stateName={workflow.name} workflowIndex={index}/>
      ))
    );
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
  })

  return (
    <div css={workflowSelectionStyle}>
      <h2>Select a workflow</h2>
      <div css={workflowSelectionSelectionStyle} title="Workflow Selection Area">
        {workflowButtons()}
      </div>
      <div>And this is where I would put a workflow description.... if I had one!</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label="Take me back" iconName={faChevronLeft}/>
        <PageButton pageNumber={2} label="Continue" iconName={faChevronRight}/>
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
