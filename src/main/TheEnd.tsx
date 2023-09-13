import React from "react";

import { css } from '@emotion/react'

import { LuCheckCircle, LuXCircle} from "react-icons/lu";

import { useSelector } from 'react-redux';
import { selectEndState } from '../redux/endSlice'
import { basicButtonStyle, flexGapReplacementStyle, navigationButtonStyle } from "../cssStyles";

import { useTranslation } from 'react-i18next';
import { useTheme } from "../themes";
import { ThemedTooltip } from "./Tooltip";

/**
 * This page is to be displayed when the user is "done" with the editor
 * and should not be able to perfom any actions anymore
 */
const TheEnd : React.FC = () => {

  const { t } = useTranslation();

  // Init redux variables
  const endState = useSelector(selectEndState)

  const text = () => {
    if (endState === 'discarded') {
      return t("theEnd.discarded-text")
    } else if (endState === 'success') {
      return t("theEnd.info-text")
    }
  }

  const theEndStyle = css({
    width: '100%',
    height: 'calc(100% - 64px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...(flexGapReplacementStyle(20, false)),
  })

  return (
    <div css={theEndStyle}>
      {endState === 'discarded' ? <LuXCircle css={{fontSize: 80}}/> : <LuCheckCircle css={{fontSize: 80}}/> }
      <div>{text()}</div>
      {(endState === 'discarded') && <StartOverButton />}
    </div>
  );
}


const StartOverButton: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <ThemedTooltip title={t("theEnd.startOver-tooltip")}>
      <div css={[basicButtonStyle(theme), navigationButtonStyle(theme)]}
        role="button" tabIndex={0}
        onClick={reloadPage}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => { if (event.key === " " || event.key === "Enter") {
          reloadPage()
        } }}>
        <span>{t("theEnd.startOver-button")}</span>
      </div>
    </ThemedTooltip>
  );
}

export default TheEnd
