import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle} from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { setState as setAbortState } from '../redux/abortSlice'

import { PageButton } from './Finish'

/**
 * Shown if the user wishes to abort.
 * Informs the user about aborting and displays abort button.
 */
const Discard : React.FC<{}> = () => {

  const finishState = useSelector(selectFinishState)

  const cancelStyle = css({
    display: finishState !== "Discard changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '30px',
  })

  return (
    <div css={cancelStyle} title="Abort Area">
      <span>
        Discard all the changes you made? They will be lost forever! <br />
        Doth thou truly wish tah abort?
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label="No, take me back" iconName={faChevronLeft} />
        <DiscardButton />
      </div>
    </div>
  );
}

/**
 * Button that sets the app into an aborted state
 */
const DiscardButton : React.FC<{}> = () => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const abort = () => {
    dispatch(setAbortState(true))
  }

  const saveButtonStyle = css({
    width: '200px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, saveButtonStyle]} title={"Discard changes button"}
      role="button" tabIndex={0}
      onClick={ abort }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        abort()
      }}}>
      <FontAwesomeIcon  icon={faTimesCircle} size="1x"/>
      <span>{"Yes, discard changes"}</span>
    </div>
  );
}

export default Discard;
