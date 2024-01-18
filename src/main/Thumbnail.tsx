import { css } from "@emotion/react";
import { IconType } from "react-icons";
import { LuCamera, LuCopy, LuXCircle, LuUpload } from "react-icons/lu";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { settings } from "../config";
import {
  basicButtonStyle, deactivatedButtonStyle, flexGapReplacementStyle, titleStyle, titleStyleBold, videosStyle,
  backgroundBoxStyle,
} from "../cssStyles";
import { Theme, useTheme } from "../themes";
import {
  selectOriginalThumbnails,
  selectVideos,
  selectTracks,
  setHasChanges,
  setThumbnail,
  setThumbnails,
} from "../redux/videoSlice";
import { Track } from "../types";
import Timeline from "./Timeline";
import {
  selectIsPlaying,
  selectIsMuted,
  selectVolume,
  selectCurrentlyAt,
  setIsPlaying,
  selectIsPlayPreview,
  setIsPlayPreview,
  setClickTriggered,
  setIsMuted,
  setVolume,
  setCurrentlyAt,
} from "../redux/videoSlice";
import { ThemedTooltip } from "./Tooltip";
import VideoPlayers from "./VideoPlayers";
import VideoControls from "./VideoControls";


/**
 * User interface for handling thumbnails
 */
const Thumbnail: React.FC = () => {

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const theme = useTheme();
  const originalThumbnails = useAppSelector(selectOriginalThumbnails);

  // Generate Refs
  const generateRefs = React.useRef<any>([]);
  // Upload Refs
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Generate image and save in redux
  //   *track: Generate to
  //   *index: Generate from
  const generate = (track: Track, index: number) => {
    const uri = generateRefs.current[index].captureVideo();
    dispatch(setThumbnail({ id: track.id, uri: uri }));
    dispatch(setHasChanges(true));
  };

  // Trigger file handler for upload input element
  const upload = (index: number) => {
    // open file input box on click of other element
    const ref = inputRefs.current[index];
    if (ref !== null) {
      ref.click();
    }
  };

  // Save uploaded file in redux
  const uploadCallback = (event: React.ChangeEvent<HTMLInputElement>, track: Track) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    // Check if image
    if (fileObj.type.split("/")[0] !== "image") {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      // the result image data
      if (e.target && e.target.result) {
        const uri = e.target.result.toString();
        dispatch(setThumbnail({ id: track.id, uri: uri }));
        dispatch(setHasChanges(true));
      }
    };
    reader.readAsDataURL(fileObj);
  };

  const discardThumbnail = (id: string) => {
    dispatch(setThumbnail({ id: id, uri: originalThumbnails.find(e => e.id === id)?.uri }));
  };

  const thumbnailStyle = css({
    display: "flex",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  });

  const bottomStyle = css({
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  });

  return (
    <div css={thumbnailStyle}>
      <div css={[titleStyle(theme), titleStyleBold(theme)]}>{t("thumbnail.title")}</div>
      <ThumbnailTable
        inputRefs={inputRefs}
        generateRefs={generateRefs}
        generate={generate}
        upload={upload}
        uploadCallback={uploadCallback}
        discard={discardThumbnail}
      />
      <div css={bottomStyle}>
        {/* use maxHeightInPixel to make video players the same size*/}
        <VideoPlayers refs={generateRefs} widthInPercent={100} maxHeightInPixel={420} />
        <div css={videosStyle(theme)}>
          <Timeline
            timelineHeight={125}
            styleByActiveSegment={false}
            selectIsPlaying={selectIsPlaying}
            selectCurrentlyAt={selectCurrentlyAt}
            setIsPlaying={setIsPlaying}
            setCurrentlyAt={setCurrentlyAt}
            setClickTriggered={setClickTriggered}
          />
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
          />
        </div>
      </div>
    </div>
  );
};

/**
 * A table for displaying thumbnails and associated actions
 */
const ThumbnailTable: React.FC<{
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  generateRefs: React.MutableRefObject<any>,
  generate: (track: Track, index: number) => void,
  upload: (index: number) => void,
  uploadCallback: (event: React.ChangeEvent<HTMLInputElement>, track: Track) => void,
  discard: (id: string) => void,
}> = ({ inputRefs, generateRefs, generate, upload, uploadCallback, discard }) => {

  const videoTracks = useAppSelector(selectVideos);

  const thumbnailTableStyle = css({
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    ...(flexGapReplacementStyle(10, false)),
    paddingBottom: "20px",
  });

  const renderSingleOrMultiple = () => {
    const primaryTrack = videoTracks.find(e => e.thumbnailPriority === 0);

    if (settings.thumbnail.simpleMode && primaryTrack !== undefined) {
      return (
        <div css={thumbnailTableStyle}>
          <ThumbnailTableSingleRow
            track={primaryTrack}
            index={videoTracks.indexOf(primaryTrack)}
            inputRefs={inputRefs}
            generate={generate}
            upload={upload}
            uploadCallback={uploadCallback}
            discard={discard}
          />
        </div>
      );
    } else {
      return (<>
        {videoTracks.length > 1 &&
          <AffectAllRow tracks={videoTracks} generate={generate} />
        }
        <div css={thumbnailTableStyle}>
          {videoTracks.map((track: Track, index: number) => (
            <ThumbnailTableRow
              key={index}
              track={track}
              index={index}
              inputRefs={inputRefs}
              generateRef={generateRefs.current[index]}
              generate={generate}
              upload={upload}
              uploadCallback={uploadCallback}
              discard={discard}
            />
          ))}
        </div>
      </>);
    }
  };

  return (
    <>
      {renderSingleOrMultiple()}
    </>
  );
};

/**
 * A table entry for a single video+thumbnail pair
 */
const ThumbnailTableRow: React.FC<{
  track: Track,
  index: number,
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  generateRef: any,
  generate: (track: Track, index: number) => void,
  upload: (index: number) => void,
  uploadCallback: (event: React.ChangeEvent<HTMLInputElement>, track: Track) => void,
  discard: (id: string) => void,
}> = ({ track, index, inputRefs, generateRef, generate, upload, uploadCallback, discard }) => {

  const { t } = useTranslation();
  const theme = useTheme();

  // The "+40" comes from padding that is not included in the "getWidth" function
  const videoWidth = generateRef ? generateRef.getWidth() + 40 : undefined;

  const renderPriority = (thumbnailPriority: number) => {
    if (isNaN(thumbnailPriority)) {
      return "";
    } else if (thumbnailPriority === 0) {
      return " - " + t("thumbnail.primary");
    } else if (thumbnailPriority === 1) {
      return " - " + t("thumbnail.secondary");
    } else if (thumbnailPriority < 0) {
      return "";
    } else {
      return " - " + thumbnailPriority;
    }
  };

  return (
    <div key={index} css={[backgroundBoxStyle(theme), thumbnailTableRowStyle(videoWidth)]}>
      <div css={thumbnailTableRowTitleStyle}>
        {track.flavor.type + renderPriority(track.thumbnailPriority)}
      </div>
      <div css={thumbnailTableRowRowStyle} key={index}>
        <ThumbnailDisplayer track={track} />
        <ThumbnailButtons
          track={track}
          index={index}
          inputRefs={inputRefs}
          generate={generate}
          upload={upload}
          uploadCallback={uploadCallback}
          discard={discard} />
      </div>
    </div>
  );
};

/**
 * Displays thumbnail associated with the given track
 * or a placeholder
 */
const ThumbnailDisplayer: React.FC<{ track: Track; }> = ({ track }) => {

  const { t } = useTranslation();
  const theme = useTheme();

  const generalStyle = css({
    width: "100%",
    maxWidth: "457px",
    aspectRatio: "16/9",
  });

  const imageStyle = css({
  });

  const placeholderStyle = css({
    width: "100vw", // TODO: This is necessary to make the placeholder large enough, but prevents it from shrinking
    backgroundColor: "grey",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: `${theme.text}`,
  });

  return (
    <>
      {(track.thumbnailUri !== null && track.thumbnailUri !== undefined) ?
        // Thumbnail image
        <img src={track.thumbnailUri}
          alt={t("thumbnail.previewImageAlt") + ": " + track.flavor.type}
          css={[generalStyle, imageStyle]}
        />
        :
        // Placeholder
        <div css={[generalStyle, placeholderStyle]}>
          <span>{t("thumbnail.noThumbnailAvailable")}</span>
        </div>
      }
    </>
  );
};

/**
 * Buttons and actions related to thumbnails for a given track
 */
const ThumbnailButtons: React.FC<{
  track: Track,
  index: number,
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  generate: (track: Track, index: number) => void,
  upload: (index: number) => void,
  uploadCallback: (event: React.ChangeEvent<HTMLInputElement>, track: Track) => void,
  discard: (id: string) => void,
}> = ({ track, index, inputRefs, generate, upload, uploadCallback, discard }) => {

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const tracks = useAppSelector(selectTracks);

  // Set the given thumbnail for all tracks
  const setForOtherThumbnails = (uri: string | undefined) => {
    if (uri === undefined) {
      return;
    }
    const thumbnails = [];
    for (const track of tracks) {
      thumbnails.push({ id: track.id, uri: uri });
    }
    dispatch(setThumbnails(thumbnails));
    dispatch(setHasChanges(true));
  };

  const verticalLineStyle = css({
    borderTop: "1px solid #DDD;",
    width: "100%",
  });

  return (
    <div css={thumbnailButtonsStyle}>
      <ThumbnailButton
        handler={() => { generate(track, index); }}
        text={t("thumbnail.buttonGenerate")}
        tooltipText={t("thumbnail.buttonGenerate-tooltip")}
        ariaLabel={t("thumbnail.buttonGenerate-tooltip-aria")}
        Icon={LuCamera}
        active={true}
      />
      <div css={verticalLineStyle} />
      <ThumbnailButton
        handler={() => { upload(index); }}
        text={t("thumbnail.buttonUpload")}
        tooltipText={t("thumbnail.buttonUpload-tooltip")}
        ariaLabel={t("thumbnail.buttonUpload-tooltip-aria")}
        Icon={LuUpload}
        active={true}
      />
      {/* Hidden input field for upload */}
      <input
        style={{ display: "none" }}
        ref={el => {
          inputRefs.current[index] = el;
        }}
        type="file"
        accept="image/*"
        onChange={event => uploadCallback(event, track)}
        aria-hidden="true"
      />
      <div css={verticalLineStyle} />
      {tracks.length > 1 &&
        <>
          <ThumbnailButton
            handler={() => { setForOtherThumbnails(track.thumbnailUri); }}
            text={t("thumbnail.buttonUseForOtherThumbnails")}
            tooltipText={t("thumbnail.buttonUseForOtherThumbnails-tooltip")}
            ariaLabel={t("thumbnail.buttonUseForOtherThumbnails-tooltip-aria")}
            Icon={LuCopy}
            active={(track.thumbnailUri && track.thumbnailUri.startsWith("data") ? true : false)}
          />
          <div css={verticalLineStyle} />
        </>
      }
      <ThumbnailButton
        handler={() => { discard(track.id); }}
        text={t("thumbnail.buttonDiscard")}
        tooltipText={t("thumbnail.buttonDiscard-tooltip")}
        ariaLabel={t("thumbnail.buttonDiscard-tooltip-aria")}
        Icon={LuXCircle}
        active={(track.thumbnailUri && track.thumbnailUri.startsWith("data") ? true : false)}
      />
    </div>
  );
};

const ThumbnailButton: React.FC<{
  handler: () => void,
  text: string;
  tooltipText: string,
  ariaLabel: string,
  Icon: IconType,
  active: boolean,
}> = ({ handler, text, tooltipText, ariaLabel, Icon, active }) => {
  const theme = useTheme();
  const ref = React.useRef<HTMLDivElement>(null);

  const clickHandler = () => {
    if (active) { handler(); }
    ref.current?.blur();
  };
  const keyHandler = (event: React.KeyboardEvent) => {
    if (active && (event.key === " " || event.key === "Enter")) {
      handler();
    }
  };

  return (
    <ThemedTooltip title={tooltipText}>
      <div
        css={thumbnailButtonStyle(active, theme)}
        ref={ref}
        role="button" tabIndex={0} aria-label={ariaLabel}
        onClick={clickHandler}
        onKeyDown={keyHandler}
      >
        <Icon />
        {text}
      </div>
    </ThemedTooltip>
  );
};

/**
 * Extra header/footer row
 * For e.g. buttons that affect all rows in the table
 */
const AffectAllRow: React.FC<{
  tracks: Track[];
  generate: (track: Track, index: number) => void;
}> = ({ generate, tracks }) => {

  const { t } = useTranslation();
  const theme = useTheme();

  const generateAll = () => {
    for (let i = 0; i < tracks.length; i++) {
      generate(tracks[i], i);
    }
  };

  const rowStyle = css({
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "50px",
    padding: "20px",
    gap: "20px",
    justifyContent: "center",
    alignItems: "center",
  });

  const buttonStyle = css({
    height: "100%",
    minWidth: "200px",
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  });

  return (
    <div css={rowStyle}>
      <ThemedTooltip title={t("thumbnail.buttonGenerateAll-tooltip")}>
        <div css={[basicButtonStyle(theme), buttonStyle]}
          role="button" tabIndex={0} aria-label={t("thumbnail.buttonGenerateAll-tooltip-aria")}
          onClick={() => {
            generateAll();
          }}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key === " " || event.key === "Enter") {
              generateAll();
            }
          }}
        >
          <LuCamera />
          {t("thumbnail.buttonGenerateAll")}
        </div>
      </ThemedTooltip>
    </div>
  );
};

/**
 * Components for simple mode
 */

/**
 * Main simple mode component. A single table row displaying the interface for
 * the primary thumbnail.
 */
const ThumbnailTableSingleRow: React.FC<{
  track: Track,
  index: number,
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  generate: (track: Track, index: number) => void,
  upload: (index: number) => void,
  uploadCallback: (event: React.ChangeEvent<HTMLInputElement>, track: Track) => void,
  discard: (id: string) => void,
}> = ({ track, index, inputRefs, generate, upload, uploadCallback, discard }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <div key={index} css={[backgroundBoxStyle(theme), thumbnailTableRowStyle(500)]}>
      <div css={thumbnailTableRowTitleStyle}>
        {t("thumbnailSimple.rowTitle")}
      </div>
      <hr css={{ width: "100%" }}></hr>
      <div css={thumbnailTableRowRowStyle} key={index}>
        <ThumbnailDisplayer track={track} />
        <ThumbnailButtonsSimple
          track={track}
          index={index}
          inputRefs={inputRefs}
          generate={generate}
          upload={upload}
          uploadCallback={uploadCallback}
          discard={discard} />
      </div>
    </div>
  );
};

/**
 * Buttons for simple mode. Shows a generate button for each video
 */
const ThumbnailButtonsSimple: React.FC<{
  track: Track,
  index: number,
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  generate: (track: Track, index: number) => void,
  upload: (index: number) => void,
  uploadCallback: (event: React.ChangeEvent<HTMLInputElement>, track: Track) => void,
  discard: (id: string) => void,
}> = ({ track, index, generate, inputRefs, upload, uploadCallback, discard }) => {

  const { t } = useTranslation();
  const tracks = useAppSelector(selectTracks);

  return (
    <div css={thumbnailButtonsStyle}>
      {tracks.map((generateTrack: Track, generateIndex: number) => (
        <ThumbnailButton
          handler={() => { generate(track, generateIndex); }}
          text={t("thumbnail.buttonGenerate") + " " + t("thumbnailSimple.from") + " " + generateTrack.flavor.type}
          tooltipText={t("thumbnail.buttonGenerate-tooltip")}
          ariaLabel={t("thumbnail.buttonGenerate-tooltip-aria")}
          Icon={LuCamera}
          active={true}
          key={generateIndex}
        />
      ))}
      <ThumbnailButton
        handler={() => { upload(index); }}
        text={t("thumbnail.buttonUpload")}
        tooltipText={t("thumbnail.buttonUpload-tooltip")}
        ariaLabel={t("thumbnail.buttonUpload-tooltip-aria")}
        Icon={LuUpload}
        active={true}
      />
      {/* Hidden input field for upload */}
      <input
        style={{ display: "none" }}
        ref={el => {
          inputRefs.current[index] = el;
        }}
        type="file"
        accept="image/*"
        onChange={event => uploadCallback(event, track)}
        aria-hidden="true"
      />
      <ThumbnailButton
        handler={() => { discard(track.id); }}
        text={t("thumbnail.buttonDiscard")}
        tooltipText={t("thumbnail.buttonDiscard-tooltip")}
        ariaLabel={t("thumbnail.buttonDiscard-tooltip-aria")}
        Icon={LuXCircle}
        active={(track.thumbnailUri && track.thumbnailUri.startsWith("data") ? true : false)}
      />
    </div>
  );
};

/**
 * CSS shared between multi and simple display mode
 */
const thumbnailTableRowStyle = (maxWidth: number) => css({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: `${maxWidth}px`,
});

const thumbnailTableRowTitleStyle = css({
  textAlign: "left",
  fontSize: "larger",
  fontWeight: "bold",
  "&:first-letter": {
    textTransform: "capitalize",
  },
});

const thumbnailTableRowRowStyle = css({
  display: "flex",
  flexDirection: "row",
  ...(flexGapReplacementStyle(20, true)),

  justifyContent: "space-around",
  flexWrap: "wrap",
});

const thumbnailButtonsStyle = css({
  // TODO: Avoid hard-coding max-width
  "@media (max-width: 1550px)": {
    width: "100%",
  },
  display: "flex",
  flexDirection: "column",
});

const thumbnailButtonStyle = (active: boolean, theme: Theme) => [
  active ? basicButtonStyle(theme) : deactivatedButtonStyle,
  {
    width: "100%",
    height: "100%",
    background: `${theme.element_bg}`,
    justifySelf: "center",
    alignSelf: "center",
    padding: "0px 4px",
  },
];


export default Thumbnail;
