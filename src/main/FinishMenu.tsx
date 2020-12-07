import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faFileExport, faTimesCircle, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { setState, setPageNumber, selectFinishState } from '../redux/finishSlice'

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC<{}> = () => {

  return (
    <>
        <FinishMenuButton iconName={faSave} stateName="Save"/>
        <FinishMenuButton iconName={faFileExport} stateName="Process"/>
        <FinishMenuButton iconName={faTimesCircle} stateName="Abort"/>
    </>
  );
}

/**
 * Buttons for the finish menu
 */
const FinishMenuButton: React.FC<{iconName: IconDefinition, stateName: string}> = ({iconName, stateName}) => {

  const dispatch = useDispatch();

  const mainMenuButtonStyle = {
    width: '200px',
    height: '200px',
    flexDirection: 'column' as const,
  };

  return (
    <div css={[basicButtonStyle, mainMenuButtonStyle]} title={stateName}
      onClick={() => {
        dispatch(setState(stateName));
        dispatch(setPageNumber(1))
      }}>
      <FontAwesomeIcon  icon={iconName} size="3x"/>
      <div>{stateName}</div>
    </div>
  );
};



export default FinishMenu;
