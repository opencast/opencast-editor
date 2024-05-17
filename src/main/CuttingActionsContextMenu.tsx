import React from "react";
import { useTranslation } from "react-i18next";

import { LuChevronLeft, LuChevronRight, LuScissors, LuTrash } from "react-icons/lu";
import TrashRestore from "../img/trash-restore.svg?react";

import { ContextMenuItem, ThemedContextMenu } from "./ContextMenu";
import { KEYMAP, rewriteKeys } from "../globalKeys";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { cut, markAsDeletedOrAlive, mergeLeft, mergeRight, selectIsCurrentSegmentAlive } from "../redux/videoSlice";

const CuttingActionsContextMenu: React.FC<{
  children: React.ReactNode,
}> = ({
  children,
}) => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();
  const isCurrentSegmentAlive = useAppSelector(selectIsCurrentSegmentAlive);

  const cuttingContextMenuItems: ContextMenuItem[] = [
    {
      name: t("cuttingActions.cut-button"),
      action: () => dispatch(cut()),
      icon: LuScissors,
      hotKey: KEYMAP.cutting.cut.key,
      ariaLabel: t("cuttingActions.cut-tooltip-aria", {
        hotkeyName: rewriteKeys(KEYMAP.cutting.cut.key),
      }),
    },
    {
      name: isCurrentSegmentAlive ? t("cuttingActions.delete-button") : t("cuttingActions.restore-button"),
      action: () => dispatch(markAsDeletedOrAlive()),
      icon: isCurrentSegmentAlive ? LuTrash : TrashRestore,
      hotKey: KEYMAP.cutting.delete.key,
      ariaLabel: t("cuttingActions.delete-restore-tooltip-aria", {
        hotkeyName: rewriteKeys(KEYMAP.cutting.delete.key),
      }),
    },
    {
      name: t("cuttingActions.mergeLeft-button"),
      action: () => dispatch(mergeLeft()),
      icon: LuChevronLeft,
      hotKey: KEYMAP.cutting.mergeLeft.key,
      ariaLabel: t("cuttingActions.mergeLeft-tooltip-aria", {
        hotkeyName: rewriteKeys(KEYMAP.cutting.mergeLeft.key),
      }),
    },
    {
      name: t("cuttingActions.mergeRight-button"),
      action: () => dispatch(mergeRight()),
      icon: LuChevronRight,
      hotKey: KEYMAP.cutting.mergeRight.key,
      ariaLabel: t("cuttingActions.mergeRight-tooltip-aria", {
        hotkeyName: rewriteKeys(KEYMAP.cutting.mergeRight.key),
      }),
    },
  ];

  return (
    <ThemedContextMenu
      menuItems={cuttingContextMenuItems}
    >
      {children}
    </ThemedContextMenu>
  );
};

export default CuttingActionsContextMenu;
