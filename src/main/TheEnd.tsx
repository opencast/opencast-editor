import React from "react";

import { css } from '@emotion/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux';
import { selectDuration } from '../redux/videoSlice'
import { selectEndState } from '../redux/endSlice'
import { basicButtonStyle, nagivationButtonStyle } from "../cssStyles";

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { Trans } from "react-i18next";

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 */
const TheEnd : React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const endState = useSelector(selectEndState)
  const duration = useSelector(selectDuration)

  const icon = () => {
    if (endState === 'discarded') {
      return faTimesCircle
    } else {
      return faCheckCircle
    }
  }

  const text = () => {
    if (endState === 'discarded') {
      return t("theEnd-discarded-text")
    } else if (endState === 'success') {
      return (<Trans i18nKey="save-error-details-text">
      "Changes successfully saved to Opencast. Processing your changes may take up to "
      {{duration: `${new Date((duration * 2)).toISOString().substr(11, 8)}`}} " hours. You can now close the editor." </Trans>
      )
    }
  }

  const theEndStyle = css({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    gap: '20px',
  })

  return (
    <div css={theEndStyle} title="The End">
      <FontAwesomeIcon icon={icon()} size="10x" />
      <div>{text()}</div>
      {(endState === 'discarded') && <StartOverButton />}
    </div>
  );
}


const StartOverButton: React.FC<{}> = () => {

  const { t } = useTranslation();

  const reloadPage = () => {
    window.location.reload(true);
  };

  return (
    <div css={[basicButtonStyle, nagivationButtonStyle]} title={t("theEnd-startOver-tooltip")}
      role="button" tabIndex={0}
      onClick={ reloadPage }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        reloadPage()
      }}}>
      {/* <FontAwesomeIcon icon={icon} spin={spin} size="1x"/> */}
      <span>{t("theEnd-startOver-button")}</span>
    </div>
  );
}

export default TheEnd
