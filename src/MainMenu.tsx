import React, { useState }  from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

const MainMenu: React.FC<{}> = () => {

  const toolboxStyle = {
    backgroundColor: 'rgba(0, 245, 220, 1)',
    borderRadius: '25px',
    width: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px',
    gap: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={toolboxStyle} title="Toolbox">
      <ToolboxButton />
      <ToolboxButton />
      <ToolboxButton />
      <ToolboxButton />
    </div>
  );
};

const ToolboxButton: React.FC<{}> = () => {

  const [isActive, setisActive] = useState(false); 

  const iconStyle = {
    borderRadius: '25px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    //boxShadow: isActive ? 'inset 0 0 5px #000000' : '0',
    ...isActive && {
      stroke: "red",
      strokeWidth: "10",
    },
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  };

  return (
    <>
    <FontAwesomeIcon css={iconStyle} icon={faCut} size="5x" 
      onClick={() => setisActive(!isActive)}
    />
    </>
  );
};

export default MainMenu;