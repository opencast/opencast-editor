import React, { useState }  from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCut, faFilm, faListUl, faPhotoVideo, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/core'

import { useDispatch } from 'react-redux'
import {
  setState,
} from './mainMenuSlice'


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
      <ToolboxButton iconName={faFilm} stateName="Cutting"/>
      <ToolboxButton iconName={faListUl} stateName="Metadata"/>
      <ToolboxButton iconName={faPhotoVideo} stateName="Thumbnail"/>
      <ToolboxButton iconName={faCut} stateName="Start Workflow"/>
    </div>
  );
};

const ToolboxButton: React.FC<{iconName: IconDefinition, stateName: string}> = ({iconName, stateName}) => {

  const dispatch = useDispatch();

  const [isActive, setisActive] = useState(false); 
  //const [stateName, setStateName] = useState("Oh no");

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