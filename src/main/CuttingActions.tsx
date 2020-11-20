import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faQuestion, faTrash, IconDefinition } from "@fortawesome/free-solid-svg-icons";

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
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    flex: '3',
    display: 'flex',
    // flexDirection: 'column' as const,
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
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

  const styleA = css({
    backgroundColor: 'snow',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  const styleB = css({
    backgroundColor: 'snow',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  return (
    <div css={cuttingStyle}>
      {/* <h1 css={textStyle}>Cutting Tools</h1> */}
      {/* <div css={cuttingActionsStyle} title="CuttingActions"> */}
        <div css={styleA}>
          <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
          <CuttingActionsButton iconName={faTrash} actionName="Mark as Deleted" action={cut}/>
          <CuttingActionsButton iconName={faQuestion} actionName="Concatenate Left" action={cut}/>
          <CuttingActionsButton iconName={faQuestion} actionName="Concatenate Right" action={cut}/>
        </div>
        <div css={styleB}>
          <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={cut}/>
          <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={cut}/>
        </div>
      {/* </div> */}
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