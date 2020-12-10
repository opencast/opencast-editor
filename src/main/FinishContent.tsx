import React from "react";

import { css } from '@emotion/core'
import { basicButtonStyle } from '../cssStyles'

import WorkflowSelection from "./WorkflowSelection";
import WorkflowConfiguration from "./WorkflowConfiguration";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner, faCheck, faExclamationCircle, faChevronLeft, faSave, IconDefinition, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState, setPageNumber } from '../redux/finishSlice'
import { selectSegments } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'
import { setState as setAbortState } from '../redux/abortSlice'

/**
 * Display content based on the state select in the finish menu
 */
const FinishContent : React.FC<{}> = () => {
  return (
    <>
      <Save />
      <Process />
      <Abort />
    </>
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
    display: finishState !== "Save changes" ? 'none' : 'flex',
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
      <PageButton pageNumber={0} label="No, take me back" iconName={faChevronLeft}/>
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
    display: finishState !== "Start processing" ? 'none' : 'flex',
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
    display: finishState !== "Discard changes" ? 'none' : 'flex',
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
      <PageButton pageNumber={0} label="No, take me back" iconName={faChevronLeft} />
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
  if (workflowStatus === 'loading') {
    icon = faSpinner
  } else if (workflowStatus === 'success') {
    icon = faCheck
  } else if (workflowStatus === 'failed') {
    icon = faExclamationCircle
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
      <FontAwesomeIcon  icon={icon} size="1x"/>
      <span>{"Yes, Save changes"}</span>
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
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, saveButtonStyle]} title={"Discard changes button"}
      onClick={() =>
        dispatch(setAbortState(true))
      }>
      <FontAwesomeIcon  icon={faTimesCircle} size="1x"/>
      <span>{"Yes, discard changes"}</span>
    </div>
  );
}

/**
 * Takes you to a different page
 */
export const PageButton : React.FC<{pageNumber: number, label: string, iconName: IconDefinition}> = ({pageNumber, label, iconName}) => {

  // Initialize redux variables
  const dispatch = useDispatch()

  const pageButtonStyle = css({
    width: '200px',
    padding: '16px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-around'
  })

  return (
    <div css={[basicButtonStyle, pageButtonStyle]} title={label}
      onClick={() =>
        dispatch(setPageNumber(pageNumber))
      }>
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{label}</span>
    </div>
  );
}

export default FinishContent
