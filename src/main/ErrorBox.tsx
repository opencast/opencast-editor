import React from "react";

import { css } from '@emotion/react'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { httpRequestState } from '../types'
import { useSelector } from "react-redux";
import { selectTheme } from "../redux/themeSlice";

/**
 * A component that can be displayed on a page in case of an error
 */
 const ErrorBox : React.FC<{showBox: boolean, errorMessage: string, errorDetails: httpRequestState["error"]}>
  = ({showBox, errorMessage, errorDetails}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const errorCodeMessages = (status: number) => {
    switch (status) {
      case 423:
        return t("various.error-423")
      case 500:
        return t("various.error-500")
      default:
        return t("various.error-unknow-code", { code: status } )
    }
  }

  const logErrorDetailsToConsole = (errorDetails: any) => {
    if (errorDetails && typeof errorDetails === 'string') {
      return t("various.error-details-text", errorDetails)
    }
    if (errorDetails && typeof errorDetails !== 'string' && "text" in errorDetails && errorDetails.text) {
      return t("various.error-details-text", {errorMessage: errorDetails.text})
    }
  }

  const errorBoxStyle = (errorStatus: boolean) => {
    return (
      css({
        ...(!errorStatus) && {display: "none"},
        borderColor: `${theme.error}`,
        borderStyle: 'dashed',
        fontStyle: 'italic',
        padding: '10px',
      })
    );
  }

  return (
    <>
    {errorDetails && console.log(logErrorDetailsToConsole(errorDetails))}
    <div css={errorBoxStyle(showBox)} role="alert">
      <span css={{fontWeight: 'bold'}}>{t("various.error-header-text")}</span>
      <span>{errorMessage.trim() + " "}</span>
      <span>{(errorDetails && typeof errorDetails !== 'string' && "status" in errorDetails) ?
        errorCodeMessages(errorDetails.status) : ""}
      </span>
    </div>
    </>
  );
}

export default ErrorBox
