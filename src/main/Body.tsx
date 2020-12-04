import React from "react";

import MainMenu from './MainMenu';
import MainContent from './MainContent';
import TheEnd from './TheEnd';

import { useSelector } from 'react-redux';
import { selectStatus as postAndProcessSelectStatus } from '../redux/workflowPostAndProcessSlice'
import { selectAbortState } from '../redux/abortSlice'

const Body: React.FC<{}> = () => {

  const abortState = useSelector(selectAbortState)
  const postAndProcessState = useSelector(postAndProcessSelectStatus)

  // If we're in a special state, display a special page
  // Otherwise display the normal page
  const main = () => {
    if(abortState || postAndProcessState === "success") {
      return (
        <TheEnd />
      );
    } else {
      return (
        <div css={bodyStyle} title="Body">
          <MainMenu />
          <MainContent />
        </div>
      );
    }
  }

  const bodyStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
  };

  return (
    <React.Fragment>
      {main()}
    </React.Fragment>
  );
};

export default Body;
