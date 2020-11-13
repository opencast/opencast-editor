import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';

import { useSelector } from 'react-redux'
import {
  selectMainMenuState,
} from '../redux/mainMenuSlice'

/**
 * A container for the main functionality
 * Holds different components depending on the state off the app
 * TODO: Add component switching
 */
const MainContent: React.FC<{}> = () => {

  const mainMenuState = useSelector(selectMainMenuState)

  const toolboxContentStyle = {
    backgroundColor: 'rgba(245, 245, 220, 1)',
    borderRadius: '25px',
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div css={toolboxContentStyle} title="ToolboxContext">
        {mainMenuState}
        <div css={{width: '100%', display: 'flex', flexDirection: 'row' as const, justifyContent: 'space-around', gap: "20px"}}>
          <Video />
          <CuttingActions />
        </div>
        <Timeline />
    </div>
  );
};

export default MainContent;