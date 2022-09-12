import React from "react";

import { css } from '@emotion/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux';
import { selectEndState } from '../redux/endSlice'
import { basicButtonStyle, flexGapReplacementStyle, navigationButtonStyle } from "../cssStyles";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { selectTheme } from "../redux/themeSlice";
import { ThemedTooltip } from "./Tooltip";

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 */
const TheEnd : React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const endState = useSelector(selectEndState)

  const icon = () => {
    if (endState === 'discarded') {
      return faTimesCircle
    } else {
      return faCheckCircle
    }
  }

  const text = () => {
    if (endState === 'discarded') {
      return t("theEnd.discarded-text")
    } else if (endState === 'success') {
      return t("theEnd.info-text")
    }
  }

  const theEndStyle = css({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(20, false)),
  })

  return (
    <div css={theEndStyle}>
      <FontAwesomeIcon icon={icon()} size="10x" />
      <div>{text()}</div>
      {(endState === 'discarded') && <StartOverButton />}
    </div>
  );
}


const StartOverButton: React.FC<{}> = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <ThemedTooltip title={t("theEnd.startOver-tooltip")}>
      <div css={[basicButtonStyle, navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={ reloadPage }
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          reloadPage()
        }}}>
        {/* <FontAwesomeIcon icon={icon} spin={spin} size="1x"/> */}
        <span>{t("theEnd.startOver-button")}</span>
      </div>
    </ThemedTooltip>
  );
}

export default TheEnd
