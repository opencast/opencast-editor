import React from "react";

import { css, SerializedStyles } from '@emotion/react'

import { IconType } from "react-icons";
import { LuScissors, LuFilm, LuFileText, LuCheckSquare } from "react-icons/lu";
import { LuImage } from "react-icons/lu";
import { ReactComponent as SubtitleIcon } from '../img/subtitle.svg';

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState, mainMenu } from '../redux/mainMenuSlice'
import { setPageNumber } from '../redux/finishSlice'

import { MainMenuStateNames } from '../types'
import { settings } from '../config'
import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'
import { selectVideoCount, setIsPlaying } from "../redux/videoSlice";

import { useTranslation } from 'react-i18next';
import { resetPostRequestState as metadataResetPostRequestState } from "../redux/metadataSlice";
import { resetPostRequestState } from "../redux/workflowPostSlice";
import { setIsDisplayEditView } from "../redux/subtitleSlice";

import { useTheme } from "../themes";

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC = () => {

  const { t } = useTranslation();
  const theme = useTheme();

  const videoCount = useSelector(selectVideoCount);

  const mainMenuStyle = css({
    borderRight: `${theme.menuBorder}`,
    minWidth: '120px',
    maxWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    overflowX: 'hidden',
    overflowY: 'auto',
    background: `${theme.menu_background}`,
    ...(flexGapReplacementStyle(30, false)),
  });

  return (
    <nav css={mainMenuStyle} role="navigation" aria-label={t("mainMenu.tooltip-aria")}>
      <MainMenuButton
        Icon={LuScissors}
        stateName={MainMenuStateNames.cutting}
        bottomText={t(MainMenuStateNames.cutting)}
        ariaLabelText={t(MainMenuStateNames.cutting)}
      />
      {settings.metadata.show && <MainMenuButton
        Icon={LuFileText}
        stateName={MainMenuStateNames.metadata}
        bottomText={t(MainMenuStateNames.metadata)}
        ariaLabelText={t(MainMenuStateNames.metadata)}
      />}
      {settings.trackSelection.show && videoCount > 1 && <MainMenuButton
        Icon={LuFilm}
        stateName={MainMenuStateNames.trackSelection}
        bottomText={t(MainMenuStateNames.trackSelection)}
        ariaLabelText={t(MainMenuStateNames.trackSelection)}
      />}
      {settings.subtitles.show && <MainMenuButton
        Icon={SubtitleIcon}
        stateName={MainMenuStateNames.subtitles}
        bottomText={t(MainMenuStateNames.subtitles)}
        ariaLabelText={t(MainMenuStateNames.subtitles)}
      />}
      {settings.thumbnail.show && <MainMenuButton
        Icon={LuImage}
        stateName={MainMenuStateNames.thumbnail}
        bottomText={t(MainMenuStateNames.thumbnail)}
        ariaLabelText={t(MainMenuStateNames.thumbnail)}
      />}
      <MainMenuButton
        Icon={LuCheckSquare}
        stateName={MainMenuStateNames.finish}
        bottomText={t(MainMenuStateNames.finish)}
        ariaLabelText={t(MainMenuStateNames.finish)}
      />
    </nav>
  );
};

interface mainMenuButtonInterface {
  Icon: IconType | React.FunctionComponent,
  stateName: mainMenu["value"],
  bottomText: string,
  ariaLabelText: string;
  customCSS?: SerializedStyles,
  iconCustomCSS?: SerializedStyles,
}

/**
 * A button to set the state of the app
 * @param param0
 */
export const MainMenuButton: React.FC<mainMenuButtonInterface> = ({
  Icon,
  stateName,
  bottomText,
  ariaLabelText,
  customCSS,
  iconCustomCSS,
}) => {

  const dispatch = useDispatch();
  const activeState = useSelector(selectMainMenuState)
  const theme = useTheme();

  const onMenuItemClicked = () => {
    dispatch(setState(stateName));
    // Reset multi-page content to their first page
    if (stateName === MainMenuStateNames.finish) {
      dispatch(setPageNumber(0))
    }
    if (stateName === MainMenuStateNames.subtitles) {
      dispatch(setIsDisplayEditView(false))
    }
    // Halt ongoing events
    dispatch(setIsPlaying(false))
    // Reset states
    dispatch(resetPostRequestState())
    dispatch(metadataResetPostRequestState())
  }

  const mainMenuButtonStyle = css({
    width: '100%',
    height: '100px',
    outline: `${theme.menuButton_outline}`,
    ...(activeState === stateName) && {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.inverted_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    '&:hover': {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.inverted_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    flexDirection: 'column',
  });

  return (
    <li css={[basicButtonStyle(theme), customCSS ? customCSS : mainMenuButtonStyle]}
      role="menuitem" tabIndex={0}
      aria-label={ariaLabelText}
      onClick={onMenuItemClicked}
      onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => { if (event.key === "Enter") {
        onMenuItemClicked()
      } }}
    >
      <Icon css={iconCustomCSS ? iconCustomCSS : {
        fontSize: 36,
        width: '36px',
        height: 'auto'
      }}/>
      {bottomText && <div>{bottomText}</div>}
    </li>
  );
};

export default MainMenu;
