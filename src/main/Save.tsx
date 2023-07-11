import React, { useEffect, useState } from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, ariaLive, errorBoxStyle,
  navigationButtonStyle, flexGapReplacementStyle, spinningStyle } from '../cssStyles'

import { FiLoader, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiSave, FiCheck} from "react-icons/fi";

import { useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { selectHasChanges, selectSegments, selectTracks, setHasChanges as videoSetHasChanges } from '../redux/videoSlice'
import { postVideoInformation, selectStatus, selectError } from '../redux/workflowPostSlice'

import { PageButton } from './Finish'

import { useTranslation } from 'react-i18next';
import { AppDispatch } from "../redux/store";
import { postMetadata, selectPostError, selectPostStatus, setHasChanges as metadataSetHasChanges,
  selectHasChanges as metadataSelectHasChanges } from "../redux/metadataSlice";
import { selectSubtitles, selectHasChanges as selectSubtitleHasChanges,
  setHasChanges as subtitleSetHasChanges } from "../redux/subtitleSlice";
import { serializeSubtitle } from "../util/utilityFunctions";
import { Flavor } from "../types";
import { selectTheme, Theme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

/**
 * Shown if the user wishes to save.
 * Informs the user about saving and displays a save button
 */
const Save : React.FC = () => {

  const { t } = useTranslation();

  const finishState = useSelector(selectFinishState)

  const postWorkflowStatus = useSelector(selectStatus);
  const postError = useSelector(selectError)
  const postMetadataStatus = useSelector(selectPostStatus);
  const postMetadataError = useSelector(selectPostError);
  const theme = useSelector(selectTheme);
  const metadataHasChanges = useSelector(metadataSelectHasChanges)
  const hasChanges = useSelector(selectHasChanges)
  const subtitleHasChanges = useSelector(selectSubtitleHasChanges)

  const saveStyle = css({
    height: '100%',
    display: finishState !== "Save changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  const render = () => {
    // Post (successful) save
    if (postWorkflowStatus === 'success' && postMetadataStatus === 'success'
      && !hasChanges && !metadataHasChanges && !subtitleHasChanges) {
      return (
        <>
          <FiCheckCircle css={{fontSize: 80}}/>
          <div>{t("save.success-text")}</div>
        </>
      )
    // Pre save
    } else {
      return (
        <>
          <span css={{maxWidth: '500px'}}>
            {t("save.info-text")}
          </span>
          <div css={backOrContinueStyle}>
            <PageButton pageNumber={0} label={t("various.goBack-button")} Icon={FiChevronLeft}/>
            <SaveButton />
          </div>
        </>
      )
    }
  }

  return (
    <div css={saveStyle}>
      <h1>{t("save.headline-text")}</h1>
      {render()}
      <div css={errorBoxStyle(postWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postError ? t("various.error-details-text", {errorMessage: postError}) : t("various.error-text")}<br />
      </div>
      <div css={errorBoxStyle(postMetadataStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postMetadataError ? t("various.error-details-text", {errorMessage: postMetadataError}) : t("various.error-text")}<br />
      </div>
    </div>
  );
}

/**
 * Button that sends a post request to save current changes
 */
export const SaveButton: React.FC = () => {

  const { t } = useTranslation();

  // Initialize redux variables
  const dispatch = useDispatch<AppDispatch>()

  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const subtitles = useSelector(selectSubtitles)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);
  const theme = useSelector(selectTheme);
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);

  // Update based on current fetching status
  let Icon = FiSave
  let spin = false
  let tooltip = null
  if (workflowStatus === 'failed' || metadataStatus === 'failed') {
    Icon = FiAlertCircle
    spin = false
    tooltip = t("save.confirmButton-failed-tooltip")
  } else if (workflowStatus === 'success' && metadataStatus === 'success') {
    Icon = FiCheck
    spin = false
    tooltip = t("save.confirmButton-success-tooltip")
  } else if (workflowStatus === 'loading' || metadataStatus === 'loading') {
    Icon = FiLoader
    spin = true
    tooltip = t("save.confirmButton-attempting-tooltip")
  }

  const ariaSaveUpdate = () => {
    if (workflowStatus === 'success') {
      return t("save.success-tooltip-aria")
    }
  }

  const prepareSubtitles = () => {
    const subtitlesForPosting = []

    for (const identifier in subtitles) {
      const flavor: Flavor = {type: identifier.split("/")[0], subtype: identifier.split("/")[1]}
      subtitlesForPosting.push({flavor: flavor, subtitle: serializeSubtitle(subtitles[identifier])})

    }
    return subtitlesForPosting
  }

  // Dispatches first save request
  // Subsequent save requests should be wrapped in useEffect hooks,
  // so they are only sent after the previous one has finished
  const save = () => {
    setMetadataSaveStarted(true)
    dispatch(postMetadata())
  }

  // Subsequent save request
  useEffect(() => {
    if (metadataStatus === 'success' && metadataSaveStarted) {
      setMetadataSaveStarted(false)
      dispatch(postVideoInformation({
        segments: segments,
        tracks: tracks,
        subtitles: prepareSubtitles()
      }))

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStatus])

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === 'success' && metadataStatus === 'success') {
      dispatch(videoSetHasChanges(false))
      dispatch(metadataSetHasChanges(false))
      dispatch(subtitleSetHasChanges(false))
    }
  }, [dispatch, metadataStatus, workflowStatus])

  return (
    <ThemedTooltip title={tooltip == null ? tooltip = "" : tooltip}>
      <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={save}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          save()
        } }}>
        <Icon css={spin ? spinningStyle : undefined}/>
        <span>{t("save.confirm-button")}</span>
        <div css={ariaLive} aria-live="polite" aria-atomic="true">{ariaSaveUpdate()}</div>
      </div>
    </ThemedTooltip>
  );
}

export const DialogSave: React.FC<{
  isRender: boolean,
  stopRender: () => void,
}> = ({
  isRender,
  stopRender
}) => {

  // Initialize redux variables
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()

  const segments = useSelector(selectSegments)
  const tracks = useSelector(selectTracks)
  const subtitles = useSelector(selectSubtitles)
  const workflowStatus = useSelector(selectStatus);
  const metadataStatus = useSelector(selectPostStatus);
  const [metadataSaveStarted, setMetadataSaveStarted] = useState(false);

  // Dialog
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveAttemptStarted, setSaveAttemptStarted] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  const handleSaveOpen = () => {
    setSaveOpen(true);
  };

  const handleSaveClose = () => {
    setSaveOpen(false);
    stopRender()
  };

  const handleResultOpen = () => {
    setResultOpen(true)
  }

  const handleResultClose = () => {
    setResultOpen(false)
    stopRender()
  }

  useEffect(() => {
    if (isRender) {
      handleSaveOpen()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender])

  const prepareSubtitles = () => {
    const subtitlesForPosting = []

    for (const identifier in subtitles) {
      const flavor: Flavor = {type: identifier.split("/")[0], subtype: identifier.split("/")[1]}
      subtitlesForPosting.push({flavor: flavor, subtitle: serializeSubtitle(subtitles[identifier])})

    }
    return subtitlesForPosting
  }

  // Dispatches first save request
  // Subsequent save requests should be wrapped in useEffect hooks,
  // so they are only sent after the previous one has finished
  const save = () => {
    setMetadataSaveStarted(true)
    dispatch(postMetadata())
    setSaveAttemptStarted(true)
  }

  // Subsequent save request
  useEffect(() => {
    if (metadataStatus === 'success' && metadataSaveStarted) {
      setMetadataSaveStarted(false)
      dispatch(postVideoInformation({
        segments: segments,
        tracks: tracks,
        subtitles: prepareSubtitles()
      }))

    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadataStatus])

  // Let users leave the page without warning after a successful save
  useEffect(() => {
    if (workflowStatus === 'success' && metadataStatus === 'success') {
      dispatch(videoSetHasChanges(false))
      dispatch(metadataSetHasChanges(false))
      dispatch(subtitleSetHasChanges(false))

      if (saveAttemptStarted) {
        setSaveOpen(false)
        handleResultOpen()
        setSaveAttemptStarted(false)
      }
    }
  }, [dispatch, metadataStatus, workflowStatus])

  let title = ""
  let content = ""
  const confirmation = t("save.confirm-success")
  if (workflowStatus === 'failed' || metadataStatus === 'failed') {
    title = t("save.confirmButton-failed-tooltip")
    content = t("various.error-text")
  } else if (workflowStatus === 'success' && metadataStatus === 'success') {
    title = t("save.confirmButton-success-tooltip")
    content = t("save.success-text")
  } else if (workflowStatus === 'loading' || metadataStatus === 'loading') {
    title = t("save.confirmButton-attempting-tooltip")
    content = t("save.confirmButton-attempting-tooltip")
  }

  return (
    <>
      <SaveDialog
        open={saveOpen}
        onConfirm={save}
        onClose={handleSaveClose}
      />
      <ResultDialog
        open={resultOpen}
        onClose={handleResultClose}
        title={title}
        content={content}
        confirmation={confirmation}
      />
    </>
  )
}

const dialogTitleStyle = (theme: Theme) => css({
  color: `${theme.text}`,
  fontWeight: 'bold'
})

const dialogContentStyle = (theme: Theme) => css({
  color: `${theme.text}`,
})

const dialogConfirmationButtonStyle = (theme: Theme) => css({
  color: `${theme.icon_color}`,
  fontWeight: 'bold',
  border: `1px solid ${theme.text}`,
  background: `${theme.background_play_icon}`,
  "&:hover": {
    background: `${theme.background_play_icon}`,
  },
})

const dialogCancelButtonStyle = (theme: Theme) => css({
  color: `${theme.text}`,
  fontWeight: 'bold',
  border: `1px solid ${theme.text}`,
  background: `${theme.element_bg}`,
})

export const SaveDialog: React.FC<{
  open: boolean,
  onConfirm: () => void,
  onClose: () => void,
}> = ({
  open,
  onConfirm,
  onClose,
}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" css={dialogTitleStyle(theme)}>
        {t("save.headline-text")}
      </DialogTitle>
      <DialogContent css={dialogContentStyle(theme)}>
        <DialogContentText id="alert-dialog-description">
          {t("save.info-text")}
        </DialogContentText>
      </DialogContent>
      <DialogActions css={{overflow: 'hidden'}}>
        <Button
          css={[basicButtonStyle(theme), dialogCancelButtonStyle(theme)]}
          onClick={onClose}
        >
          {t("save.cancel-save")}
        </Button>
        <Button
          css={[basicButtonStyle(theme), dialogConfirmationButtonStyle(theme)]}
          onClick={onConfirm}
        >
          {t("save.confirm-button")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const ResultDialog: React.FC<{
  open: boolean,
  onClose: () => void,
  title: string,
  content: string,
  confirmation: string
}> = ({
  open,
  onClose,
  title,
  content,
  confirmation,
}) => {

  const theme = useSelector(selectTheme)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" css={dialogTitleStyle(theme)}>
        {title}
      </DialogTitle>
      <DialogContent css={dialogContentStyle(theme)}>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          css={[basicButtonStyle(theme), dialogConfirmationButtonStyle(theme)]}
          onClick={onClose}
        >
          {confirmation}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default Save;
