import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faCut,
  faQuestion,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive
} from '../redux/videoSlice'

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const cuttingStyle =  css({
    backgroundColor: 'snow',
    flex: '3',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    padding: '00px',
    gap: '30px',
  })

  // const cuttingActionsStyle = css({
  //   backgroundColor: 'snow',
  //   flex: '3',
  //   display: 'flex',
  //   flexDirection: 'row' as const,
  //   flexWrap: 'wrap' as const,
  //   justifyContent: 'space-around',
  //   alignContent: 'top',
  //   gap: '30px',
  // });

  const blockStyle = css({
    backgroundColor: 'snow',
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  return (
    <div css={cuttingStyle}>
      {/* <div css={cuttingActionsStyle} title="CuttingActions"> */}
        <div css={blockStyle}>
          <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
          {/* <CuttingActionsButton iconName={faTrash} actionName="Mark as Deleted" action={markAsDeletedOrAlive}/> */}
          <MarkAsDeletedButton />
          <CuttingActionsButton iconName={faStepBackward} actionName="Merge Left" action={null}/>
          <CuttingActionsButton iconName={faStepForward} actionName="Merge Right" action={null}/>
        </div>
        <div css={blockStyle}>
          <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={null}/>
          <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={null}/>
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
    fontSize: 'medium',
    padding: '16px',
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
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center' as const,
  };

  return (
    <div css={cuttingActionButtonStyle} title={actionName} onClick={() => action ? dispatch(action()) : ""}>
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{actionName}</span>
    </div>
  );
};

const MarkAsDeletedButton : React.FC<{}> = () => {

  const dispatch = useDispatch();
  // const isCurrentSegmentActive = useSelector(
  //   (state: { videoState: { segments: { [x: number]: { isAlive: boolean; }; }; activeSegmentIndex: number; }; }) => 
  //   state.videoState.segments[state.videoState.activeSegmentIndex].isAlive
  // );
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)

  const cuttingActionButtonStyle = {
    backgroundColor: 'snow',
    borderRadius: '10px',
    //flex: 1,
    fontSize: 'medium',
    padding: '16px',
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
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center' as const,
  };

  return (
    <div css={cuttingActionButtonStyle} title={isCurrentSegmentAlive ? "Delete" : "Restore"} 
      onClick={() => dispatch(markAsDeletedOrAlive())}>
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? "Delete" : "Restore"}</div>
    </div>
  );
}

export default CuttingActions;
