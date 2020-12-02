import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';
import WorkflowSelection from "./WorkflowSelection";
import WorkflowConfiguration from "./WorkflowConfiguration";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useSelector } from 'react-redux'
import {
  selectMainMenuState,
} from '../redux/mainMenuSlice'

/**
 * A container for the main functionality
 * Shows different components depending on the state off the app
 * TODO: Add proper component switching
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)

  const cuttingStyle = css({
    width: '100%',
    display: mainMenuState !== "Cutting" ? 'none' :'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    gap: "20px",
    paddingRight: '20px',
  })

  const startWorkflowStyle = css({
    height: '100%',
    display: mainMenuState !== "Start Workflow" ? 'none' : 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'left',
    alignItems: 'left'
  })

  const defaultStyle = css({
    display: (mainMenuState === "Start Workflow" || mainMenuState === "Cutting") ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
  })

  return (
     <div title="MainMenuContext">
        <div css={cuttingStyle} title="Cutting Container">
            <Video />
            <CuttingActions />
            <Timeline />
        </div>
        <div css={startWorkflowStyle} title="Workflow Container">
            <WorkflowSelection />
            <WorkflowConfiguration />
          </div>
          <div css={defaultStyle}>
            <FontAwesomeIcon icon={faTools} size="10x" />
            Under Construction
          </div>
     </div>
  );
};

export default MainContent;