import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faEyeSlash, faTrash, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { css, SerializedStyles } from '@emotion/core'

import { useSelector, useDispatch } from 'react-redux';
import {
  selectSegments, cut
} from '../redux/videoSlice'

/**
 * Defines the different actions a user can perform while in cutting mode
 * TODO: Shape this like a proper grid
 */
const CuttingActions: React.FC<{}> = () => {

  // const cuttingActionsStyle = css({
  //   backgroundColor: 'rgba(0, 245, 220, 1)',
  //   borderRadius: '25px',
  //   display: 'flex',
  //   flexDirection: 'row' as const,
  //   padding: '10px',
  //   gap: '20px',
  //   boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  // });

  // const columnStyle = css({
  //   flex: 1,
  //   display: 'flex',
  //   flexDirection: 'column' as const,
  //   alignItems: 'center',
  //   padding: '10px',
  //   gap: '20px',
  // });

  // return (
  //   <div css={cuttingActionsStyle} title="CuttingActions">
  //     <div css={columnStyle}>
  //     <CuttingActionsButton iconName={faCut} actionName="Schneiden" action={cut}/>
  //     <CuttingActionsButton iconName={faEyeSlash} actionName="Verstecken" action={cut}/>
  //     </div>
  //     <div css={columnStyle}>
  //     <CuttingActionsButton iconName={faTrash} actionName="Löschen" action={cut}/>
  //     </div>
  //     <div css={columnStyle}>
  //     <CuttingActionsButton iconName={faCut} actionName="Schneiden" action={cut}/>
  //     </div>
  //   </div>
  // );
    const cuttingActionsStyle = css({
    backgroundColor: 'rgba(56, 142, 214, 1)',
    borderRadius: '25px',
    flex: '3',
    display: 'grid',
    gridTemplateColumns: 'auto auto auto',
    padding: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  });

  return (
    <div css={cuttingActionsStyle} title="CuttingActions">
      <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
      <CuttingActionsButton iconName={faEyeSlash} actionName="Mark as Hidden" action={cut}/>
      <CuttingActionsButton iconName={faTrash} actionName="Mark as Deleted" action={cut}/>
      <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
    </div>
  );
};

/**
 * A button representing a single action a user can take while cutting
 * TODO: Add functionality
 * TODO: Complete styling
 * @param param0 
 */
const CuttingActionsButton: React.FC<{iconName: IconDefinition, actionName: string, action: any}> = ({iconName, actionName, action}) => {

  const dispatch = useDispatch();

  const cuttingActionButtonStyle = {
    color: "snow",
    borderRadius: '25px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
  };

  return (
    <div css={cuttingActionButtonStyle} title={actionName} onClick={() => dispatch(action())}>
      <FontAwesomeIcon icon={iconName} size="5x" 
      />
      {actionName}
    </div>
  );
};

export default CuttingActions;