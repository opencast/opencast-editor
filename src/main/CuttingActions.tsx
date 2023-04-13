import React, { SyntheticEvent } from "react";

import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCut,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight, setTimelineZoom
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence, KeyMapOptions } from "react-hotkeys";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { selectTheme, Theme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";
import { Slider } from "@mui/material";

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (
    event: KeyboardEvent | SyntheticEvent | Event,
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    payload: any,
    ref: React.RefObject<HTMLDivElement> | undefined
  ) => {
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
  }

  // Callback for the zoom slider
  const zoomSliderOnChange = (event: Event, newValue: number | number[]) => {
    dispatchAction(event, undefined, setTimelineZoom, newValue, undefined)
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

  const sliderStyle = css({
    width: '100px',
    "& .MuiSlider-thumb": {
      color: `${theme.text}`,
    },
    "& .MuiSlider-rail": {
      color: `${theme.text}`,
    },
    "& .MuiSlider-track": {
      color: `${theme.text}`,
    },
  })

  return (
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={handlers} allowChanges={true} >
      <div css={cuttingStyle}>
          <div css={blockStyle}>
            <CuttingActionsButton iconName={faCut}
              actionName={t("cuttingActions.cut-button")} actionHandler={dispatchAction} action={cut} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
            />
            <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
              hotKeyName={(cuttingKeyMap[handlers.delete.name] as KeyMapOptions).sequence}
            />
            <CuttingActionsButton iconName={faStepBackward}
              actionName={t("cuttingActions.mergeLeft-button")} actionHandler={dispatchAction} action={mergeLeft} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
            />
            <CuttingActionsButton iconName={faStepForward}
              actionName={t("cuttingActions.mergeRight-button")} actionHandler={dispatchAction} action={mergeRight} actionWithPayload={undefined} payload={undefined}
              tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
              ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
            />
          </div>
          <div css={blockStyle}>
            <Slider
              css={sliderStyle}
              min={1}
              max={10}
              step={0.1}
              defaultValue={1}
              onChange={zoomSliderOnChange}
              aria-label={t("zoomSlider-aria")}
              valueLabelDisplay="off"
            />
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
const cuttingActionButtonStyle = (theme: Theme) => css({
  padding: '16px',
  boxShadow: `${theme.boxShadow}`,
  background: `${theme.element_bg}`
});

interface cuttingActionsButtonInterface {
  iconName: IconProp,
  actionName: string,
  actionHandler: (
    event: KeyboardEvent | SyntheticEvent,
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
  const theme = useSelector(selectTheme);

  return (
    <ThemedTooltip title={tooltip}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle(theme)]}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabelText}
        onClick={ (event: SyntheticEvent) => actionHandler(event, action, actionWithPayload, payload, ref) }
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(event, action, actionWithPayload, payload, undefined)
        }}}
        >
        <FontAwesomeIcon icon={iconName} size="1x" />
        <span>{actionName}</span>
      </div>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (
    event: KeyboardEvent | SyntheticEvent,
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

  const theme = useSelector(selectTheme);

  return (
    <ThemedTooltip title={t('cuttingActions.delete-restore-tooltip', { hotkeyName: hotKeyName } )}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle(theme)]}
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
    </ThemedTooltip>
  );
}

export default CuttingActions;
