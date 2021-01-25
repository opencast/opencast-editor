import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle, nagivationButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faExclamationCircle, faChevronLeft, faSave,
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectSegments, selectTracks } from '../redux/videoSlice'
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

  return (
    <div css={saveStyle} title="Save Area">
      <span>
        Here you can save the changes you made, but the video will not be cut yet. <br />
        To make Opencast cut the video, please go back and select "Start processing". <br />
        Do you truly wish to save?
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label="No, take me back" iconName={faChevronLeft}/>
        <SaveButton />
      </div>
      <div css={errorBoxStyle(postWorkflowStatus === "failed")} title="Error Box" role="alert">
        <span>An error has occured. Please wait a bit and try again.</span><br />
        {postError ? "Details: " + postError : "No error details are available."}<br />
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
  const tracks = useSelector(selectTracks)
  const workflowStatus = useSelector(selectStatus);

  // Update based on current fetching status
  let icon = faSave
  let spin = false
  let tooltip = "Save Button"
  if (workflowStatus === 'loading') {
    icon = faSpinner
    spin = true
    tooltip = "Attempting to save"
  } else if (workflowStatus === 'success') {
    icon = faCheck
    spin = false
    tooltip = "Saved successfully"
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
    spin = false
    tooltip = "Save failed"
  }

  const ariaSaveUpdate = () => {
    if(workflowStatus === 'success') {
      return "Saved successfully"
    }
  }

  const save = () => {
    dispatch(postVideoInformation({
      segments: segments,
      tracks: tracks,
    }))
  }

  return (
    <div css={[basicButtonStyle, nagivationButtonStyle]} title={tooltip}
      role="button" tabIndex={0}
      onClick={ save }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        save()
      }}}>
      <FontAwesomeIcon icon={icon} spin={spin} size="1x"/>
      <span>{"Yes, save changes"}</span>
      <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
    </div>
  );
}


export default Save;
