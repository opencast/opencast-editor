import React from "react";

import { basicButtonStyle } from '../cssStyles'

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
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const cuttingStyle =  css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: '30px',
  })

  const blockStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  return (
    <div css={cuttingStyle}>
        <div css={blockStyle}>
          <CuttingActionsButton iconName={faCut} actionName="Cut" action={cut}/>
          <MarkAsDeletedButton />
          <CuttingActionsButton iconName={faStepBackward} actionName="Merge Left" action={mergeLeft}/>
          <CuttingActionsButton iconName={faStepForward} actionName="Merge Right" action={mergeRight}/>
        </div>
        <div css={blockStyle}>
          <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={null}/>
          <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={null}/>
        </div>
    </div>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = {
  padding: '16px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

/**
 * A button representing a single action a user can take while cutting
 * TODO: Add functionality
 * TODO: Complete styling
 * @param param0
 */
const CuttingActionsButton: React.FC<{iconName: IconDefinition, actionName: string, action: any}> = ({iconName, actionName, action}) => {

  const dispatch = useDispatch();

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]} title={actionName}
      onClick={() => action ? dispatch(action()) : ""}>
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{actionName}</span>
    </div>
  );
};

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<{}> = () => {

  const dispatch = useDispatch();
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]} title={isCurrentSegmentAlive ? "Delete" : "Restore"}
      onClick={() => dispatch(markAsDeletedOrAlive())}>
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? "Delete" : "Restore"}</div>
    </div>
  );
}

export default CuttingActions;
