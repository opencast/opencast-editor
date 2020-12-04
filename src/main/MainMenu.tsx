import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm, faListUl, faPhotoVideo, faSignOutAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState } from '../redux/mainMenuSlice'

import { MainMenuStateNames } from '../types'

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const mainMenuStyle = {
    backgroundColor: 'snow',
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

  const mainMenuButtonStyle = {
    backgroundColor: 'snow',
    borderRadius: '10px',
    fontSize: 'medium',
    width: '100%',
    height: '100px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    //boxShadow: isActive ? 'inset 0 0 5px #000000' : '0',
    ...(activeState === stateName) && {
      backgroundColor: 'lightblue',
    },
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    gap: '10px',
  };

  return (
    <div css={mainMenuButtonStyle} title={stateName}
      onClick={() => {
        dispatch(setState(stateName));
      }}>
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{stateName}</div>
    </div>
  );
};

export default MainMenu;
