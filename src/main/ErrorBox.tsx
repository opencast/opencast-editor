import React from "react";

import { css } from '@emotion/react'

import './../i18n/config';
import { useTranslation } from 'react-i18next';
import { httpRequestState } from '../types'

/**
 * A component that can be displayed on a page in case of an error
 */
 const ErrorBox : React.FC<{showBox: boolean, errorMessage: string, errorDetails: httpRequestState["error"]}>
  = ({showBox, errorMessage, errorDetails}) => {

  const { t } = useTranslation();

  const errorCodeMessages = (status: number) => {
    switch (status) {
      case 423:
        return "Code 423. There is a workflow running in Opencast. You have to wait until it finishes before you can perform that action."
      case 500:
        return "Code 500. Something went seriously wrong in Opencast."
      default:
        return "Unknown error code " + status + "."
    }
  }

  const centerChildstyle = () => css({
    alignSelf: 'center',
  })

  const errorBoxStyle = (errorStatus: boolean) => {
    return (
      css({
        display: errorStatus ? "flex" : "none",
        flexDirection: 'column',
        borderColor: 'red',
        borderStyle: 'dashed',
        fontWeight: 'bold',
        padding: '10px',
      })
    );
  }

  return (
    <div css={errorBoxStyle(showBox)} role="alert">
      <span css={centerChildstyle}>{"An error occured!"}</span>
      <span>{errorMessage}</span>
      <span css={centerChildstyle}>{errorDetails ? t("various.error-details-text") : t("various.error-noDetails-text")}</span>
      <span>{(errorDetails && typeof errorDetails === 'string') ? errorDetails : ""}</span>
      <span>{(errorDetails && typeof errorDetails !== 'string' && "status" in errorDetails) ? errorCodeMessages(errorDetails.status) : ""}</span>
      <span>{(errorDetails && typeof errorDetails !== 'string' && "status" in errorDetails) ? errorDetails.text : ""}</span>
  </div>
  );
}

export default ErrorBox
