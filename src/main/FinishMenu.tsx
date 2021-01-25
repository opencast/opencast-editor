import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faFileExport, faTimesCircle, IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch } from 'react-redux';
import { setState, setPageNumber, finish } from '../redux/finishSlice'

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const FinishMenu : React.FC<{}> = () => {

  const finishMenuStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '30px',
  })

  return (
    <div css={finishMenuStyle} title="Finish Menu">
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

  const dispatch = useDispatch();

  const finish = () => {
    dispatch(setState(stateName));
    dispatch(setPageNumber(1))
  }

  const finishMenuButtonStyle = css({
    width: '250px',
    height: '220px',
    flexDirection: 'column' as const,
    fontSize: "x-large",
    gap: '30px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
  });

  return (
    <div css={[basicButtonStyle, finishMenuButtonStyle]}
    role="button" tabIndex={0}
      onClick={ finish }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        finish()
      }}}>
      <FontAwesomeIcon  icon={iconName} size="2x"/>
      <div>{stateName}</div>
    </div>
  );
};



export default FinishMenu;
