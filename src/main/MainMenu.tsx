import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faListUl, faPhotoVideo, faSignOutAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState, mainMenu } from '../redux/mainMenuSlice'
import { setPageNumber } from '../redux/finishSlice'

import { MainMenuStateNames } from '../types'
import { settings } from '../config'
import { basicButtonStyle } from '../cssStyles'
import { setIsPlaying } from "../redux/videoSlice";

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

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
    <nav css={mainMenuStyle} title="Main Menu" role="navigation" aria-label="Main Navigation">
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

  return (
    <li css={[basicButtonStyle, mainMenuButtonStyle]}
      role="menuitem" tabIndex={0}
      onClick={ onMenuItemClicked }
      onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => { if (event.key === "Enter") {
        onMenuItemClicked()
      }}}
      >
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{stateName}</div>
    </li>
  );
};

export default MainMenu;
