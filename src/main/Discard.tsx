import React from "react";

import { css } from '@emotion/react'
import { basicButtonStyle, backOrContinueStyle, navigationButtonStyle, flexGapReplacementStyle} from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft, faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { selectFinishState } from '../redux/finishSlice'
import { setEnd } from '../redux/endSlice'

import { PageButton } from './Finish'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { getTheme } from "./ThemeSwitcher";

/**
 * Shown if the user wishes to abort.
 * Informs the user about aborting and displays abort button.
 */
const Discard : React.FC<{}> = () => {

  const { t } = useTranslation();

  const finishState = useSelector(selectFinishState)

  const cancelStyle = css({
    display: finishState !== "Discard changes" ? 'none' : 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    ...(flexGapReplacementStyle(30, false)),
  })

  return (
    <div css={cancelStyle}>
      <h1>{t("discard.headline-text")}</h1>
      <span>
        {t("discard.info-text")}
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label={t("various.goBack-button")} iconName={faChevronLeft} />
        <DiscardButton />
      </div>
    </div>
  );
}

/**
 * Button that sets the app into an aborted state
 */
const DiscardButton : React.FC<{}> = () => {

  const { t } = useTranslation();
  const mode = useSelector((state: RootStateOrAny) => state.theme);
  const theme = getTheme(mode);

  // Initialize redux variables
  const dispatch = useDispatch()

  const discard = () => {
    dispatch(setEnd({hasEnded: true, value: 'discarded'}))
  }

  return (
    <div css={[basicButtonStyle, navigationButtonStyle(theme)]} title={t("discard.confirm-tooltip")}
      role="button" tabIndex={0}
      onClick={ discard }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        discard()
      }}}>
      <FontAwesomeIcon  icon={faTimesCircle} size="1x"/>
      <span>{t("discard.confirm-button")}</span>
    </div>
  );
}

export default Discard;
