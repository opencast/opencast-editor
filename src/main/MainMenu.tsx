import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faFilm, faListUl, faPhotoVideo, faQuestion, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux'
import {
  setState, selectMainMenuState
} from '../redux/mainMenuSlice'

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const mainMenuStyle = {
    backgroundColor: 'snow',
    borderRight: '1px solid #BBB',
    width: '150px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
    //boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={mainMenuStyle} title="MainMenu">
      <MainMenuButton iconName={faFilm} stateName="Cutting"/>
      <MainMenuButton iconName={faListUl} stateName="Metadata"/>
      <MainMenuButton iconName={faPhotoVideo} stateName="Thumbnail"/>
      <MainMenuButton iconName={faQuestion} stateName="Start Workflow"/>
    </div>
  );
};

/**
 * A button to set the state of the app
 * TODO: Complete Styling
 * @param param0 
 */
const MainMenuButton: React.FC<{iconName: IconDefinition, stateName: string}> = ({iconName, stateName}) => {

  const dispatch = useDispatch();
  const activeState = useSelector(selectMainMenuState)

  const mainMenuButtonStyle = {
    backgroundColor: 'snow',
    borderRadius: '10px',
    fontSize: 'large',
    width: '100%',
    height: '150px',
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
    gap: '10px',
  };

  return (
    <div css={mainMenuButtonStyle} title={stateName}         
      onClick={() => { 
        dispatch(setState(stateName)); 
      }}>
      <FontAwesomeIcon  icon={iconName} size="3x"/>
      <div>{stateName}</div>
    </div>
  );
};

export default MainMenu;