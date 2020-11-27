import React, {useState} from "react";

import { css } from '@emotion/core'


import { useDispatch, useSelector } from 'react-redux';
import {
  selectWorkflows
} from '../redux/videoSlice'

const Workflow : React.FC<{}> = () => {

  const workflows = useSelector(selectWorkflows)

  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0)

  const workflowButtons = () => {
    return (
      workflows.map( (workflow: any, index: number) => (
        <WorkflowButton stateName={workflow.name} workflowIndex={0} setActiveWorkflowIndex={setActiveWorkflowIndex}/>
      ))
    );
  }

  const workflowStyle = css({
    backgroundColor: 'snow',
    borderRight: '1px solid #BBB',
    width: '250px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'left',
    padding: '20px',
    gap: '30px',
  })

  return (
    <div css={workflowStyle} title="Workflow Selection Area">
      <h2>Workflow Selection</h2>
      <WorkflowButton stateName="No Workflow" workflowIndex={0} setActiveWorkflowIndex={setActiveWorkflowIndex}/>
      {workflowButtons()}
      {/* <WorkflowButton stateName="Yet another workflow"/>
      <WorkflowButton stateName="A very long name for a workflow this is"/> */}
    </div>
  );
}

const WorkflowButton: React.FC<{stateName: string, workflowIndex: number, setActiveWorkflowIndex: React.Dispatch<React.SetStateAction<number>>}> = ({stateName, workflowIndex, setActiveWorkflowIndex}) => {

  const workflowButtonStyle = css({
    backgroundColor: 'snow',
    borderRadius: '10px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'black',
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
    // display: 'flex',
    // alignItems: 'center',
    gap: '10px',
    // textAlign: 'left' as const,
  });

  return (
    <div css={workflowButtonStyle} title={"Workflow Button for "+stateName}
      onClick={() =>
        setActiveWorkflowIndex(workflowIndex)
      }>
      <span>{stateName}</span>
    </div>
  );
}

export default Workflow;