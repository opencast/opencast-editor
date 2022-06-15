import React from "react";

import { css } from '@emotion/react'
import { backOrContinueStyle, errorBoxStyle, flexGapReplacementStyle } from '../cssStyles'

import { useDispatch, useSelector } from 'react-redux';
import { selectWorkflows, setSelectedWorkflowIndex } from '../redux/videoSlice'
import { selectFinishState, selectPageNumber } from '../redux/finishSlice'

import { PageButton } from './Finish'
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { SaveAndProcessButton } from "./WorkflowConfiguration";
import { selectStatus, selectError } from "../redux/workflowPostAndProcessSlice";
import { selectStatus as saveSelectStatus, selectError as saveSelectError } from "../redux/workflowPostSlice";
import { httpRequestState, Workflow } from "../types";
import { SaveButton } from "./Save";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { Trans } from "react-i18next";
import { FormControlLabel, Radio, RadioGroup, withStyles } from "@material-ui/core";

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection : React.FC<{}> = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();

  // Initialite redux states
  const workflows = useSelector(selectWorkflows)
  const finishState = useSelector(selectFinishState)
  const pageNumber = useSelector(selectPageNumber)

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError)
  const saveStatus = useSelector(saveSelectStatus);
  const saveError = useSelector(saveSelectError)

  const workflowSelectionStyle = css({
    padding: '20px',
    display: (finishState === "Start processing" && pageNumber === 1) ? 'flex' : 'none',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  const workflowSelectionSelectionStyle = css({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'left',
    ...(flexGapReplacementStyle(20, false)),
    flexWrap: 'wrap',
    maxHeight: '50vh',
  })

  const handleWorkflowSelectChange = (event: { target: { value: string}; }) => {
    dispatch(setSelectedWorkflowIndex(event.target.value))
  };

  // Layout template
  const render = (topTitle: string, topText: {} | null | undefined, hasWorkflowButtons: boolean,
    nextButton: EmotionJSX.Element, errorStatus: httpRequestState["status"],
    errorMessage: httpRequestState["error"]) => {
    return (
      <div css={workflowSelectionStyle}>
        <h2>{topTitle}</h2>
        {topText}
        { hasWorkflowButtons &&
            <RadioGroup
              css={workflowSelectionSelectionStyle}
              title="Workflow Selection Area"
              defaultValue={workflows[0].id}
              name="Workflow Selection Area"
              onChange={handleWorkflowSelectChange}
            >
              {workflows.map( (workflow: Workflow, index: number) => (
                <WorkflowButton key={workflow.id} stateName={workflow.name} workflowId={workflow.id} workflowDescription={workflow.description}/>
              ))}
            </RadioGroup>
        }
        <div css={backOrContinueStyle}>
          <PageButton pageNumber={0} label={t("workflowSelection.back-button")} iconName={faChevronLeft}/>
          {/* <PageButton pageNumber={2} label="Continue" iconName={faChevronRight}/> */}
          {nextButton}
        </div>
        <div css={errorBoxStyle(errorStatus === "failed")} role="alert">
          <span>{t("various.error-text")}</span><br />
          {errorMessage ? t("various.error-details-text", {errorMessage: postAndProcessError}) : t("various.error-noDetails-text")}<br/>
        </div>
      </div>
    );
  }

  // Fills the layout template with values based on how many workflows are available
  const renderSelection = () => {
    if (workflows.length <= 0) {
      return(
        render(
          t("workflowSelection.saveAndProcess-text"),
          <Trans i18nKey="workflowSelection.noWorkflows-text">
            A problem occurred, there are no workflows to process your changes with.<br />
            Please save your changes and contact an Opencast Administrator.
          </Trans>,
          false,
          <SaveButton />,
          saveStatus,
          saveError
        )
      );
    } else if (workflows.length === 1) {
      return (
        render(
          t("workflowSelection.saveAndProcess-text"),
          <Trans i18nKey="workflowSelection.oneWorkflow-text">
            The video will be cut and processed with the workflow "{{workflow: workflows[0].name}}".<br/>
            This will take some time.
          </Trans>,
          false,
          <SaveAndProcessButton text={t("workflowSelection.startProcessing-button")}/>,
          postAndProcessWorkflowStatus,
          postAndProcessError
        )
      );
    } else {
      return (
        render(
          t("workflowSelection.selectWF-text"),
          <div>
            {t("workflowSelection.manyWorkflows-text")}
          </div>,
          true,
          <SaveAndProcessButton text= {t("workflowSelection.startProcessing-button")}/>,
          postAndProcessWorkflowStatus,
          postAndProcessError
        )
      )
    }
  }

  return (
    renderSelection()
  );
}

const WorkflowButton: React.FC<{stateName: string, workflowId: string, workflowDescription: string}> = ({stateName, workflowId, workflowDescription}) => {

  // Note: Styling the Radio Button is done in WorkflowSelectRadio

  const labelStyle = css({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px'
  })

  const headerStyle = css({
    width: '100%',
    padding: '5px',
    fontSize: 'larger',
  });

  return (
    <FormControlLabel value={workflowId} control={<WorkflowSelectRadio />}
      label={
        <div css={labelStyle}>
          <div css={headerStyle}>{stateName}</div>
          <div>{workflowDescription}</div>
        </div>
      }
    />
  );
}

const WorkflowSelectRadio = withStyles({
  root: {
    alignSelf: 'start',
    color: 'grey',
    "&$checked": {
      color: 'grey'
    }
  },
  checked: {}
})((props) => <Radio color="default" {...props} />);

export default WorkflowSelection;
