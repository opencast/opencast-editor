import React, { useEffect } from "react";

import { css } from "@emotion/react";
import {
  basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle,
  navigationButtonStyle, spinningStyle,
} from "../cssStyles";

import { LuLoader, LuCheckCircle, LuAlertCircle, LuChevronLeft, LuSave, LuCheck } from "react-icons/lu";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectFinishState } from "../redux/finishSlice";
import {
  selectHasChanges,
  selectSegments,
  selectTracks,
  setHasChanges as videoSetHasChanges,
} from "../redux/videoSlice";
import { postVideoInformation, selectStatus, selectError } from "../redux/workflowPostSlice";

import { CallbackButton, PageButton } from "./Finish";

import { useTranslation } from "react-i18next";
import {
  setHasChanges as metadataSetHasChanges,
  selectHasChanges as metadataSelectHasChanges,
  selectCatalogs,
} from "../redux/metadataSlice";
import {
  selectSubtitles, selectHasChanges as selectSubtitleHasChanges,
  setHasChanges as subtitleSetHasChanges,
} from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { ProtoButton } from "@opencast/appkit";

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save: React.FC = () => {

  const { t } = useTranslation();

  const finishState = useAppSelector(selectFinishState);

  const postWorkflowStatus = useAppSelector(selectStatus);
  const postError = useAppSelector(selectError);
  const theme = useTheme();
  const metadataHasChanges = useAppSelector(metadataSelectHasChanges);
  const hasChanges = useAppSelector(selectHasChanges);
  const subtitleHasChanges = useAppSelector(selectSubtitleHasChanges);

  const saveStyle = css({
    height: "100%",
    display: finishState !== "Save changes" ? "none" : "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "30px",
  });

  const render = () => {
    // Post (successful) save
    if (postWorkflowStatus === "success"
      && !hasChanges && !metadataHasChanges && !subtitleHasChanges) {
      return (
        <>
          <LuCheckCircle css={{ fontSize: 80 }} />
          <div>{t("save.success-text")}</div>
          <CallbackButton />
        </>
      );
      // Pre save
    } else {
      return (
        <>
          <span css={{ maxWidth: "500px" }}>
            {t("save.info-text")}
          </span>
          <div css={backOrContinueStyle}>
            <PageButton pageNumber={0} label={t("various.goBack-button")} Icon={LuChevronLeft} />
            <SaveButton />
          </div>
        </>
      );
    }
  };

  return (
    <div css={saveStyle}>
      <h1>{t("save.headline-text")}</h1>
      {render()}
      <div css={errorBoxStyle(postWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postError ? t("various.error-details-text", { errorMessage: postError }) : t("various.error-text")}<br />
      </div>
    </div>
  );
};

/**
 * Button that sends a post request to save current changes
 */
export const SaveButton: React.FC = () => {

  const { t } = useTranslation();

  // Initialize redux variables
  const dispatch = useAppDispatch();

  const segments = useAppSelector(selectSegments);
  const tracks = useAppSelector(selectTracks);
  const subtitles = useAppSelector(selectSubtitles);
  const metadata = useAppSelector(selectCatalogs);
  const workflowStatus = useAppSelector(selectStatus);
  const theme = useTheme();

  // Update based on current fetching status
  let Icon = LuSave;
  let spin = false;
  let tooltip = null;
  if (workflowStatus === "failed") {
    Icon = LuAlertCircle;
    spin = false;
    tooltip = t("save.confirmButton-failed-tooltip");
  } else if (workflowStatus === "success") {
    Icon = LuCheck;
    spin = false;
    tooltip = t("save.confirmButton-success-tooltip");
  } else if (workflowStatus === "loading") {
    Icon = LuLoader;
    spin = true;
    tooltip = t("save.confirmButton-attempting-tooltip");
  }

  const ariaSaveUpdate = () => {
    if (workflowStatus === "success") {
      return t("save.success-tooltip-aria");
    }
  };

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

  const save = () => {
    dispatch(postVideoInformation({
      segments: segments,
      tracks: tracks,
      subtitles: prepareSubtitles(),
      metadata: metadata,
    }));
  };

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === "success") {
      dispatch(videoSetHasChanges(false));
      dispatch(metadataSetHasChanges(false));
      dispatch(subtitleSetHasChanges(false));
    }
  }, [dispatch, workflowStatus]);

  return (
    <ThemedTooltip title={tooltip == null ? tooltip = "" : tooltip}>
      <ProtoButton
        onClick={save}
        css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
      >
        <Icon css={spin ? spinningStyle : undefined} />
        <span>{t("save.confirm-button")}</span>
        <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
      </ProtoButton>
    </ThemedTooltip>
  );
};

export default Save;
