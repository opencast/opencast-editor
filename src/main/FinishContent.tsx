import React from "react";

import { css } from '@emotion/core'

import WorkflowSelection from "./WorkflowSelection";
import WorkflowConfiguration from "./WorkflowConfiguration";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faDotCircle, faCheck, faExclamationCircle
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectSegments } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'
import { setState as setAbortState } from '../redux/abortSlice'

/**
 * Display content based on the state select in the finish menu
 */
const FinishContent : React.FC<{}> = () => {

  const finishContentStyle = css({
    width: '100%',
    height: '100%',
  })

  return (
    <div css={finishContentStyle} title="Select Finish Option Area">
      <Save />
      <Process />
      <Abort />
    </div>
  );
}

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
    display: finishState !== "Save" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
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
      <SaveButton />
      <div css={errorBoxStyle} title="Error Box">
        <span>An error has occured. Please wait a bit and try again. Details: </span><br />
        {postError}<br />
      </div>
    </div>
  );
}

/**
 * Shown if the user wishes to process.
 * Informs the user about processing and displays workflow selection
 * and workflow configuration
 */
const Process : React.FC<{}> = () => {

  const finishState = useSelector(selectFinishState)

  const startWorkflowStyle = css({
    height: '100%',
    display: finishState !== "Process" ? 'none' : 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'center',
  })
  return (
    <div css={startWorkflowStyle} title="Workflow Container">
      <WorkflowSelection />
      <WorkflowConfiguration />
    </div>
  );
}

/**
 * Shown if the user wishes to abort.
 * Informs the user about aborting and displays abort button.
 */
const Abort : React.FC<{}> = () => {

  const finishState = useSelector(selectFinishState)

  const cancelStyle = css({
    display: finishState !== "Abort" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '20px',
  })

  return (
    <div css={cancelStyle} title="Abort Area">
      <span>
        Discard all the changes you made? They will be lost forever! <br />
        Doth thou truly wish tah abort?
      </span>
      <AbortButton />
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
  let icon = faDotCircle
  if (workflowStatus === 'loading') {
    icon = faSpinner
  } else if (workflowStatus === 'success') {
    icon = faCheck
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
  }

  const saveButtonStyle = css({
    width: '200px',
    backgroundColor: 'snow',
    borderRadius: '10px',
    borderWidth: '1px',
    borderColor: workflowStatus === 'failed' ? 'red' : 'green',
    borderStyle: 'solid',
    fontSize: 'medium',
    padding: '16px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  })

  return (
    <div css={saveButtonStyle} title={"Save"}
      onClick={() =>
        dispatch(postVideoInformation({
          segments: segments,
          mediaPackageId: "9bf8aec2-10f5-4c64-bfde-2752fa3a394d",
        }))
      }>
      <FontAwesomeIcon  icon={icon} size="1x"/>
      <span>{"Save"}</span>
    </div>
  );
}

/**
 * Button that sets the app into an aborted state
 */
const AbortButton : React.FC<{}> = () => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const saveButtonStyle = css({
    width: '200px',
    backgroundColor: 'snow',
    borderRadius: '10px',
    borderWidth: '1px',
    borderColor: 'red',
    borderStyle: 'solid',
    fontSize: 'medium',
    padding: '16px',
    cursor: "pointer",
    justifyContent: 'center',
    alignContent: 'center',
    transitionDuration: "0.3s",
    transitionProperty: "transform",
    "&:hover": {
      transform: 'scale(1.1)',
    },
    "&:active": {
      transform: 'scale(0.9)',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  })

  return (
    <div css={saveButtonStyle} title={"Abort Button"}
      onClick={() =>
        dispatch(setAbortState(true))
      }>
      <span>{"Abort"}</span>
    </div>
  );
}

export default FinishContent
