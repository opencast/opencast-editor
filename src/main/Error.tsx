import React from "react";

import { css } from "@emotion/react";

import { LuFrown } from "react-icons/lu";

import { useAppSelector } from "../redux/store";
import { selectErrorDetails, selectErrorIcon, selectErrorMessage, selectErrorTitle } from "../redux/errorSlice";

import { useTranslation } from "react-i18next";

/**
 * This page is to be displayed when the application has run into a critical error
 * from which it cannot recover.
 */
const Error: React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const errorTitle = useAppSelector(selectErrorTitle);
  const errorMessage = useAppSelector(selectErrorMessage);
  const errorDetails = useAppSelector(selectErrorDetails);
  const ErrorIcon = useAppSelector(selectErrorIcon);

  const detailsStyle = css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  const theEndStyle = css({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  });

  return (
    <div css={theEndStyle} >
      <div>{errorTitle ? errorTitle : t("error.generic-message")}</div>
      {ErrorIcon ? <ErrorIcon css={{ fontSize: 80 }} /> : <LuFrown css={{ fontSize: 80 }} />}
      <span>{errorMessage}</span><br />
      {errorDetails &&
        <div css={detailsStyle}>
          <span>{t("error.details")}</span><br />
          <span>{errorDetails}</span>
        </div>
      }
    </div>
  );
};

export default Error;
