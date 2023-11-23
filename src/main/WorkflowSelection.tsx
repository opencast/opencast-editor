import React, { useEffect } from "react";

import { css } from "@emotion/react";
import {
  backOrContinueStyle,
  errorBoxStyle,
  flexGapReplacementStyle,
} from "../cssStyles";

import { useDispatch, useSelector } from "react-redux";
import { selectWorkflows, setSelectedWorkflowIndex } from "../redux/videoSlice";
import { selectFinishState, selectPageNumber } from "../redux/finishSlice";

import { PageButton } from "./Finish";
import { LuChevronLeft } from "react-icons/lu";
import { SaveAndProcessButton } from "./WorkflowConfiguration";
import {
  selectStatus,
  selectError,
} from "../redux/workflowPostAndProcessSlice";
import {
  selectStatus as saveSelectStatus,
  selectError as saveSelectError,
} from "../redux/workflowPostSlice";
import { httpRequestState, Workflow } from "../types";
import { SaveButton } from "./Save";
import { EmotionJSX } from "@emotion/react/types/jsx-namespace";

import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useTheme } from "../themes";

/**
 * Allows the user to select a workflow
 */
const WorkflowSelection: React.FC = () => {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  // Initialite redux states
  let workflows = useSelector(selectWorkflows);
  // Need to make copy to handle undefined displayOrder values
  workflows = [...workflows].sort((a, b) => {
    return b.displayOrder - a.displayOrder;
  });

  const finishState = useSelector(selectFinishState);
  const pageNumber = useSelector(selectPageNumber);
  const theme = useTheme();

  const postAndProcessWorkflowStatus = useSelector(selectStatus);
  const postAndProcessError = useSelector(selectError);
  const saveStatus = useSelector(saveSelectStatus);
  const saveError = useSelector(saveSelectError);

  const workflowSelectionStyle = css({
    padding: "20px",
    display:
      finishState === "Start processing" && pageNumber === 1 ? "flex" : "none",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    ...flexGapReplacementStyle(30, false),
  });

  const workflowSelectionSelectionStyle = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    ...flexGapReplacementStyle(20, false),
    flexWrap: "wrap",
    maxHeight: "50vh",
  });

  useEffect(() => {
    if (workflows.length >= 1) {
      dispatch(setSelectedWorkflowIndex(workflows[0].id));
    }
  }, [dispatch, workflows]);

  const handleWorkflowSelectChange = (event: { target: { value: string } }) => {
    dispatch(setSelectedWorkflowIndex(event.target.value));
  };

  // Layout template
  const render = (
    topTitle: string,
    topText: JSX.Element,
    hasWorkflowButtons: boolean,
    nextButton: EmotionJSX.Element,
    errorStatus: httpRequestState["status"],
    errorMessage: httpRequestState["error"]
  ) => {
    return (
      <div css={workflowSelectionStyle}>
        <h2>{topTitle}</h2>
        {topText}
        {hasWorkflowButtons && (
          <RadioGroup
            css={workflowSelectionSelectionStyle}
            defaultValue={workflows[0].id}
            name="Workflow Selection Area"
            onChange={handleWorkflowSelectChange}
          >
            {workflows.map((workflow: Workflow, _index: number) => (
              <WorkflowButton
                key={workflow.id}
                stateName={workflow.name}
                workflowId={workflow.id}
                workflowDescription={workflow.description}
              />
            ))}
          </RadioGroup>
        )}
        <div css={backOrContinueStyle}>
          <PageButton
            pageNumber={0}
            label={t("workflowSelection.back-button")}
            Icon={LuChevronLeft}
          />
          {/* <PageButton pageNumber={2} label="Continue" iconName={faChevronRight}/> */}
          {nextButton}
        </div>
        <div css={errorBoxStyle(errorStatus === "failed", theme)} role="alert">
          <span>{t("various.error-text")}</span>
          <br />
          {errorMessage
            ? t("various.error-details-text", {
                errorMessage: postAndProcessError,
              })
            : t("various.error-text")}
          <br />
        </div>
      </div>
    );
  };

  // Fills the layout template with values based on how many workflows are available
  const renderSelection = () => {
    if (workflows.length <= 0) {
      return render(
        t("workflowSelection.saveAndProcess-text"),
        <Trans i18nKey="workflowSelection.noWorkflows-text">
          There are no workflows to process your changes with.
          <br />
          Please save your changes and contact an administrator.
        </Trans>,
        false,
        <SaveButton />,
        saveStatus,
        saveError
      );
    } else if (workflows.length === 1) {
      return render(
        t("workflowSelection.saveAndProcess-text"),
        <Trans i18nKey="workflowSelection.oneWorkflow-text">
          The video will be cut and processed with the workflow{" "}
          {{ workflow: workflows[0].name }}.<br />
          This will take some time.
        </Trans>,
        false,
        <SaveAndProcessButton
          text={t("workflowSelection.startProcessing-button")}
        />,
        postAndProcessWorkflowStatus,
        postAndProcessError
      );
    } else {
      return render(
        t("workflowSelection.selectWF-text"),
        <div>{t("workflowSelection.manyWorkflows-text")}</div>,
        true,
        <SaveAndProcessButton
          text={t("workflowSelection.startProcessing-button")}
        />,
        postAndProcessWorkflowStatus,
        postAndProcessError
      );
    }
  };

  return renderSelection();
};

const WorkflowButton: React.FC<{
  stateName: string;
  workflowId: string;
  workflowDescription: string;
}> = ({ stateName, workflowId, workflowDescription }) => {
  // Note: Styling the Radio Button is done in WorkflowSelectRadio

  const labelStyle = css({
    display: "flex",
    flexDirection: "column",
    paddingTop: "2px",
    maxWidth: "500px",
  });

  const headerStyle = css({
    width: "100%",
    padding: "5px 0px",
    fontSize: "larger",
  });

  return (
    <FormControlLabel
      value={workflowId}
      control={<WorkflowSelectRadio />}
      label={
        <div css={labelStyle}>
          <div css={headerStyle}>{stateName}</div>
          <div>{workflowDescription}</div>
        </div>
      }
    />
  );
};

const WorkflowSelectRadio: React.FC = (props) => {
  const theme = useTheme();

  const style = css({
    alignSelf: "start",
    color: `${theme.text}`,
    "&$checked": {
      color: `${theme.text}`,
    },
  });

  return <Radio color="default" css={style} {...props} />;
};

export default WorkflowSelection;
