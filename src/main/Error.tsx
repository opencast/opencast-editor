import React from "react";

import { css } from '@emotion/react'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFrown } from "@fortawesome/free-solid-svg-icons";

import { useSelector } from 'react-redux';
import { selectErrorDetails, selectErrorIcon, selectErrorMessage, selectErrorTitle } from '../redux/errorSlice'
import { flexGapReplacementStyle } from "../cssStyles";

import { useTranslation } from 'react-i18next';

/**
 * This page is to be displayed when the application has run into a critical error
 * from which it cannot recover.
 */
const Error : React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const errorTitle = useSelector(selectErrorTitle)
  const errorMessage = useSelector(selectErrorMessage)
  const errorDetails = useSelector(selectErrorDetails)
  const errorIcon = useSelector(selectErrorIcon)

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
      <div>{errorTitle ? errorTitle : t("error.generic-message")}</div>
      <FontAwesomeIcon icon={errorIcon ? errorIcon : faFrown} size="10x" />
      <span>{errorMessage}</span><br />
      {errorDetails &&
        <div css={detailsStyle}>
          <span>{t("error.details")}</span><br />
          <span>{errorDetails}</span>
        </div>
      }
    </div>
  );
}

export default Error
