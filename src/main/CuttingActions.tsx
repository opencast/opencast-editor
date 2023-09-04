import React from "react";

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
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'
import { KEYMAP } from "../globalKeys";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

import { useTranslation } from 'react-i18next';
import { selectTheme, Theme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";
import { useHotkeys } from "react-hotkeys-hook";

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
  const dispatchAction = (action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => {
    dispatch(action())

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur()
    }
  }

  // Maps functions to hotkeys
  useHotkeys(KEYMAP.cutting.cut.key, () => dispatchAction(cut, undefined), {preventDefault: true}, [cut]);
  useHotkeys(KEYMAP.cutting.delete.key, () => dispatchAction(markAsDeletedOrAlive, undefined), {preventDefault: true}, [markAsDeletedOrAlive]);
  useHotkeys(KEYMAP.cutting.mergeLeft.key, () => dispatchAction(mergeLeft, undefined), {preventDefault: true}, [mergeLeft]);
  useHotkeys(KEYMAP.cutting.mergeRight.key, () => dispatchAction(mergeRight, undefined), {preventDefault: true}, [mergeRight]);

  const cuttingStyle = css({
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

  return (
    <div css={cuttingStyle}>
      <div css={blockStyle}>
        <CuttingActionsButton iconName={faCut}
          actionName={t("cuttingActions.cut-button")} actionHandler={dispatchAction} action={cut}
          tooltip={t('cuttingActions.cut-tooltip', { hotkeyName: KEYMAP.cutting.cut.key })}
          ariaLabelText={t('cuttingActions.cut-tooltip-aria', { hotkeyName: KEYMAP.cutting.cut.key })}
        />
        <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
          hotKeyName={KEYMAP.cutting.delete.key}
        />
        <CuttingActionsButton iconName={faStepBackward}
          actionName={t("cuttingActions.mergeLeft-button")} actionHandler={dispatchAction} action={mergeLeft}
          tooltip={t('cuttingActions.mergeLeft-tooltip', { hotkeyName: KEYMAP.cutting.mergeLeft.key })}
          ariaLabelText={t('cuttingActions.mergeLeft-tooltip-aria', { hotkeyName: KEYMAP.cutting.mergeLeft.key })}
        />
        <CuttingActionsButton iconName={faStepForward}
          actionName={t("cuttingActions.mergeRight-button")} actionHandler={dispatchAction} action={mergeRight}
          tooltip={t('cuttingActions.mergeRight-tooltip', { hotkeyName: KEYMAP.cutting.mergeRight.key})}
          ariaLabelText={t('cuttingActions.mergeRight-tooltip-aria', { hotkeyName: KEYMAP.cutting.mergeRight.key })}
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
  actionHandler: (action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({iconName, actionName, actionHandler, action, tooltip, ariaLabelText}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const theme = useSelector(selectTheme);

  return (
    <ThemedTooltip title={tooltip}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle(theme)]}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabelText}
        onClick={() => actionHandler(action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(action, undefined)
        } }}
      >
        <FontAwesomeIcon icon={iconName} size="1x" />
        <span>{actionName}</span>
      </div>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (action: ActionCreatorWithoutPayload<string>, ref: React.RefObject<HTMLDivElement> | undefined) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: string,
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
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle(theme)]}
        ref={ref}
        role="button" tabIndex={0}
        aria-label={t('cuttingActions.delete-restore-tooltip-aria', { hotkeyName: hotKeyName })}
        onClick={() => actionHandler(action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          actionHandler(action, undefined)
        } }}
      >
        <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
        <div>{isCurrentSegmentAlive ? t('cuttingActions.delete-button') : t("cuttingActions.restore-button")}</div>
      </div>
    </ThemedTooltip>
  );
}

export default CuttingActions;
