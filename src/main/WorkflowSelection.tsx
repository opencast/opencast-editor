import React from "react";

import { css } from '@emotion/core'

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, selectSelectedWorkflowIndex, setSelectedWorkflowIndex } from '../redux/videoSlice'

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  // Initialite redux states
  const workflows = useSelector(selectWorkflows)

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

  return (
    <div css={workflowStyle} title="Workflow Selection Area">
      <h2>Workflow Selection</h2>
      {workflowButtons()}
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
    backgroundColor: workflowIndex !== selectedWorkflowIndex ? 'snow' : 'lightblue',
    borderRadius: '10px',
    borderWidth: '1px',
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

export default WorkflowSelection;
