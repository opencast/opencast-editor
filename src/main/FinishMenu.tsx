import React, { useState } from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle } from '../cssStyles'

import { IconType } from "react-icons";
import { FiSave, FiDatabase, FiXCircle } from "react-icons/fi";

import { useDispatch, useSelector } from 'react-redux';
import { setState, setPageNumber, finish } from '../redux/finishSlice'

import { useTranslation } from 'react-i18next';
import { selectTheme } from "../redux/themeSlice";
import { DialogSave } from "./Save";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC = () => {

  const finishMenuStyle = css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={finishMenuStyle}>
      <FinishMenuButton Icon={FiSave} stateName="Save changes"/>
      <FinishMenuButton Icon={FiDatabase} stateName="Start processing"/>
      <FinishMenuButton Icon={FiXCircle} stateName="Discard changes"/>
    </div>
  );
}

/**
 * Buttons for the finish menu
 */
const FinishMenuButton: React.FC<{Icon: IconType, stateName: finish["value"]}> = ({Icon, stateName}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch();

  const [renderDialog, setRenderDialog] = useState(false)
  const handleRenderDialogClose = () => {
    setRenderDialog(false)
  }

  function finish(stateName: finish["value"]) {
    switch (stateName) {
      case "Save changes":
        setRenderDialog(true);
        break
      default:
        dispatch(setState(stateName));
        dispatch(setPageNumber(1))
        break
    }
  }

  let buttonString;
  switch (stateName) {
    case "Save changes":
      buttonString = t("finishMenu.save-button");
      break;
    case "Start processing":
      buttonString = t("finishMenu.start-button");
      break;
    case "Discard changes":
      buttonString = t("finishMenu.discard-button");
      break;
    default:
      buttonString = "Could not load String value";
      break;
  }

  const iconStyle = css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    background: `${theme.background_finish_menu_icon}`,
    color: `${theme.text}`,
    borderRadius: '50%',
    width: '90px',
    height: '90px',
  })

  const labelStyle = css({
    padding: '0px 20px',
  })

  return (
    <div>
      <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={() => finish(stateName)}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          finish(stateName)
        } }}>
        <div css={iconStyle}>
          <Icon css={{fontSize: 36}}/>
        </div>
        <div css={labelStyle}>{buttonString}</div>
      </div>
      {renderDialog ? <DialogSave isRender={renderDialog} stopRender={handleRenderDialogClose} /> : ""}
    </div>
  );
};

export default FinishMenu;
