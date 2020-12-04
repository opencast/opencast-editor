import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faFileExport, faTimesCircle, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { setState, selectFinishState } from '../redux/finishSlice'

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC<{}> = () => {

  const saveProcessCancelStyle = css({
    borderBottom: '1px solid #BBB',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    alignItems: 'space-around',
    padding: '20px',
    gap: '30px',
  })

  return (
    <div css={saveProcessCancelStyle} title="Select Finish Option Area">
        <FinishMenuButton iconName={faSave} stateName="Save"/>
        <FinishMenuButton iconName={faFileExport} stateName="Process"/>
        <FinishMenuButton iconName={faTimesCircle} stateName="Abort"/>
    </div>
  );
}

/**
 * Buttons for the finish menu
 */
const FinishMenuButton: React.FC<{iconName: IconDefinition, stateName: string}> = ({iconName, stateName}) => {

  const dispatch = useDispatch();
  const activeState = useSelector(selectFinishState)

  const mainMenuButtonStyle = {
    backgroundColor: 'snow',
    borderRadius: '10px',
    fontSize: 'medium',
    width: '200px',
    height: '200px',
    cursor: "pointer",
    transitionDuration: "0.3s",
    transitionProperty: "transform",
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
      <FontAwesomeIcon  icon={iconName} size="3x"/>
      <div>{stateName}</div>
    </div>
  );
};



export default FinishMenu;
