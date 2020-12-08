import React from "react";

import FinishMenu from "./FinishMenu";
import FinishContent from "./FinishContent"

import { css } from '@emotion/core'

import { useSelector } from 'react-redux';
import { selectPageNumber } from '../redux/finishSlice'

/**
 * Displays a menu for selecting what should be done with the current changes
 */
const Finish : React.FC<{}> = () => {

  const pageNumber = useSelector(selectPageNumber)

  const FinishMenuStyle = css({
    display: pageNumber !== 0 ? 'none' :'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    alignItems: 'space-around',
    padding: '20px',
    gap: '30px',
  })

  const FinishContentStyle = css({
    display: pageNumber !== 1 ? 'none' :'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column' as const,
    justifyContent: 'space-around',
    alignItems: 'space-around',
    padding: '20px',
    gap: '30px',
  })

  return (
    <div  title="Finish">
      <div css={FinishMenuStyle} >
        <FinishMenu />
      </div>
      <div css={FinishContentStyle} >
        <FinishContent />
      </div>
    </div>
  );
}


export default Finish;
