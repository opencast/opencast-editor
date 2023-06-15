import React, { SyntheticEvent } from "react";

import { basicButtonStyle } from '../cssStyles'

import { IconType } from "react-icons";
import { FiScissors, FiChevronLeft, FiChevronRight} from "react-icons/fi";
import { FaTrash, FaTrashRestore } from "react-icons/fa";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'
import { GlobalHotKeys, KeySequence, KeyMapOptions } from "react-hotkeys";
import { cuttingKeyMap } from "../globalKeys";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

import { useTranslation } from 'react-i18next';
import { selectTheme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useDispatch();

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => {
    event.preventDefault()                      // Prevent page scrolling due to Space bar press
    event.stopPropagation()                     // Prevent video playback due to Space bar press
    dispatch(action())

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  const handlers = {
    cut: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, cut, undefined) } },
    delete: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, markAsDeletedOrAlive, undefined) } },
    mergeLeft: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, mergeLeft, undefined) } },
    mergeRight: (keyEvent?: KeyboardEvent | SyntheticEvent) => { if (keyEvent) { dispatchAction(keyEvent, mergeRight, undefined) } },
  }

  const cuttingStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    // ...(flexGapReplacementStyle(30, true)),
  })

  const verticalLineStyle = css({
    borderLeft: '2px solid #DDD;',
    height: '32px',
  })

  return (
    <GlobalHotKeys keyMap={cuttingKeyMap} handlers={handlers} allowChanges={true} >
      <div css={cuttingStyle}>
        <CuttingActionsButton Icon={FiScissors}
          actionName={t("cuttingActions.cut-button")} actionHandler={dispatchAction} action={cut}
          tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.cut.name] as KeyMapOptions).sequence })}
        />
        <div css={verticalLineStyle} />
        <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
          hotKeyName={(cuttingKeyMap[handlers.delete.name] as KeyMapOptions).sequence}
        />
        <div css={verticalLineStyle} />
        <CuttingActionsButton Icon={FiChevronLeft}
          actionName={t("cuttingActions.mergeLeft-button")} actionHandler={dispatchAction} action={mergeLeft}
          tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeLeft.name] as KeyMapOptions).sequence })}
        />
        <div css={verticalLineStyle} />
        <CuttingActionsButton Icon={FiChevronRight}
          actionName={t("cuttingActions.mergeRight-button")} actionHandler={dispatchAction} action={mergeRight}
          tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
          ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: (cuttingKeyMap[handlers.mergeRight.name] as KeyMapOptions).sequence })}
        />
        {/* <CuttingActionsButton Icon={faQuestion} actionName="Reset changes" action={null}
          tooltip="Not implemented"
          ariaLabelText="Reset changes. Not implemented"
        />
        <CuttingActionsButton Icon={faQuestion} actionName="Undo" action={null}
          tooltip="Not implemented"
          ariaLabelText="Undo. Not implemented"
        /> */}
      </div>
    </GlobalHotKeys>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = css({
  padding: '16px',
  // boxShadow: `${theme.boxShadow}`,
  // background: `${theme.element_bg}`
});

interface cuttingActionsButtonInterface {
  Icon: IconType,
  actionName: string,
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({Icon, actionName, actionHandler, action, tooltip, ariaLabelText}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const theme = useSelector(selectTheme);

  return (
    <ThemedTooltip title={tooltip}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabelText}
        onClick={(event: SyntheticEvent) => actionHandler(event, action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(event, action, undefined)
        } }}
      >
        <Icon />
        <span>{actionName}</span>
      </div>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (event: KeyboardEvent | SyntheticEvent, action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
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
    <ThemedTooltip title={t('cuttingActions.delete-restore-tooltip', { hotkeyName: hotKeyName })}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0}
        aria-label={t('cuttingActions.delete-restore-tooltip-aria', { hotkeyName: hotKeyName })}
        onClick={(event: SyntheticEvent) => actionHandler(event, action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(event, action, undefined)
        } }}
      >
        {isCurrentSegmentAlive ? <FaTrash /> : <FaTrashRestore />}
        <div>{isCurrentSegmentAlive ? t('cuttingActions.delete-button') : t("cuttingActions.restore-button")}</div>
      </div>
    </ThemedTooltip>
  );
}

export default CuttingActions;
