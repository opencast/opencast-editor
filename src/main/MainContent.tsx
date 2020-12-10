import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';
import FinishMenu from "./FinishMenu";
import FinishContent from "./FinishContent"
import WaveformDisplayTest from "./WaveformDisplayTest"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools} from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useSelector } from 'react-redux'
import { selectMainMenuState } from '../redux/mainMenuSlice'

import { MainMenuStateNames } from '../types'

/**
 * A container for the main functionality
 * Shows different components depending on the state off the app
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)

  const cuttingStyle = css({
    width: '100%',
    display: mainMenuState !== MainMenuStateNames.cutting ? 'none' :'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    gap: "20px",
    paddingRight: '20px',
    paddingLeft: '20px',
  })

  const saveProcessCancelStyle = css({
    display: mainMenuState !== MainMenuStateNames.finish ? 'none' : 'flex',
    width: '100%',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    gap: "20px",
    paddingRight: '20px',
  })

  const defaultStyle = css({
    display: (mainMenuState === MainMenuStateNames.cutting || mainMenuState === MainMenuStateNames.finish)
              ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
  })

  return (
     <div title="MainMenuContext" css={{width: '100%'}}>
      <div css={cuttingStyle} title="Cutting Container">
          <WaveformDisplayTest />
          <Video />
          <CuttingActions />
          <Timeline />
      </div>
      <div css={saveProcessCancelStyle} title="Workflow Container">
        <FinishMenu />
        <FinishContent />
      </div>
      <div css={defaultStyle}>
        <FontAwesomeIcon icon={faTools} size="10x" />
        Under Construction
      </div>
     </div>
  );
};

export default MainContent;
