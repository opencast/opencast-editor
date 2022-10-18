import React from "react";

import FinishMenu from "./FinishMenu";
import Save from "./Save"
import Discard from "./Discard"
import WorkflowSelection from "./WorkflowSelection";
import WorkflowConfiguration from "./WorkflowConfiguration";

import { css } from '@emotion/react'
import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectPageNumber, setPageNumber } from '../redux/finishSlice';
import { selectTheme } from "../redux/themeSlice";

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const Finish : React.FC<{}> = () => {

  const pageNumber = useSelector(selectPageNumber)

  const pageZeroStyle = css({
    display: pageNumber !== 0 ? 'none' :'block',
  })

  const pageOneStyle = css({
    display: pageNumber !== 1 ? 'none' :'block',
  })

  const pageTwoStyle = css({
    display: pageNumber !== 2 ? 'none' :'block',
  })

  return (
    <div>
      <div css={pageZeroStyle} >
        <FinishMenu />
      </div>
      <div css={pageOneStyle} >
        <Save />
        <WorkflowSelection />
        <Discard />
      </div>
      <div css={pageTwoStyle} >
        <WorkflowConfiguration />
      </div>
    </div>
  );
}

/**
 * Takes you to a different page
 */
export const PageButton : React.FC<{pageNumber: number, label: string, iconName: IconDefinition}> = ({pageNumber, label, iconName}) => {

  const theme = useSelector(selectTheme);
  
  // Initialize redux variables
  const dispatch = useDispatch()

  const onPageChange = () => {
    dispatch(setPageNumber(pageNumber))
  }

  const pageButtonStyle = css({
    width: '200px',
    padding: '16px',
    justifyContent: 'space-around',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  })

  return (
    <div css={[basicButtonStyle(theme), pageButtonStyle]}
      role="button" tabIndex={0}
      onClick={ onPageChange }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        onPageChange()
      }}}>
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{label}</span>
    </div>
  );
}


export default Finish;
