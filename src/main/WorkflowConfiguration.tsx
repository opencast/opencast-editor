import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration : React.FC<{}> = () => {

  const workflowConfigurationStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
  })

  return (
    <div css={workflowConfigurationStyle} title="Workflow Configuration Area">
      <h2>Workflow Configuration</h2>
      <FontAwesomeIcon icon={faTools} size="10x" />
      Under Construction
    </div>
  );

}

export default WorkflowConfiguration;