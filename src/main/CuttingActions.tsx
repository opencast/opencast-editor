import React from "react";

import { BREAKPOINTS, basicButtonStyle, customIconStyle, undisplay } from "../cssStyles";

import { IconType } from "react-icons";
import { LuScissors, LuChevronLeft, LuChevronRight, LuTrash, LuMoveHorizontal } from "react-icons/lu";
import TrashRestore from "../img/trash-restore.svg?react";

import { css } from "@emotion/react";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  cut,
  markAsDeletedOrAlive,
  mergeAll,
  mergeLeft,
  mergeRight,
  selectIsCurrentSegmentAlive,
  selectTimelineZoom,
  selectTimelineZoomMax,
  setTimelineZoom,
  timelineZoomIn,
  timelineZoomOut,
} from "../redux/videoSlice";
import { KEYMAP, rewriteKeys } from "../globalKeys";
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from "@reduxjs/toolkit";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { Slider } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import { ProtoButton } from "@opencast/appkit";

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
  const dispatchAction = (
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload?: ActionCreatorWithPayload<number, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any,
    ref?: React.RefObject<HTMLButtonElement>,
  ) => {
    if (action) {
      dispatch(action());
    }
    if (actionWithPayload) {
      dispatch(actionWithPayload(payload));
    }

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
    [cut],
  );
  useHotkeys(
    KEYMAP.cutting.delete.key,
    () => dispatchAction(markAsDeletedOrAlive),
    { preventDefault: true },
    [markAsDeletedOrAlive],
  );
  useHotkeys(
    KEYMAP.cutting.mergeLeft.key,
    () => dispatchAction(mergeLeft),
    { preventDefault: true },
    [mergeLeft],
  );
  useHotkeys(
    KEYMAP.cutting.mergeRight.key,
    () => dispatchAction(mergeRight),
    { preventDefault: true },
    [mergeRight],
  );
  useHotkeys(
    KEYMAP.cutting.zoomIn.key,
    () => dispatchAction(timelineZoomIn),
    { preventDefault: true, combinationKey: KEYMAP.cutting.zoomIn.combinationKey },
    [timelineZoomIn],
  );
  useHotkeys(
    KEYMAP.cutting.zoomOut.key,
    () => dispatchAction(timelineZoomOut, undefined),
    { preventDefault: true },
    [timelineZoomOut],
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
        actionWithPayload={undefined}
        payload={undefined}
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
        actionWithPayload={undefined}
        payload={undefined}
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
        actionWithPayload={undefined}
        payload={undefined}
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
        actionWithPayload={undefined}
        payload={undefined}
        tooltip={t("cuttingActions.merge-all-tooltip")}
        ariaLabelText={t("cuttingActions.merge-all-tooltip-aria")}
      />
      <div css={verticalLineStyle} />
      <ZoomSlider actionHandler={dispatchAction}
        tooltip={t("cuttingActions.zoomSlider-tooltip", {
          hotkeyNameIn: rewriteKeys(KEYMAP.cutting.zoomIn),
          hotkeyNameOut: rewriteKeys(KEYMAP.cutting.zoomOut),
        })}
        ariaLabelText={t("cuttingActions.zoomSlider-aria", {
          hotkeyNameIn: rewriteKeys(KEYMAP.cutting.zoomIn),
          hotkeyNameOut: rewriteKeys(KEYMAP.cutting.zoomOut),
        })}
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
});

interface cuttingActionsButtonInterface {
  Icon: IconType,
  actionName: string,
  actionHandler: (
    action: ActionCreatorWithoutPayload<string>,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    ref?: React.RefObject<HTMLButtonElement>,
  ) => void,
  action: ActionCreatorWithoutPayload<string>,
  actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
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
  actionWithPayload,
  payload,
  tooltip,
  ariaLabelText,
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  return (
    <ThemedTooltip title={tooltip}>
      <ProtoButton
        {...{ ref }}
        aria-label={ariaLabelText}
        onClick={() => actionHandler(action, actionWithPayload, payload, ref)}
        css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
      >
        <Icon />
        <span css={undisplay(BREAKPOINTS.medium)}>{actionName}</span>
      </ProtoButton>
    </ThemedTooltip>
  );
};

interface markAsDeleteButtonInterface {
  actionHandler: (
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    ref?: React.RefObject<HTMLButtonElement>
  ) => void,
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
  const ref = React.useRef<HTMLButtonElement>(null);

  const theme = useTheme();

  return (
    <ThemedTooltip title={t("cuttingActions.delete-restore-tooltip", { hotkeyName: hotKeyName })}>
      <ProtoButton
        {...{ ref }}
        aria-label={t("cuttingActions.delete-restore-tooltip-aria", { hotkeyName: hotKeyName })}
        onClick={() => actionHandler(action, undefined, undefined, ref)}
        css={[basicButtonStyle(theme), cuttingActionButtonStyle]}
      >
        {isCurrentSegmentAlive ? <LuTrash /> : <TrashRestore css={customIconStyle} /> }
        <span css={undisplay(BREAKPOINTS.medium)}>
          {isCurrentSegmentAlive ? t("cuttingActions.delete-button") : t("cuttingActions.restore-button")}
        </span>
      </ProtoButton>
    </ThemedTooltip>
  );
};

interface ZoomSliderInterface {
  actionHandler: (
    action: ActionCreatorWithoutPayload<string> | undefined,
    actionWithPayload: ActionCreatorWithPayload<number, string> | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any,
    ref?: React.RefObject<HTMLButtonElement>,
  ) => void,
  tooltip: string,
  ariaLabelText: string,
}

const ZoomSlider : React.FC<ZoomSliderInterface> = ({
  actionHandler,
  tooltip,
  ariaLabelText,
}) => {

  const { t } = useTranslation();
  const theme = useTheme();
  const timelineZoom = useAppSelector(selectTimelineZoom);
  const timelineZoomMax = useAppSelector(selectTimelineZoomMax);

  // Callback for the zoom slider
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const zoomSliderOnChange = (event: Event, newValue: number | number[]) => {
    actionHandler(undefined, setTimelineZoom, newValue, undefined);
  };

  const zoomStyle = css({
    display: "flex",
    flexDirection: "row",
    paddingLeft: "16px",
    paddingRight: "16px",
    gap: "15px",
    justifyContent: "center",
    alignItems: "center",
  });


  const sliderStyle = css({
    width: "150px",
    "& .MuiSlider-thumb": {
      color: `${theme.slider_thumb_color}`,
      "&:hover, &.Mui-focusVisible, &.Mui-active": {
        boxShadow: `${theme.slider_thumb_shadow}`,
      },
    },
    "& .MuiSlider-rail": {
      color: `${theme.slider_track_color}`,
    },
    "& .MuiSlider-track": {
      color: `${theme.slider_track_color}`,
    },
  });

  return (
    <ThemedTooltip title={tooltip}>
      <div css={zoomStyle}>
        <span>{t("cuttingActions.zoom")}</span>
        <Slider
          css={sliderStyle}
          min={1}
          max={timelineZoomMax}
          step={0.1}
          value={timelineZoom}
          onChange={zoomSliderOnChange}
          aria-label={ariaLabelText}
          valueLabelDisplay="off"
        />
      </div>
    </ThemedTooltip>
  );
};

export default CuttingActions;
