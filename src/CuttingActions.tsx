import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut } from "@fortawesome/free-solid-svg-icons";

const CuttingActions: React.FC<{}> = () => {

  const cuttingActionsStyle = {
    backgroundColor: 'rgba(0, 245, 220, 1)',
    borderRadius: '25px',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    gap: '20px',
  };

  return (
    <div css={cuttingActionsStyle} title="CuttingActions">
      <CuttingActionsButton />
      <CuttingActionsButton />
      <CuttingActionsButton />
      <CuttingActionsButton />
    </div>
  );
};

const CuttingActionsButton: React.FC<{}> = () => {

  const [isActive, setisActive] = useState(false); 

  const iconStyle = {
    borderRadius: '25px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
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

export default CuttingActions;