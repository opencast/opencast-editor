import React from "react";

import { css } from '@emotion/core'

const Workflow : React.FC<{}> = () => {

  const workflowStyle = css({

  })

  return (
    <div css={workflowStyle} title="Workflow Selection Area">
      <h1>Workflow Selection</h1>
      <WorkflowButton />
      <WorkflowButton />
      <WorkflowButton />
    </div>
  );
}

const WorkflowButton: React.FC<{}> = () => {


  return (
    <div>
      
    </div>
  );
}

export default Workflow;