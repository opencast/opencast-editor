import React, { useState }  from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faFilm, faListUl, faPhotoVideo, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useDispatch } from 'react-redux'
import {
  setState,
} from '../redux/mainMenuSlice'

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const toolboxStyle = {
    backgroundColor: 'rgba(0, 245, 220, 1)',
    borderRadius: '25px',
    width: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '10px',
    gap: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={toolboxStyle} title="Toolbox">
      <MainMenuButton iconName={faFilm} stateName="Cutting"/>
      <MainMenuButton iconName={faListUl} stateName="Metadata"/>
      <MainMenuButton iconName={faPhotoVideo} stateName="Thumbnail"/>
      <MainMenuButton iconName={faCut} stateName="Start Workflow"/>
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

  const [isActive, setisActive] = useState(false); 

  const iconStyle = {
    borderRadius: '25px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    //boxShadow: isActive ? 'inset 0 0 5px #000000' : '0',
    ...isActive && {
      stroke: "red",
      strokeWidth: "10",
    },
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
  };

  return (
    <>
      <FontAwesomeIcon css={iconStyle} icon={iconName} size="7x" 
        onClick={() => { 
          setisActive(!isActive); 
          dispatch(setState(stateName)); 
        }}
      />
      {stateName}
    </>
  );
};

export default MainMenu;