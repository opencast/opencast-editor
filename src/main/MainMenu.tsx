import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faListUl, faPhotoVideo, faSignOutAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState } from '../redux/mainMenuSlice'
import { setPageNumber } from '../redux/finishSlice'

import { MainMenuStateNames } from '../types'
import { basicButtonStyle } from '../cssStyles'

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const mainMenuStyle = {
    borderRight: '1px solid #BBB',
    width: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
    alignItems: 'center',
    padding: '20px',
    gap: '30px',
  };

  return (
    <div style={mainMenuStyle} title="MainMenu">
      <MainMenuButton iconName={faFilm} stateName={MainMenuStateNames.cutting}/>
      <MainMenuButton iconName={faListUl} stateName={MainMenuStateNames.metadata}/>
      <MainMenuButton iconName={faPhotoVideo} stateName={MainMenuStateNames.thumbnail}/>
      <MainMenuButton iconName={faSignOutAlt} stateName={MainMenuStateNames.finish}/>
    </div>
  );
};

/**
 * A button to set the state of the app
 * @param param0
 */
const MainMenuButton: React.FC<{iconName: IconDefinition, stateName: string}> = ({iconName, stateName}) => {

  const dispatch = useDispatch();
  const activeState = useSelector(selectMainMenuState)

  const mainMenuButtonStyle = css({
    width: '100%',
    height: '100px',
    ...(activeState === stateName) && {
      backgroundColor: '#DDD',
    },
    flexDirection: 'column' as const,
  });

  return (
    <div css={[basicButtonStyle, mainMenuButtonStyle]} title={stateName}
      onClick={() => {
        dispatch(setState(stateName));
        if (stateName === MainMenuStateNames.finish) {
          dispatch(setPageNumber(0))
        }
      }}>
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{stateName}</div>
    </div>
  );
};

export default MainMenu;
