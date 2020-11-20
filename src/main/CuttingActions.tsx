import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faEyeSlash, faTrash, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useDispatch } from 'react-redux';
import {
  cut
} from '../redux/videoSlice'

/**
 * Defines the different actions a user can perform while in cutting mode
 * TODO: Shape this like a proper grid
 */
const CuttingActions: React.FC<{}> = () => {

    const cuttingStyle =  css({
      backgroundColor: 'snow',
      borderRadius: '15px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
      flex: '3',
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '20px',
    })

    const cuttingActionsStyle = css({
    backgroundColor: 'snow',
    flex: '3',
    display: 'flex',
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-around',
    alignContent: 'top',
    gap: '30px',
  });

  const textStyle = {
    textAlign: 'left' as const,
  }

  return (
    <div css={cuttingStyle}>
      <h1 css={textStyle}>Cutting Tools</h1>
      <div css={cuttingActionsStyle} title="CuttingActions">
        <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
        <CuttingActionsButton iconName={faEyeSlash} actionName="Mark as Hidden" action={cut}/>
        <CuttingActionsButton iconName={faTrash} actionName="Mark as Deleted" action={cut}/>
        <CuttingActionsButton iconName={faCut} actionName="Some other action" action={cut}/>
      </div>
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
    backgroundColor: 'snow',
    borderRadius: '10px',
    //flex: 1,
    fontSize: 'large',
    width: '125px',
    height: '125px',
    //padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
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
    textAlign: 'center' as const,
  };

  return (
    <div css={cuttingActionButtonStyle} title={actionName} onClick={() => dispatch(action())}>
      <FontAwesomeIcon icon={iconName} size="3x" />
      <div>{actionName}</div>
    </div>
  );
};

export default CuttingActions;