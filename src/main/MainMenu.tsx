import React from "react";

import { css } from '@emotion/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faListUl, faPhotoVideo, faSignOutAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState, mainMenu } from '../redux/mainMenuSlice'
import { setPageNumber } from '../redux/finishSlice'

import { MainMenuStateNames } from '../types'
import { settings } from '../config'
import { basicButtonStyle } from '../cssStyles'
import { setIsPlaying } from "../redux/videoSlice";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const { t } = useTranslation();

  const mainMenuStyle = css({
    borderRight: '1px solid #BBB',
    width: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
    alignItems: 'center',
    padding: '20px',
    gap: '30px',
  });

  return (
    <nav css={mainMenuStyle} title={t("mainMenu-mainMenu-tooltip")} role="navigation" aria-label={t("mainMenu-tooltip-aria")}>
      <MainMenuButton iconName={faFilm} stateName={MainMenuStateNames.cutting}/>
      {settings.metadata.show && <MainMenuButton iconName={faListUl} stateName={MainMenuStateNames.metadata}/>}
      {settings.thumbnail.show && <MainMenuButton iconName={faPhotoVideo} stateName={MainMenuStateNames.thumbnail}/>}
      <MainMenuButton iconName={faSignOutAlt} stateName={MainMenuStateNames.finish}/>
    </nav>
  );
};

/**
 * A button to set the state of the app
 * @param param0
 */
const MainMenuButton: React.FC<{iconName: IconDefinition, stateName: mainMenu["value"]}> = ({iconName, stateName}) => {

  const { t } = useTranslation();

  const dispatch = useDispatch();
  const activeState = useSelector(selectMainMenuState)

  const onMenuItemClicked = () => {
    dispatch(setState(stateName));
    // Reset multi-page content to their first page
    if (stateName === MainMenuStateNames.finish) {
      dispatch(setPageNumber(0))
    }
    // Halt ongoing events
    dispatch(setIsPlaying(false))
  }

  const mainMenuButtonStyle = css({
    width: '100%',
    height: '100px',
    ...(activeState === stateName) && {
      backgroundColor: '#DDD',
    },
    flexDirection: 'column' as const,
  });

  var buttonString;
  switch(stateName) {
    case "Cutting":
      buttonString = t("mainMenu-cutting-button");
      break;
    case "Metadata":
      buttonString = t("mainMenu-metadata-button");
      break;
    case "Thumbnail":
      buttonString = t("mainMenu-thumbnail-button");
      break;
    case "Finish":
      buttonString = t("mainMenu-finish-button");
      break;
    default: 
      buttonString = "Could not load String value";
      break;
  }

  return (
    <li css={[basicButtonStyle, mainMenuButtonStyle]}
      role="menuitem" tabIndex={0}
      onClick={ onMenuItemClicked }
      onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => { if (event.key === "Enter") {
        onMenuItemClicked()
      }}}
      >
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{buttonString}</div>
    </li>
  );
};

export default MainMenu;
