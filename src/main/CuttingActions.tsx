import React, { SyntheticEvent } from "react";

import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faCut,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  faPlus,
  faMinus,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight, setZoom, selectTimelineZoom
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence } from "react-hotkeys";
import { selectMainMenuState } from "../redux/mainMenuSlice";
import { MainMenuStateNames } from "../types";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const mainMenuState = useSelector(selectMainMenuState)
  const timelineZoom = useSelector(selectTimelineZoom)

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param actionWithPayload Another type of redux event to dispatch
   * @param payload dispatch as a parameter with actionWithPayload
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => {

    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    if (action) {
      dispatch(action())
    }
    if (actionWithPayload) {
      dispatch(actionWithPayload(payload))
    }

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  const handlers = {
    cut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, cut, undefined, undefined, undefined) } },
    delete: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, markAsDeletedOrAlive, undefined, undefined, undefined) } },
    mergeLeft: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeLeft, undefined, undefined, undefined) } },
    mergeRight: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, mergeRight, undefined, undefined, undefined) } },
    zoomIn: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, undefined, setZoom, timelineZoom + 0.1, undefined) } },
    zoomOut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if(keyEvent) { dispatchAction(keyEvent, undefined, setZoom, timelineZoom - 0.1, undefined) } },
  }

  const cuttingStyle =  css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    ...(flexGapReplacementStyle(30, true)),
  })

  const blockStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    ...(flexGapReplacementStyle(30, true)),
  })

  const zoomStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    ...(flexGapReplacementStyle(10, true))
  })

  const inbetweenWordStyle = css({
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: 'column',
  })

  return (
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={mainMenuState === MainMenuStateNames.cutting ? handlers: {}} allowChanges={true} >
      <div css={cuttingStyle}>
          <div css={blockStyle}>
            <CuttingActionsButton iconName={faCut}
              actionName="Cut" actionHandler={dispatchAction} action={cut} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: cuttingKeyMap[handlers.cut.name] })}
              ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: cuttingKeyMap[handlers.cut.name] })}
            />
            <MarkAsDeletedButton
              actionHandler={dispatchAction}
              action={markAsDeletedOrAlive}
              hotKeyName={cuttingKeyMap[handlers.delete.name]}
            />
            <CuttingActionsButton iconName={faStepBackward}
              actionName="Merge Left" actionHandler={dispatchAction} action={mergeLeft} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: cuttingKeyMap[handlers.mergeLeft.name] })}
              ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: cuttingKeyMap[handlers.mergeLeft.name] })}
            />
            <CuttingActionsButton iconName={faStepForward}
              actionName="Merge Right" actionHandler={dispatchAction} action={mergeRight} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
              ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
            />
          </div>
          <div css={blockStyle}>
            <div css={zoomStyle}>
              <CuttingActionsButton iconName={faMinus}
                actionName="" actionHandler={dispatchAction} action={undefined} actionWithPayload={setZoom} payload={timelineZoom - 0.1}
                tooltip={t('Zoom Out', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
                ariaLabelText={t('Zoom Out', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
              />
              <div css={inbetweenWordStyle}>Zoom</div>
              <CuttingActionsButton iconName={faPlus}
                actionName="" actionHandler={dispatchAction} action={undefined} actionWithPayload={setZoom} payload={timelineZoom + 0.1}
                tooltip={t('Zoom In', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
                ariaLabelText={t('Zoom In', { hotkeyName: cuttingKeyMap[handlers.mergeRight.name] })}
              />
          </div>
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
  actionHandler: (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string> | undefined,
  actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
  payload: any,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({iconName, actionName, actionHandler, action, actionWithPayload, payload, tooltip, ariaLabelText}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={tooltip}
      ref={ref}
      role="button" tabIndex={0} aria-label={ariaLabelText}
      onClick={ (event: SyntheticEvent) => actionHandler(event, action, actionWithPayload, payload, ref) }
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action, actionWithPayload, payload, undefined)
      }}}
      >
      <FontAwesomeIcon icon={iconName} size="1x" />
      {actionName && <span>{actionName}</span>}
    </div>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (event: KeyboardEvent | SyntheticEvent,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: KeySequence,
}

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<markAsDeleteButtonInterface> = ({actionHandler, action, hotKeyName}) => {
  const { t } = useTranslation();
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive)
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={t('cuttingActions.delete-restore-tooltip', { hotkeyName: hotKeyName })}
      ref={ref}
      role="button" tabIndex={0}
      aria-label={t('cuttingActions.delete-restore-tooltip-aria', { hotkeyName: hotKeyName })}
      onClick={(event: SyntheticEvent) => actionHandler(event, action, undefined, undefined, ref)}
      onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
        actionHandler(event, action, undefined, undefined, undefined)
      }}}
      >
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? t('cuttingActions.delete-button') : t("cuttingActions.restore-button")}</div>
    </div>
  );
}

export default CuttingActions;
