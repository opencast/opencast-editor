import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { basicButtonStyle, errorBoxStyle, flexGapReplacementStyle } from "../cssStyles";
import { LuChevronLeft, LuDownload, LuUpload } from "react-icons/lu";
import {
  selectSubtitlesFromOpencastById,
} from "../redux/videoSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";
import SubtitleListEditor from "./SubtitleListEditor";
import {
  setIsDisplayEditView,
  selectSelectedSubtitleById,
  selectSelectedSubtitleId,
  setSubtitle,
} from "../redux/subtitleSlice";
import SubtitleVideoArea from "./SubtitleVideoArea";
import SubtitleTimeline from "./SubtitleTimeline";
import { useTranslation } from "react-i18next";
import { Theme, useTheme } from "../themes";
import { parseSubtitle, serializeSubtitle } from "../util/utilityFunctions";
import { ThemedTooltip } from "./Tooltip";
import { titleStyle, titleStyleBold } from "../cssStyles";
import { generateButtonTitle } from "./SubtitleSelect";

/**
 * Displays an editor view for a selected subtitle file
 */
const SubtitleEditor: React.FC = () => {

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const [getError, setGetError] = useState<string | undefined>(undefined);
  const subtitle = useAppSelector(selectSelectedSubtitleById);
  const selectedId = useAppSelector(selectSelectedSubtitleId);
  const captionTrack = useAppSelector(selectSubtitlesFromOpencastById(selectedId));
  const theme = useTheme();

  // Prepare subtitle in redux
  useEffect(() => {
    // Parse subtitle data from Opencast
    if (subtitle?.cues === undefined && captionTrack !== undefined && captionTrack.subtitle !== undefined
      && selectedId) {
      try {
        dispatch(setSubtitle({
          identifier: selectedId,
          subtitles: { cues: parseSubtitle(captionTrack.subtitle), tags: captionTrack.tags },
        }));
      } catch (error) {
        if (error instanceof Error) {
          setGetError(error.message);
        } else {
          setGetError(String(error));
        }
      }

      // Or create a new subtitle instead
    } else if (subtitle?.cues === undefined && captionTrack === undefined && selectedId) {
      // Create an empty subtitle
      dispatch(setSubtitle({ identifier: selectedId, subtitles: { cues: [], tags: [] } }));
    }
  }, [dispatch, captionTrack, subtitle, selectedId]);

  const getTitle = () => {
    if (subtitle) {
      return generateButtonTitle(subtitle.tags, t);
    } else {
      return t("subtitles.editTitle-loading");
    }
  };

  const subtitleEditorStyle = css({
    display: "flex",
    flexDirection: "column",
    paddingRight: "20px",
    paddingLeft: "20px",
    gap: "20px",
    height: "100%",
  });

  const headerRowStyle = css({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  });

  const topRightButtons = css({
    display: "flex",
    flexDirection: "row",
    ...(flexGapReplacementStyle(10, false)),
  });

  const subAreaStyle = css({
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,  // No fixed height, fill available space
    justifyContent: "space-between",
    alignItems: "top",
    width: "100%",
    paddingTop: "10px",
    paddingBottom: "10px",
    ...(flexGapReplacementStyle(30, true)),
    borderBottom: `${theme.menuBorder}`,
  });


  const render = () => {
    if (getError !== undefined) {
      return (
        <span>{"Subtitle Parsing Error(s): " + getError}</span>
      );
    } else {
      return (
        <>
          <div css={headerRowStyle}>
            <BackButton />
            <div css={[titleStyle(theme), titleStyleBold(theme)]}>
              {t("subtitles.editTitle", { title: getTitle() })}
            </div>
            <div css={topRightButtons}>
              <UploadButton />
              <DownloadButton />
            </div>
          </div>
          <div css={subAreaStyle}>
            <SubtitleListEditor />
            <SubtitleVideoArea />
          </div>
          <SubtitleTimeline />
        </>
      );
    }
  };

  return (
    <div css={subtitleEditorStyle}>
      {render()}
    </div>
  );
};

const subtitleButtonStyle = (theme: Theme) => css({
  fontSize: "16px",
  height: "10px",
  padding: "16px",
  justifyContent: "space-around",
  boxShadow: `${theme.boxShadow}`,
  background: `${theme.element_bg}`,
});

const DownloadButton: React.FC = () => {

  const subtitle = useAppSelector(selectSelectedSubtitleById);

  const downloadSubtitles = () => {

    const vttFile = new Blob([serializeSubtitle(subtitle.cues)], { type: "text/vtt" });

    const vttFileLink = window.URL.createObjectURL(vttFile);
    const vttHyperLink = document.createElement("a");
    vttHyperLink.setAttribute("href", vttFileLink);

    const vttFileName = generateButtonTitle(subtitle.tags, t).trimEnd();
    vttHyperLink.setAttribute("download", `${vttFileName}.vtt`);
    vttHyperLink.click();
  };

  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedTooltip title={t("subtitles.downloadButton-tooltip")}>
      <div css={[basicButtonStyle(theme), subtitleButtonStyle(theme)]}
        role="button"
        onClick={() => downloadSubtitles()}
      >
        <LuDownload css={{ fontSize: "16px" }} />
        <span>{t("subtitles.downloadButton-title")}</span>
      </div>
    </ThemedTooltip>
  );
};

const UploadButton: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [errorState, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const subtitle = useAppSelector(selectSelectedSubtitleById);
  const selectedId = useAppSelector(selectSelectedSubtitleId);
  // Upload Ref
  const inputRef = React.useRef<HTMLInputElement>(null);

  const uploadSubtitles = () => {
    // open file input box on click of other element
    const ref = inputRef.current;
    if (ref !== null) {
      if (confirm(t("subtitles.uploadButton-warning"))) {
        ref.click();
      }
    }
  };

  // Save uploaded file in redux
  const uploadCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    // Check if image
    if (fileObj.type.split("/")[0] !== "text") {
      setErrorState(true);
      setErrorMessage(t("subtitles.uploadButton-error-filetype"));
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      // the result image data
      if (e.target && e.target.result) {
        try {
          const text = e.target.result.toString();
          const subtitleParsed = parseSubtitle(text);
          dispatch(setSubtitle({ identifier: selectedId, subtitles: { cues: subtitleParsed, tags: subtitle.tags } }));
          setErrorState(false);
        } catch (e) {
          console.error(e);
          setErrorState(true);
          setErrorMessage(t("subtitles.uploadButton-error-parse"));
        }
      }
    };
    reader.readAsText(fileObj);
  };

  return (
    <>
      <ThemedTooltip title={t("subtitles.uploadButton-tooltip")}>
        <div css={[basicButtonStyle(theme), subtitleButtonStyle(theme)]}
          role="button"
          onClick={() => uploadSubtitles()}
        >
          <LuUpload css={{ fontSize: "16px" }}/>
          <span>{t("subtitles.uploadButton-title")}</span>
        </div>
      </ThemedTooltip>
      <div css={errorBoxStyle(errorState, theme)} role="alert">
        <span>{t("subtitles.uploadButton-error")}</span><br />
        {errorMessage ? t("various.error-details-text", { errorMessage: errorMessage }) : t("various.error-text")}<br/>
      </div>
      {/* Hidden input field for upload */}
      <input
        style={{ display: "none" }}
        ref={inputRef}
        type="file"
        accept="text/vtt"
        onChange={event => uploadCallback(event)}
        aria-hidden="true"
      />
    </>
  );
};


/**
 * Takes you to a different page
 */
export const BackButton: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <ThemedTooltip title={t("subtitles.backButton-tooltip")}>
      <div css={[basicButtonStyle(theme), subtitleButtonStyle(theme)]}
        role="button" tabIndex={0}
        aria-label={t("subtitles.backButton-tooltip")}
        onClick={() => dispatch(setIsDisplayEditView(false))}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === " " || event.key === "Enter") {
            dispatch(setIsDisplayEditView(false));
          }
        }}>
        <LuChevronLeft css={{ fontSize: 24 }} />
        <span>{t("subtitles.backButton")}</span>
      </div>
    </ThemedTooltip>
  );
};

export default SubtitleEditor;
