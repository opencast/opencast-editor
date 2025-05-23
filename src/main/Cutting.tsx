import React, { useEffect } from "react";
import CuttingActions from "./CuttingActions";
import Timeline from "./Timeline";
import {
  fetchVideoInformation,
  selectCurrentlyAt,
  selectDuration,
  selectIsPlaying,
  selectIsMuted,
  selectVolume,
  selectIsPlayPreview,
  selectTitle,
  setClickTriggered,
  setCurrentlyAt,
  setIsPlaying,
  setIsMuted,
  setVolume,
  setIsPlayPreview,
  jumpToPreviousSegment,
  jumpToNextSegment,
} from "../redux/videoSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { httpRequestState } from "../types";
import { useTheme } from "../themes";
import { setError } from "../redux/errorSlice";
import { selectTitleFromEpisodeDc } from "../redux/metadataSlice";
import { titleStyle, titleStyleBold, videosStyle } from "../cssStyles";
import { LuMoveHorizontal } from "react-icons/lu";
import { css } from "@emotion/react";
import VideoPlayers from "./VideoPlayers";
import VideoControls from "./VideoControls";

const Cutting: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const dispatch = useAppDispatch();
  const videoURLStatus = useAppSelector((state: { videoState: { status: httpRequestState["status"]; }; }) =>
    state.videoState.status);
  const error = useAppSelector((state: { videoState: { error: httpRequestState["error"]; }; }) =>
    state.videoState.error);
  const duration = useAppSelector(selectDuration);
  const theme = useTheme();
  const errorReason = useAppSelector((state: { videoState: { errorReason: httpRequestState["errorReason"]; }; }) =>
    state.videoState.errorReason);

  // Try to fetch URL from external API
  useEffect(() => {
    if (videoURLStatus === "idle") {
      dispatch(fetchVideoInformation());
    } else if (videoURLStatus === "failed") {
      if (errorReason === "workflowActive") {
        dispatch(setError({
          error: true,
          errorTitle: t("error.workflowActive-errorTitle"),
          errorMessage: t("error.workflowActive-errorMessage"),
          errorIcon: LuMoveHorizontal,
        }));
      } else {
        dispatch(setError({
          error: true,
          errorMessage: t("video.comError-text"),
          errorDetails: error,
        }));
      }
    } else if (videoURLStatus === "success") {
      if (duration === null) {
        dispatch(setError({
          error: true,
          errorMessage: t("video.durationError-text"),
          errorDetails: error,
        }));
      }
    }
  }, [videoURLStatus, dispatch, error, t, errorReason, duration]);

  // Style
  const cuttingStyle = css({
    display: "flex",
    width: "auto",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  });


  return (
    <div css={cuttingStyle}>
      <CuttingHeader />
      <VideoPlayers maxHeightInPixel={500} />
      <div css={videosStyle(theme)}>
        <Timeline
          timelineHeight={260}
          selectIsPlaying={selectIsPlaying}
          selectCurrentlyAt={selectCurrentlyAt}
          setIsPlaying={setIsPlaying}
          setCurrentlyAt={setCurrentlyAt}
          setClickTriggered={setClickTriggered}
        />
        <CuttingActions />
        <VideoControls
          selectCurrentlyAt={selectCurrentlyAt}
          selectIsPlaying={selectIsPlaying}
          selectIsMuted={selectIsMuted}
          selectVolume={selectVolume}
          selectIsPlayPreview={selectIsPlayPreview}
          setIsPlaying={setIsPlaying}
          setIsMuted={setIsMuted}
          setVolume={setVolume}
          setIsPlayPreview={setIsPlayPreview}
          jumpToPreviousSegment={jumpToPreviousSegment}
          jumpToNextSegment={jumpToNextSegment}
        />
      </div>
    </div>
  );
};


const CuttingHeader: React.FC = () => {

  const title = useAppSelector(selectTitle);
  const metadataTitle = useAppSelector(selectTitleFromEpisodeDc);
  const theme = useTheme();

  return (
    <div css={[titleStyle(theme), titleStyleBold(theme)]}>
      {metadataTitle ? metadataTitle : title}
    </div>
  );
};

export default Cutting;
