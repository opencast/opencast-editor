import React from "react";

import { css } from '@emotion/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFrown } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux';
import { selectErrorDetails, selectErrorMessage } from '../redux/errorSlice'
import { flexGapReplacementStyle } from "../cssStyles";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * This page is to be displayed when the application has run into a critical error
 * from which it cannot recover.
 */
 const Error : React.FC<{}> = () => {

  const { t } = useTranslation();

  // Init redux variables
  const errorMessage = useSelector(selectErrorMessage)
  const errorDetails = useSelector(selectErrorDetails)

  const detailsStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  })

  const theEndStyle = css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(10, false)),
  })

  return (
    <div css={theEndStyle} >
      <div>{t("error.generic-message")}</div>
      <FontAwesomeIcon icon={faFrown} size="10x" />
      <span>{errorMessage}</span><br />
      <div css={detailsStyle}>
        <span>{t("error.details")}</span><br />
        <span>{errorDetails ? errorDetails : t("various.error-noDetails-text") }</span>
      </div>
    </div>
  );
}

export default Error
