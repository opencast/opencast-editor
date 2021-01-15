import React from "react";

import { css } from '@emotion/core'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faQuestion, } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux';
import { selectDuration } from '../redux/videoSlice'
import { selectStatus } from '../redux/workflowPostAndProcessSlice'
import { selectAbortState } from '../redux/abortSlice'

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 * TODO: Improve state management somehow to avoid the possibility of an error case
 * TODO: Improve text
 * TODO: Add a button that closes the editor window/frame?
 */
const TheEnd : React.FC<{}> = () => {

  // Init redux variables
  const abortState = useSelector(selectAbortState)
  const postAndProcessState = useSelector(selectStatus)
  const duration = useSelector(selectDuration)

  const icon = () => {
    if (abortState) {
      return faTimesCircle
    } else if (postAndProcessState === "success") {
      return faCheckCircle
    } else {
      return faQuestion
    }
  }

  const text = () => {
    if (abortState) {
      return "You really did it. All your changes are now lost forever. You can now continue doing whatever you want."
    } else if (postAndProcessState === "success") {
      return `Changes successfully saved to Opencast. Processing your changes may take up to
              ${new Date((duration * 2)).toISOString().substr(11, 8)} hours.
              You can now close the editor.`
    } else {
      return "Now this is awkward. Something has gone very wrong."
    }
  }

  const theEndStyle = css({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
  })

  return (
    <div css={theEndStyle} title="The last area">
      <FontAwesomeIcon icon={icon()} size="10x" />
      <text>{text()}</text>
    </div>
  );
}

export default TheEnd