import React from "react";

import FinishMenu from "./FinishMenu";
import Save from "./Save";
import Discard from "./Discard";
import WorkflowSelection from "./WorkflowSelection";
import WorkflowConfiguration from "./WorkflowConfiguration";

import { LuDoorOpen } from "react-icons/lu";

import { css } from "@emotion/react";
import { basicButtonStyle, navigationButtonStyle } from "../cssStyles";

import { IconType } from "react-icons";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectFinishState, selectPageNumber, setPageNumber } from "../redux/finishSlice";
import { useTheme } from "../themes";
import { settings } from "../config";
import { useTranslation } from "react-i18next";
import { ProtoButton } from "@opencast/appkit";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const Finish: React.FC = () => {

  const pageNumber = useAppSelector(selectPageNumber);
  const finishState = useAppSelector(selectFinishState);

  const render = () => {
    if (pageNumber === 0) {
      return (
        <FinishMenu />
      );
    } else if (pageNumber === 1) {
      if (finishState === "Save changes") {
        return (
          <Save />
        );
      } else if (finishState === "Start processing") {
        return (
          <WorkflowSelection />
        );
      } else if (finishState === "Discard changes") {
        return (
          <Discard />
        );
      }
    } else if (pageNumber === 2) {
      return (
        <WorkflowConfiguration />
      );
    }
  };

  return (
    <>{render()}</>
  );
};

/**
 * Takes you to a different page
 */
export const PageButton: React.FC<{
  pageNumber: number,
  label: string,
  Icon: IconType;
}> = ({
  pageNumber,
  label,
  Icon,
}) => {

  const theme = useTheme();

  // Initialize redux variables
  const dispatch = useAppDispatch();

  const onPageChange = () => {
    dispatch(setPageNumber(pageNumber));
  };

  const pageButtonStyle = css({
    minWidth: "100px",
    padding: "16px",
    justifyContent: "center",
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  });

  return (
    <ProtoButton
      onClick={onPageChange}
      css={[basicButtonStyle(theme), pageButtonStyle]}
    >
      <Icon />
      <span>{label}</span>
    </ProtoButton>
  );
};

/**
 * Takes you back to the callback url resource
 */
export const CallbackButton: React.FC = () => {

  const { t } = useTranslation();

  const theme = useTheme();

  const openCallbackUrl = () => {
    window.open(settings.callbackUrl, "_self");
  };

  return (
    <>
      {settings.callbackUrl !== undefined &&
        <ProtoButton
          onClick={openCallbackUrl}
          css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        >
          <LuDoorOpen />
          <span>
            {settings.callbackSystem ?
              t("various.callback-button-system", { system: settings.callbackSystem }) :
              t("various.callback-button-generic")
            }
          </span>
        </ProtoButton>
      }
    </>
  );
};


export default Finish;
