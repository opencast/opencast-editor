import React from "react";

import MainMenu from './MainMenu';
import MainContent from './MainContent';

const Body: React.FC<{}> = () => {

  const bodyStyle = {
    display: 'flex',
    flex: '1',
    flexDirection: 'row' as const,
    gap: '50px',
  };

  return (
    <div css={bodyStyle} title="Body">
      <MainMenu />
      <MainContent />
    </div>
  );
};

export default Body;
