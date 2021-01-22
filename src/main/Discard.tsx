import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle, nagivationButtonStyle} from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { setEnd } from '../redux/endSlice'

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
      <h1>Discard changes</h1>
      <span>
        Discard all the changes you made? This cannot be undone!
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

  const discard = () => {
    dispatch(setEnd({hasEnded: true, value: 'discarded'}))
  }

  return (
    <div css={[basicButtonStyle, nagivationButtonStyle]} title={"Discard changes button"}
      role="button" tabIndex={0}
      onClick={ discard }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        discard()
      }}}>
      <FontAwesomeIcon  icon={faTimesCircle} size="1x"/>
      <span>{"Yes, discard changes"}</span>
    </div>
  );
}

export default Discard;
