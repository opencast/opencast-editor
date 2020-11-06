import React from "react";

import MainMenu from './MainMenu';
import MainContent from './MainContent';

const Body: React.FC<{}> = () => {

  const bodyStyle = {
    display: 'flex',
    flex: '1',
    flexDirection: 'row' as const,
    padding: '10px',
    gap: '20px',
  };

  return (
    <div css={bodyStyle} title="Body">
      <MainContent />
      <MainMenu />
    </div>
  );
};

export default Body;