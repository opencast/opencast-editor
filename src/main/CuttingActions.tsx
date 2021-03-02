import React from "react";

import { basicButtonStyle } from '../cssStyles'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faCut,
  faStepBackward,
  faStepForward,
  faTrash,
  faTrashRestore,
  } from "@fortawesome/free-solid-svg-icons";

import { css } from '@emotion/react'

import { useDispatch, useSelector } from 'react-redux';
import {
  cut, markAsDeletedOrAlive, selectIsCurrentSegmentAlive, mergeLeft, mergeRight
} from '../redux/videoSlice'
import { ActionCreatorWithoutPayload } from "@reduxjs/toolkit";

import './../i18n/config';
import { useTranslation } from 'react-i18next';

/**
 * Defines the different actions a user can perform while in cutting mode
 */
const CuttingActions: React.FC<{}> = () => {

  const { t } = useTranslation();

  const cuttingStyle =  css({
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: '30px',
  })

  const blockStyle = css({
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '30px',
  })

  return (
    <div css={cuttingStyle}>
        <div css={blockStyle}>
          <CuttingActionsButton iconName={faCut} actionName= {t("cuttingActions-cut-button")} action={cut}
            tooltip={t('cuttingActions-cut-tooltip')}
            ariaLabelText={t('cuttingActions-cut-tooltip-aria')}
          />
          <MarkAsDeletedButton />
          <CuttingActionsButton iconName={faStepBackward} actionName={t("cuttingActions-mergeLeft-button")} action={mergeLeft}
            tooltip={t('cuttingActions-mergeLeft-tooltip')}
            ariaLabelText={t('cuttingActions-mergeLeft-tooltip-aria')}
          />
          <CuttingActionsButton iconName={faStepForward} actionName={t("cuttingActions-mergeRight-button")} action={mergeRight}
            tooltip={t('cuttingActions-mergeRight-tooltip')}
            ariaLabelText={t('cuttingActions-mergeRight-tooltip-aria')}
          />
        </div>
        <div css={blockStyle}>
          {/* <CuttingActionsButton iconName={faQuestion} actionName="Reset changes" action={null}
            tooltip="Not implemented"
            ariaLabelText="Reset changes. Not implemented"
          />
          <CuttingActionsButton iconName={faQuestion} actionName="Undo" action={null}
            tooltip="Not implemented"
            ariaLabelText="Undo. Not implemented"
          /> */}
        </div>
    </div>
  );
};

/**
 * CSS for cutting buttons
 */
const cuttingActionButtonStyle = {
  padding: '16px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
};

interface cuttingActionsButtonInterface {
  iconName: IconDefinition,
  actionName: string,
  action: ActionCreatorWithoutPayload<string>,  // Redux reducer action
  tooltip: string,
  ariaLabelText: string,
}

/**
 * A button representing a single action a user can take while cutting
 * @param param0
 */
const CuttingActionsButton: React.FC<cuttingActionsButtonInterface> = ({iconName, actionName, action, tooltip, ariaLabelText}) => {

  const dispatch = useDispatch();

  const dispatchAction = () => {
    if (action) {
      dispatch(action())
    }
  }

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title={tooltip}
      role="button" tabIndex={0} aria-label={ariaLabelText}
      onClick={ dispatchAction }
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
        dispatchAction()
      }}}
      >
      <FontAwesomeIcon icon={iconName} size="1x" />
      <span>{actionName}</span>
    </div>
  );
};

/**
 * Button that changes its function based on context
 */
const MarkAsDeletedButton : React.FC<{}> = () => {

  const dispatch = useDispatch();
  const isCurrentSegmentAlive = useSelector(selectIsCurrentSegmentAlive);
  const { t } = useTranslation();

  return (
    <div css={[basicButtonStyle, cuttingActionButtonStyle]}
      title= {t('cuttingActions-delete-restore-tooltip')}
      role="button" tabIndex={0}
      aria-label={t('cuttingActions-delete-restore-tooltip-aria')}
      onClick={() => dispatch(markAsDeletedOrAlive())}>
      <FontAwesomeIcon icon={isCurrentSegmentAlive ? faTrash : faTrashRestore} size="1x" />
      <div>{isCurrentSegmentAlive ? t('cuttingActions-delete-button') : t("cuttingActions-restore-button")}</div>
    </div>
  );
}

export default CuttingActions;
