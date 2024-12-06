import React, { useEffect } from "react";

import { css } from "@emotion/react";
import {
  basicButtonStyle,
  backOrContinueStyle,
  errorBoxStyle,
  spinningStyle,
} from "../cssStyles";

import { LuLoader, LuCheck, LuAlertCircle, LuChevronLeft, LuDatabase, LuMoreHorizontal } from "react-icons/lu";

import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  selectCustomizedTrackSelection,
  selectSegments,
  selectTracks,
  setHasChanges as videoSetHasChanges,
  selectSelectedWorkflowId,
} from "../redux/videoSlice";
import { postVideoInformationWithWorkflow, selectStatus, selectError } from "../redux/workflowPostAndProcessSlice";

import { PageButton } from "./Finish";
import { setEnd } from "../redux/endSlice";

import { useTranslation } from "react-i18next";
import {
  setHasChanges as metadataSetHasChanges,
  selectCatalogs,
} from "../redux/metadataSlice";
import {
  selectSubtitles,
  setHasChanges as subtitleSetHasChanges,
} from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { useTheme } from "../themes";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration: React.FC = () => {

  const { t } = useTranslation();

  const postAndProcessWorkflowStatus = useAppSelector(selectStatus);
  const postAndProcessError = useAppSelector(selectError);
  const theme = useTheme();

  const workflowConfigurationStyle = css({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "20px",
    gap: "30px",
  });

  return (
    <div css={workflowConfigurationStyle}>
      <h2>{t("workflowConfig.headline-text")}</h2>
      <LuMoreHorizontal css={{ fontSize: 80 }} />
      Placeholder
      <div>{t("workflowConfig.satisfied-text")}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label={t("various.goBack-button")} Icon={LuChevronLeft} />
        <SaveAndProcessButton text={t("workflowConfig.confirm-button")} />
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postAndProcessError ? t("various.error-details-text",
          { errorMessage: postAndProcessError }) :
          t("various.error-text")}<br />
      </div>
    </div>
  );
};

/**
 * Button that sends a post request to save current changes
 * and starts the selected workflow
 */
export const SaveAndProcessButton: React.FC<{ text: string; }> = ({ text }) => {

  // Initialize redux variables
  const dispatch = useAppDispatch();

  const selectedWorkflowId = useAppSelector(selectSelectedWorkflowId);
  const segments = useAppSelector(selectSegments);
  const tracks = useAppSelector(selectTracks);
  const customizedTrackSelection = useAppSelector(selectCustomizedTrackSelection);
  const subtitles = useAppSelector(selectSubtitles);
  const metadata = useAppSelector(selectCatalogs);
  const workflowStatus = useAppSelector(selectStatus);
  const theme = useTheme();

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === "success") {
      dispatch(setEnd({ hasEnded: true, value: "success" }));
      dispatch(videoSetHasChanges(false));
      dispatch(metadataSetHasChanges(false));
      dispatch(subtitleSetHasChanges(false));
    }
  }, [dispatch, workflowStatus]);

  const prepareSubtitles = () => {
    const subtitlesForPosting = [];

    for (const identifier in subtitles) {
      subtitlesForPosting.push({
        id: identifier,
        subtitle: serializeSubtitle(subtitles[identifier].cues),
        tags: subtitles[identifier].tags,
      });
    }
    return subtitlesForPosting;
  };

  const saveAndProcess = () => {
    dispatch(postVideoInformationWithWorkflow({
      segments: segments,
      tracks: tracks,
      customizedTrackSelection,
      workflow: [{ id: selectedWorkflowId }],
      subtitles: prepareSubtitles(),
      metadata: metadata,
    }));
  };

  // Update based on current fetching status
  let Icon = LuDatabase;
  let spin = false;
  if (workflowStatus === "failed") {
    Icon = LuAlertCircle;
    spin = false;
  } else if (workflowStatus === "success") {
    Icon = LuCheck;
    spin = false;
  } else if (workflowStatus === "loading") {
    Icon = LuLoader;
    spin = true;

  }

  const saveButtonStyle = css({
    padding: "16px",
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  });

  return (
    <div css={[basicButtonStyle(theme), saveButtonStyle]}
      role="button" tabIndex={0}
      onClick={saveAndProcess}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === " " || event.key === "Enter") {
          saveAndProcess();
        }
      }}>
      <Icon css={spin ? spinningStyle : undefined} />
      <span>{text}</span>
    </div>
  );
};

export default WorkflowConfiguration;
