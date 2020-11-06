import React from "react";

import Video from './Video';
import Timeline from './Timeline';
import CuttingActions from './CuttingActions';

const MainContent: React.FC<{}> = () => {

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
        <Video />
        <Timeline />
        <CuttingActions />
    </div>
  );
};

export default MainContent;