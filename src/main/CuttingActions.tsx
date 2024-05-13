import React from "react";

import { BREAKPOINTS, basicButtonStyle, customIconStyle, undisplay } from "../cssStyles";

import { IconType } from "react-icons";
import { LuScissors, LuChevronLeft, LuChevronRight, LuTrash, LuMoveHorizontal } from "react-icons/lu";
import TrashRestore from "../img/trash-restore.svg?react";

import { css } from "@emotion/react";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight, mergeAll,
} from "../redux/videoSlice";
import { KEYMAP, rewriteKeys } from "../globalKeys";
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();

  /**
   * General action callback for cutting actions
   * @param event event triggered by click or button press
   * @param action redux event to dispatch
   * @param ref Pass a reference if the clicked element should lose focus
   */
  const dispatchAction = (action: ActionCreatorWithoutPayload<string>, ref?: React.RefObject<HTMLDivElement>) => {
    dispatch(action());

    // Lose focus if clicked by mouse
    if (ref) {
      ref.current?.blur();
    }
  };

  // Maps functions to hotkeys
  useHotkeys(
    KEYMAP.cutting.cut.key,
    () => dispatchAction(cut),
    { preventDefault: true },
    [cut]
  );
  useHotkeys(
    KEYMAP.cutting.delete.key,
    () => dispatchAction(markAsDeletedOrAlive),
    { preventDefault: true },
    [markAsDeletedOrAlive]
  );
  useHotkeys(
    KEYMAP.cutting.mergeLeft.key,
    () => dispatchAction(mergeLeft),
    { preventDefault: true },
    [mergeLeft]
  );
  useHotkeys(
    KEYMAP.cutting.mergeRight.key,
    () => dispatchAction(mergeRight),
    { preventDefault: true },
    [mergeRight]
  );

  const cuttingStyle = css({
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "center",
    alignItems: "center",

    flexWrap: "wrap",
  });

  const verticalLineStyle = css({
    borderLeft: "2px solid #DDD;",
    height: "32px",
  });

  return (
    <div css={cuttingStyle}>
      <CuttingActionsButton Icon={LuScissors}
        actionName={t("cuttingActions.cut-button")}
        actionHandler={dispatchAction}
        action={cut}
        tooltip={t("cuttingActions.cut-tooltip", { hotkeyName: rewriteKeys(KEYMAP.cutting.cut.key) })}
        ariaLabelText={t("cuttingActions.cut-tooltip-aria", { hotkeyName: rewriteKeys(KEYMAP.cutting.cut.key) })}
      />
      <div css={verticalLineStyle} />
      <MarkAsDeletedButton actionHandler={dispatchAction} action={markAsDeletedOrAlive}
        hotKeyName={rewriteKeys(KEYMAP.cutting.delete.key)}
      />
      <div css={verticalLineStyle} />
      <CuttingActionsButton Icon={LuChevronLeft}
        actionName={t("cuttingActions.mergeLeft-button")}
        actionHandler={dispatchAction}
        action={mergeLeft}
        tooltip={t("cuttingActions.mergeLeft-tooltip", { hotkeyName: rewriteKeys(KEYMAP.cutting.mergeLeft.key) })}
        ariaLabelText={
          t("cuttingActions.mergeLeft-tooltip-aria", { hotkeyName: rewriteKeys(KEYMAP.cutting.mergeLeft.key) })
        }
      />
      <div css={verticalLineStyle} />
      <CuttingActionsButton Icon={LuChevronRight}
        actionName={t("cuttingActions.mergeRight-button")}
        actionHandler={dispatchAction}
        action={mergeRight}
        tooltip={t("cuttingActions.mergeRight-tooltip", { hotkeyName: rewriteKeys(KEYMAP.cutting.mergeRight.key) })}
        ariaLabelText={
          t("cuttingActions.mergeRight-tooltip-aria", { hotkeyName: rewriteKeys(KEYMAP.cutting.mergeRight.key) })
        }
      />
      <div css={verticalLineStyle} />
      <CuttingActionsButton Icon={LuMoveHorizontal}
        actionName={t("cuttingActions.merge-all-button")}
        actionHandler={dispatchAction}
        action={mergeAll}
        tooltip={t("cuttingActions.merge-all-tooltip")}
        ariaLabelText={t("cuttingActions.merge-all-tooltip-aria")}
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
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = css({
  padding: "16px",
  // boxShadow: `${theme.boxShadow}`,
  // background: `${theme.element_bg}`
});

interface cuttingActionsButtonInterface {
  Icon: IconType,
  actionName: string,
  actionHandler: (action: ActionCreatorWithoutPayload<string>, ref?: React.RefObject<HTMLDivElement>) => void,
  action: ActionCreatorWithoutPayload<string>,
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({
  Icon,
  actionName,
  actionHandler,
  action,
  tooltip,
  ariaLabelText,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  return (
    <ThemedTooltip title={tooltip}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabelText}
        onClick={() => actionHandler(action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === " " || event.key === "Enter") {
            actionHandler(action);
          }
        }}
      >
        <Icon />
        <span css={undisplay(BREAKPOINTS.medium)}>{actionName}</span>
      </div>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (action: ActionCreatorWithoutPayload<string>, ref?: React.RefObject<HTMLDivElement>) => void,
  action: ActionCreatorWithoutPayload<string>,
  hotKeyName: string,
}

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton: React.FC<markAsDeleteButtonInterface> = ({
  actionHandler,
  action,
  hotKeyName,
}) => {
  const { t } = useTranslation();
  const isCurrentSegmentAlive = useAppSelector(selectIsCurrentSegmentAlive);
  const ref = React.useRef<HTMLDivElement>(null);

  const theme = useTheme();

  return (
    <ThemedTooltip title={t("cuttingActions.delete-restore-tooltip", { hotkeyName: hotKeyName })}>
      <div css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
        ref={ref}
        role="button" tabIndex={0}
        aria-label={t("cuttingActions.delete-restore-tooltip-aria", { hotkeyName: hotKeyName })}
        onClick={() => actionHandler(action, ref)}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === " " || event.key === "Enter") {
            actionHandler(action);
          }
        }}
      >
        {isCurrentSegmentAlive ? <LuTrash /> : <TrashRestore css={customIconStyle} /> }
        <span css={undisplay(BREAKPOINTS.medium)}>
          {isCurrentSegmentAlive ? t("cuttingActions.delete-button") : t("cuttingActions.restore-button")}
        </span>
      </div>
    </ThemedTooltip>
  );
};

export default CuttingActions;
