import React, { SyntheticEvent } from "react";

import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faCut,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence } from "react-hotkeys";
import { selectMainMenuState } from "../redux/mainMenuSlice";
import { MainMenuStateNames } from "../types";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const dispatch = useDispatch();
  const mainMenuState = useSelector(selectMainMenuState)

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   */
  const dispatchAction = (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>) => {
    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    dispatch(action())
  }

  // Maps functions to hotkeys
  const handlers = {
    cut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, cut) } },
    delete: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, markAsDeletedOrAlive) } },
    mergeLeft: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeLeft) } },
    mergeRight: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeRight) } },
  }

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
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={mainMenuState === MainMenuStateNames.cutting ? handlers: {}} allowChanges={true} >
      <div css={cuttingStyle}>
          <div css={blockStyle}>
            <CuttingActionsButton iconName={faCut}
              actionName="Cut" actionHandler={dispatchAction} action={cut}
              tooltip={`Split the segment at the current scrubber position. Hotkey: ${cuttingKeyMap[handlers.cut.name]}`}
              ariaLabelText={`Cut. Split the segment at the current scrubber position. Hotkey: ${cuttingKeyMap[handlers.cut.name]}.`}
            />
            <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive} hotKeyName={cuttingKeyMap[handlers.delete.name]}/>
            <CuttingActionsButton iconName={faStepBackward}
              actionName="Merge Left" actionHandler={dispatchAction} action={mergeLeft}
              tooltip={`Combine the currently active segment with the segment to its left. Hotkey: ${cuttingKeyMap[handlers.mergeLeft.name]}`}
              ariaLabelText={`Merge Left. Combine the currently active segment with the segment to its left. Hotkey: ${cuttingKeyMap[handlers.mergeLeft.name]}.`}
            />
            <CuttingActionsButton iconName={faStepForward}
              actionName="Merge Right" actionHandler={dispatchAction} action={mergeRight}
              tooltip={`Combine the currently active segment with the segment to its right. Hotkey: ${cuttingKeyMap[handlers.mergeRight.name]}`}
              ariaLabelText={`Merge Right. Combine the currently active segment with the segment to its right. Hotkey: ${cuttingKeyMap[handlers.mergeRight.name]}.`}
            />
          </div>
          <div css={blockStyle}>
            {/* <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={null}
              tooltip="Not implemented"
              ariaLabelText="Reset changes. Not implemented"
            />
            <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={null}
              tooltip="Not implemented"
              ariaLabelText="Undo. Not implemented"
            /> */}
          </div>
      </div>
    </GlobalHotKeys>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = {
  padding: '16px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

interface cuttingActionsButtonInterface {
  iconName: IconDefinition,
  actionName: string,
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>) => void,
  action: ActionCreatorWithoutPayload<string>,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({iconName, actionName, actionHandler, action, tooltip, ariaLabelText}) => {
  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={tooltip}
      role="button" tabIndex={0} aria-label={ariaLabelText}
      onClick={ (event: SyntheticEvent) => actionHandler(event, action) }
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action)
      }}}
      >
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{actionName}</span>
    </div>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: KeySequence,
}

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<markAsDeleteButtonInterface> = ({actionHandler, action, hotKeyName}) => {

  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={`Mark or unmark the segment at the current position as to be deleted. Hotkey: ${hotKeyName}`}
      role="button" tabIndex={0}
      aria-label={`Delete and Restore. Mark or unmark the segment at the current position as to be deleted. Hotkey: ${hotKeyName}`}
      onClick={(event: SyntheticEvent) => actionHandler(event, action)}
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action)
      }}}
      >
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? "Delete" : "Restore"}</div>
    </div>
  );
}

export default CuttingActions;
