import React from "react";

import { css } from "@emotion/react";
import {
  backOrContinueStyle,
} from "../cssStyles";

import { LuChevronLeft, LuMoveHorizontal } from "react-icons/lu";

import { useAppSelector } from "../redux/store";

import { PageButton } from "./Finish";

import { useTranslation } from "react-i18next";
import { ErrorBox } from "@opencast/appkit";
import { selectError, selectStatus } from "../redux/workflowPostSlice";
import { SaveButton } from "./Save";

/**
 * Will eventually display settings based on the selected workflow index
 */
const WorkflowConfiguration: React.FC = () => {

  const { t } = useTranslation();

  const postAndProcessWorkflowStatus = useAppSelector(selectStatus);
  const postAndProcessError = useAppSelector(selectError);

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
      <LuMoveHorizontal css={{ fontSize: 80 }} />
      Placeholder
      <div>{t("workflowConfig.satisfied-text")}</div>
      <div css={backOrContinueStyle}>
        <PageButton pageNumber={1} label={t("various.goBack-button")} Icon={LuChevronLeft} />
        <SaveButton
          isTransitionToEnd={true}
          text={t("workflowConfig.confirm-button")}
        />
      </div>
      {postAndProcessWorkflowStatus === "failed" &&
        <ErrorBox>
          <span css={{ whiteSpace: "pre-line" }}>
            {t("various.error-text") + "\n"}
            {postAndProcessError ?
              t("various.error-details-text", { errorMessage: postAndProcessError }) : undefined
            }
          </span>
        </ErrorBox>
      }
    </div>
  );
};

export default WorkflowConfiguration;
