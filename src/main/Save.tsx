import React, { useEffect, useState } from "react";

import { css } from "@emotion/react";
import {
  basicButtonStyle, backOrContinueStyle, ariaLive,
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
  postMetadata, selectPostError, selectPostStatus, setHasChanges as metadataSetHasChanges,
  selectHasChanges as metadataSelectHasChanges,
} from "../redux/metadataSlice";
import {
  selectSubtitles, selectHasChanges as selectSubtitleHasChanges,
  setHasChanges as subtitleSetHasChanges,
} from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";
import { ErrorBox } from "@opencast/appkit";

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save: React.FC = () => {

  const { t } = useTranslation();

  const finishState = useAppSelector(selectFinishState);

  const postWorkflowStatus = useAppSelector(selectStatus);
  const postError = useAppSelector(selectError);
  const postMetadataStatus = useAppSelector(selectPostStatus);
  const postMetadataError = useAppSelector(selectPostError);
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
    if (postWorkflowStatus === "success" && postMetadataStatus === "success"
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
      {postWorkflowStatus === "failed" &&
        <ErrorBox>
          <span css={{ whiteSpace: "pre-line" }}>
            {t("various.error-text") + "\n"}
            {postError ?
              t("various.error-details-text", { errorMessage: postError }) : undefined
            }
          </span>
        </ErrorBox>
      }
      {postMetadataStatus === "failed" &&
        <ErrorBox>
          <span css={{ whiteSpace: "pre-line" }}>
            {t("various.error-text") + "\n"}
            {postMetadataError ?
              t("various.error-details-text", { errorMessage: postMetadataError }) : undefined
            }
          </span>
        </ErrorBox>
      }
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
  const workflowStatus = useAppSelector(selectStatus);
  const metadataStatus = useAppSelector(selectPostStatus);
  const theme = useTheme();
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);

  // Update based on current fetching status
  let Icon = LuSave;
  let spin = false;
  let tooltip = null;
  if (workflowStatus === "failed" || metadataStatus === "failed") {
    Icon = LuAlertCircle;
    spin = false;
    tooltip = t("save.confirmButton-failed-tooltip");
  } else if (workflowStatus === "success" && metadataStatus === "success") {
    Icon = LuCheck;
    spin = false;
    tooltip = t("save.confirmButton-success-tooltip");
  } else if (workflowStatus === "loading" || metadataStatus === "loading") {
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

  // Dispatches first save request
  // Subsequent save requests should be wrapped in useEffect hooks,
  // so they are only sent after the previous one has finished
  const save = () => {
    setMetadataSaveStarted(true);
    dispatch(postMetadata());
  };

  // Subsequent save request
  useEffect(() => {
    if (metadataStatus === "success" && metadataSaveStarted) {
      setMetadataSaveStarted(false);
      dispatch(postVideoInformation({
        segments: segments,
        tracks: tracks,
        subtitles: prepareSubtitles(),
      }));

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStatus]);

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === "success" && metadataStatus === "success") {
      dispatch(videoSetHasChanges(false));
      dispatch(metadataSetHasChanges(false));
      dispatch(subtitleSetHasChanges(false));
    }
  }, [dispatch, metadataStatus, workflowStatus]);

  return (
    <ThemedTooltip title={tooltip == null ? tooltip = "" : tooltip}>
      <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={save}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " " || event.key === "Enter") {
            save();
          }
        }}>
        <Icon css={spin ? spinningStyle : undefined} />
        <span>{t("save.confirm-button")}</span>
        <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
      </div>
    </ThemedTooltip>
  );
};

export default Save;
