import React from "react";

import { css } from "@emotion/react";
import { basicButtonStyle, backOrContinueStyle, navigationButtonStyle, flexGapReplacementStyle } from "../cssStyles";

import { LuChevronLeft, LuXCircle } from "react-icons/lu";

import { useAppDispatch, useAppSelector } from "../redux/store";
import { selectFinishState } from "../redux/finishSlice";
import { setEnd } from "../redux/endSlice";

import { PageButton } from "./Finish";

import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";

/**
 * Shown if the user wishes to abort.
 * Informs the user about aborting and displays abort button.
 */
const Discard: React.FC = () => {

  const { t } = useTranslation();

  const finishState = useAppSelector(selectFinishState);

  const cancelStyle = css({
    display: finishState !== "Discard changes" ? "none" : "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    ...(flexGapReplacementStyle(30, false)),
  });

  return (
    <div css={cancelStyle}>
      <h1>{t("discard.headline-text")}</h1>
      <span>
        {t("discard.info-text")}
      </span>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={0} label={t("various.goBack-button")} Icon={LuChevronLeft} />
        <DiscardButton />
      </div>
    </div>
  );
};

/**
 * Button that sets the app into an aborted state
 */
const DiscardButton: React.FC = () => {

  const { t } = useTranslation();

  // Initialize redux variables
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const discard = () => {
    dispatch(setEnd({ hasEnded: true, value: "discarded" }));
  };

  return (
    <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
      role="button" tabIndex={0}
      onClick={discard}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === " " || event.key === "Enter") {
          discard();
        }
      }}>
      <LuXCircle />
      <span>{t("discard.confirm-button")}</span>
    </div>
  );
};

export default Discard;
