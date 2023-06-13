import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, flexGapReplacementStyle, tileButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faFileExport, faTimesCircle, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { setState, setPageNumber, finish } from '../redux/finishSlice'

import { useTranslation } from 'react-i18next';
import { selectTheme } from "../redux/themeSlice";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC = () => {

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
  const theme = useSelector(selectTheme)
  const dispatch = useDispatch();

  const finish = () => {
    dispatch(setState(stateName));
    dispatch(setPageNumber(1))
  }

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
    <div css={[basicButtonStyle(theme), tileButtonStyle(theme)]}
      role="button" tabIndex={0}
      onClick={finish}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        finish()
      } }}>
      <FontAwesomeIcon icon={iconName} size="2x"/>
      <div style={{padding: '0px 20px'}}>{buttonString}</div>
    </div>
  );
};

export default FinishMenu;
