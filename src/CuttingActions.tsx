import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faEyeSlash, faTrash, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { css, SerializedStyles } from '@emotion/core'

const CuttingActions: React.FC<{}> = () => {

  const cuttingActionsStyle = css({
    backgroundColor: 'rgba(0, 245, 220, 1)',
    borderRadius: '25px',
    display: 'flex',
    flexDirection: 'row' as const,
    //justifyContent: 'stretch',
    //flexBasis: 0,
    padding: '10px',
    gap: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  });

  const columnStyle = css({
    //border: 'solid',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px',
    gap: '20px',
  });

  return (
    <div css={cuttingActionsStyle} title="CuttingActions">
      <div css={columnStyle}>
      <CuttingActionsButton iconName={faCut} actionName="Schneiden" />
      <CuttingActionsButton iconName={faEyeSlash} actionName="Verstecken" />
      </div>
      <div css={columnStyle}>
      <CuttingActionsButton iconName={faTrash} actionName="Löschen" />
      </div>
      <div css={columnStyle}>
      <CuttingActionsButton iconName={faCut} actionName="Schneiden" />
      </div>
    </div>
  );
};

const CuttingActionsButton: React.FC<{iconName: IconDefinition, actionName: string}> = ({iconName, actionName}) => {

  const iconStyle = {
    borderRadius: '25px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  };

  return (
    <>
      <FontAwesomeIcon css={iconStyle} icon={iconName} size="5x" 
      />
      {actionName}
    </>
  );
};

export default CuttingActions;