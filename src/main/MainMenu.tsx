import React from "react";

import { css } from '@emotion/react'

import { IconType } from "react-icons";
import { FiScissors, FiFilm, FiFileText, FiCheckSquare, FiSettings} from "react-icons/fi";
import { FaPhotoVideo } from "react-icons/fa";
import { MdOutlineSubtitles } from "react-icons/md";

import { useDispatch, useSelector } from 'react-redux'
import { setState, selectMainMenuState, mainMenu } from '../redux/mainMenuSlice'
import { setPageNumber } from '../redux/finishSlice'

import { MainMenuStateNames } from '../types'
import { settings } from '../config'
import { basicButtonStyle, flexGapReplacementStyle } from '../cssStyles'
import { setIsPlaying } from "../redux/videoSlice";

import { useTranslation } from 'react-i18next';
import { resetPostRequestState as metadataResetPostRequestState } from "../redux/metadataSlice";
import { resetPostRequestState } from "../redux/workflowPostSlice";
import { setIsDisplayEditView } from "../redux/subtitleSlice";

import { selectTheme } from "../redux/themeSlice";

/**
 * A container for selecting the functionality shown in the main part of the app
 */
const MainMenu: React.FC<{}> = () => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const mainMenuStyle = css({
    borderRight: `${theme.menuBorder}`,
    minWidth: '120px',
    maxWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    overflow: 'vertical',
    background: `${theme.menu_background}`,
    ...(flexGapReplacementStyle(30, false)),
  });

  return (
    <nav css={mainMenuStyle} role="navigation" aria-label={t("mainMenu.tooltip-aria")}>
      <MainMenuButton
        Icon={FiScissors}
        stateName={MainMenuStateNames.cutting}
        bottomText={t(MainMenuStateNames.cutting)}
        ariaLabelText={t(MainMenuStateNames.cutting)}
      />
      {settings.metadata.show && <MainMenuButton
        Icon={FiFileText}
        stateName={MainMenuStateNames.metadata}
        bottomText={t(MainMenuStateNames.metadata)}
        ariaLabelText={t(MainMenuStateNames.metadata)}
      />}
      {settings.trackSelection.show && <MainMenuButton
        Icon={FiFilm}
        stateName={MainMenuStateNames.trackSelection}
        bottomText={t(MainMenuStateNames.trackSelection)}
        ariaLabelText={t(MainMenuStateNames.trackSelection)}
      />}
      {settings.subtitles.show && <MainMenuButton
        Icon={MdOutlineSubtitles}
        stateName={MainMenuStateNames.subtitles}
        bottomText={t(MainMenuStateNames.subtitles)}
        ariaLabelText={t(MainMenuStateNames.subtitles)}
      />}
      {settings.thumbnail.show && <MainMenuButton
        Icon={FaPhotoVideo}
        stateName={MainMenuStateNames.thumbnail}
        bottomText={t(MainMenuStateNames.thumbnail)}
        ariaLabelText={t(MainMenuStateNames.thumbnail)}
      />}
      <MainMenuButton
        Icon={FiCheckSquare}
        stateName={MainMenuStateNames.finish}
        bottomText={t(MainMenuStateNames.finish)}
        ariaLabelText={t(MainMenuStateNames.finish)}
      />
      {/* A space for buttons that would normally go in a header or footer */}
      <div css={{flexGrow: 99, display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
        <MainMenuButton
          Icon={FiSettings}
          stateName={MainMenuStateNames.keyboardControls}
          bottomText={""}
          ariaLabelText={t("keyboardControls.header")}
          miniButton={true}
        />
      </div>
    </nav>
  );
};

interface mainMenuButtonInterface {
  Icon: IconType, // Unfortunately, icons from different packages don't share the same IconDefinition type. Works anyway.
  stateName: mainMenu["value"],
  bottomText: string,
  ariaLabelText: string;
  miniButton?: boolean,
}

/**
 * A button to set the state of the app
 * @param param0
 */
const MainMenuButton: React.FC<mainMenuButtonInterface> = ({Icon, stateName, bottomText, ariaLabelText, miniButton = false}) => {

  const dispatch = useDispatch();
  const activeState = useSelector(selectMainMenuState)
  const theme = useSelector(selectTheme);

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

  const buttonStyle = () => {
    if (!miniButton) {
      return mainMenuButtonStyle
    } else {
      return miniMenuButtonStyle
    }
  }

  const mainMenuButtonStyle = css({
    width: '100%',
    height: '100px',
    outline: `${theme.menuButton_outline}`,
    ...(activeState === stateName) && {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.selected_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    '&:hover': {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.selected_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    flexDirection: 'column',
  });

  const miniMenuButtonStyle = css({
    width: '75px',
    height: '67px',
    outline: `${theme.menuButton_outline}`,
    ...(activeState === stateName) && {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.selected_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    '&:hover': {
      backgroundColor: `${theme.button_color}`,
      color: `${theme.selected_text}`,
      boxShadow: `${theme.boxShadow}`,
    },
    flexDirection: 'column',
  });

  return (
    <li css={[basicButtonStyle(theme), buttonStyle()]}
      role="menuitem" tabIndex={0}
      aria-label={ariaLabelText}
      onClick={ onMenuItemClicked }
      onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => { if (event.key === "Enter") {
        onMenuItemClicked()
      }}}
      >
      <Icon css={{
        fontSize: miniButton ? 24 : 36
        }}/>
      {bottomText && <div>{bottomText}</div>}
    </li>
  );
};

export default MainMenu;
