import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faFileExport, faTimesCircle, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { setState, setPageNumber, finish } from '../redux/finishSlice'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { getTheme } from './ThemeSwitcher';

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC<{}> = () => {

  const finishMenuStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={finishMenuStyle}>
        <FinishMenuButton iconName={faSave} stateName="Save changes"/>
        <FinishMenuButton iconName={faFileExport} stateName="Start processing"/>
        <FinishMenuButton iconName={faTimesCircle} stateName="Discard changes"/>
    </div>
  );
}

/**
 * Buttons for the finish menu
 */
const FinishMenuButton: React.FC<{iconName: IconDefinition, stateName: finish["value"]}> = ({iconName, stateName}) => {

  const { t } = useTranslation();
  const mode = useSelector((state: RootStateOrAny) => state.theme);
  const theme = getTheme(mode);

  const dispatch = useDispatch();

  const finish = () => {
    dispatch(setState(stateName));
    dispatch(setPageNumber(1))
  }

  const finishMenuButtonStyle = css({
    width: '250px',
    height: '220px',
    flexDirection: 'column' as const,
    fontSize: "x-large",
    ...(flexGapReplacementStyle(30, false)),
    boxShadow: theme.boxShadow,
    background: theme.element_bg,
  });

  var buttonString;
  switch(stateName) {
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

  return (
    <div css={[basicButtonStyle, finishMenuButtonStyle]}
    role="button" tabIndex={0}
      onClick={ finish }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        finish()
      }}}>
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{buttonString}</div>
    </div>
  );
};





export default FinishMenu;
