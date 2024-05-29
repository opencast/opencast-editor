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
import { ConfirmationModal, ConfirmationModalHandle, Modal, ModalHandle, boxError } from "@opencast/appkit";

/**
 * Displays an editor view for a selected subtitle file
 */
const SubtitleEditor: React.FC = () => {

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const [getError, setGetError] = useState<string | undefined>(undefined);
  const subtitle = useAppSelector(selectSelectedSubtitleById);
  const selectedId = useAppSelector(selectSelectedSubtitleId);
  const captionTrack = useAppSelector(state => selectSubtitlesFromOpencastById(state, selectedId));
  const theme = useTheme();
  const modalRef = React.useRef<ModalHandle>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | undefined>(undefined);

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

  // Display error modal
  useEffect(() => {
    if (modalRef.current && uploadErrorMessage) {
      modalRef.current?.open();
    }
    if (modalRef.current && modalRef.current.close && !uploadErrorMessage) {
      setUploadErrorMessage(undefined);
      modalRef.current.close();
    }
  }, [uploadErrorMessage]);

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
    ...(flexGapReplacementStyle(10, false)),
    padding: "15px",
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
            <div css={[titleStyle(theme), titleStyleBold(theme), { padding: "0px" }]}>
              {t("subtitles.editTitle", { title: getTitle() })}
            </div>
            <div css={topRightButtons}>
              <UploadButton setErrorMessage={setUploadErrorMessage} />
              <DownloadButton />
              <Modal
                ref={modalRef}
                title={t("subtitles.uploadButton-error")}
                text={{ close: t("modal.close") }}
              >
                {uploadErrorMessage}
              </Modal>
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

const UploadButton: React.FC<{
  setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>,
}> = ({
  setErrorMessage,
}) => {

  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [isFileUploadTriggered, setisFileUploadTriggered] = useState(false);
  const subtitle = useAppSelector(selectSelectedSubtitleById);
  const selectedId = useAppSelector(selectSelectedSubtitleId);
  // Upload Ref
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Modal Ref
  const modalRef = React.useRef<ConfirmationModalHandle>(null);

  const triggerFileUpload = () => {
    modalRef.current?.done();
    setisFileUploadTriggered(true);
  };

  useEffect(() => {
    if (isFileUploadTriggered) {
      inputRef.current?.click();
      setisFileUploadTriggered(false);
    }
  }, [isFileUploadTriggered]);

  // Save uploaded file in redux
  const uploadCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    // Check if not text
    if (fileObj.type.split("/")[0] !== "text") {
      setErrorMessage(t("subtitles.uploadButton-error-filetype"));
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      if (e.target && (e.target.result || e.target.result === "")) {
        try {
          const text = e.target.result.toString();
          const subtitleParsed = parseSubtitle(text);
          dispatch(setSubtitle({ identifier: selectedId, subtitles: { cues: subtitleParsed, tags: subtitle.tags } }));
        } catch (e) {
          console.error(e);
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
          onClick={() => modalRef.current?.open()}
        >
          <LuUpload css={{ fontSize: "16px" }}/>
          <span>{t("subtitles.uploadButton-title")}</span>
        </div>
      </ThemedTooltip>
      {/* Hidden input field for upload */}
      <input
        style={{ display: "none" }}
        ref={inputRef}
        type="file"
        accept="text/vtt"
        onChange={event => uploadCallback(event)}
        aria-hidden="true"
      />
      <ConfirmationModal
        title={t("subtitles.uploadButton-warning-header")}
        buttonContent={t("modal.confirm")}
        onSubmit={triggerFileUpload}
        ref={modalRef}
        text={{
          cancel: t("modal.cancel"),
          close: t("modal.close"),
          areYouSure: t("modal.areYouSure"),
        }}
      >
        {t("subtitles.uploadButton-warning")}
      </ConfirmationModal>
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
