import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle } from '../cssStyles'

import { IconType } from "react-icons";
import { LuSave, LuDatabase, LuXCircle } from "react-icons/lu";

import { useAppDispatch } from "../redux/store";
import { setState, setPageNumber, finish } from '../redux/finishSlice'

import { useTranslation } from 'react-i18next';
import { useTheme } from "../themes";

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
      <FinishMenuButton Icon={LuSave} stateName="Save changes"/>
      <FinishMenuButton Icon={LuDatabase} stateName="Start processing"/>
      <FinishMenuButton Icon={LuXCircle} stateName="Discard changes"/>
    </div>
  );
}

/**
 * Buttons for the finish menu
 */
const FinishMenuButton: React.FC<{Icon: IconType, stateName: finish["value"]}> = ({Icon, stateName}) => {

  const { t } = useTranslation();
  const theme = useTheme()
  const dispatch = useAppDispatch();

  const finish = () => {
    dispatch(setState(stateName));
    dispatch(setPageNumber(1))
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
    <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
      role="button" tabIndex={0}
      onClick={finish}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        finish()
      } }}>
      <div css={iconStyle}>
        <Icon css={{fontSize: 36}}/>
      </div>
      <div css={labelStyle}>{buttonString}</div>
    </div>
  );
};

export default FinishMenu;
