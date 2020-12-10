import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faExclamationCircle, faChevronLeft, faSave,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectSegments } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'

import { PageButton } from './Finish'

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save : React.FC<{}> = () => {

  const finishState = useSelector(selectFinishState)

  const postWorkflowStatus = useSelector(selectStatus);
  const postError = useSelector(selectError)

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '30px',
  })

  const errorBoxStyle = css({
    ...(postWorkflowStatus !== 'failed') && {display: "none"},
    borderColor: 'red',
    borderStyle: 'dashed',
    fontWeight: 'bold',
    padding: '10px',
  })

  return (
    <div css={saveStyle} title="Save Area">
      <span>
        Save the changes you made, but the video will not be cut yet. <br />
        To make Opencast cut the video, please select "Process". <br />
        Doth thou truly wish tah save?
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label="No, take me back" iconName={faChevronLeft}/>
        <SaveButton />
      </div>
      <div css={errorBoxStyle} title="Error Box">
        <span>An error has occured. Please wait a bit and try again. Details: </span><br />
        {postError}<br />
      </div>
    </div>
  );
}

/**
 * Button that sends a post request to save current changes
 */
const SaveButton: React.FC<{}> = () => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const segments = useSelector(selectSegments)
  const workflowStatus = useSelector(selectStatus);

  // Update based on current fetching status
  let icon = faSave
  let spin = false
  if (workflowStatus === 'loading') {
    icon = faSpinner
    spin = true
  } else if (workflowStatus === 'success') {
    icon = faCheck
    spin = false
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
    spin = false
  }

  const saveButtonStyle = css({
    width: '200px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, saveButtonStyle]} title={"Save Button"}
      onClick={() =>
        dispatch(postVideoInformation({
          segments: segments,
          mediaPackageId: "9bf8aec2-10f5-4c64-bfde-2752fa3a394d",
        }))
      }>
      <FontAwesomeIcon icon={icon} spin={spin} size="1x"/>
      <span>{"Yes, Save changes"}</span>
    </div>
  );
}


export default Save;
