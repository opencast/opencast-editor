import React from "react";

import { css } from "@emotion/react";
import {
  backOrContinueStyle,
  errorBoxStyle,
} from "../cssStyles";
import { LuChevronLeft, LuDatabase, LuMoreHorizontal } from "react-icons/lu";
import { useAppSelector } from "../redux/store";
import { PageButton } from "./Finish";
import { useTranslation } from "react-i18next";
import { useTheme } from "../themes";
import { selectError, selectStatus } from "../redux/workflowPostSlice";
import { SaveButton } from "./Save";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration: React.FC = () => {

  const { t } = useTranslation();

  const postAndProcessWorkflowStatus = useAppSelector(selectStatus);
  const postAndProcessError = useAppSelector(selectError);
  const theme = useTheme();

  const workflowConfigurationStyle = css({
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "20px",
    gap: "30px",
  });

  return (
    <div css={workflowConfigurationStyle}>
      <h2>{t("workflowConfig.headline-text")}</h2>
      <LuMoreHorizontal css={{ fontSize: 80 }} />
      Placeholder
      <div>{t("workflowConfig.satisfied-text")}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label={t("various.goBack-button")} Icon={LuChevronLeft} />
        <SaveButton
          basicIcon={LuDatabase}
          isTransitionToEnd={true}
          text={t("workflowConfig.confirm-button")}
        />
      </div>
      <div css={errorBoxStyle(postAndProcessWorkflowStatus === "failed", theme)} role="alert">
        <span>{t("various.error-text")}</span><br />
        {postAndProcessError ? t("various.error-details-text",
          { errorMessage: postAndProcessError }) :
          t("various.error-text")}<br />
      </div>
    </div>
  );
};

export default WorkflowConfiguration;
