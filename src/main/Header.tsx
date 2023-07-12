import { useSelector } from "react-redux"
import { selectTheme, selectThemeState } from "../redux/themeSlice"

import { css } from '@emotion/react'
import { useTranslation } from "react-i18next";
import { MainMenuButton } from "./MainMenu";
import { FiSettings } from "react-icons/fi";
import { MainMenuStateNames } from "../types";

import { ReactComponent as Logo } from '../img/opencast-editor.svg';

function Header() {
  const theme = useSelector(selectTheme)
  const themeState = useSelector(selectThemeState);
  const { t } = useTranslation()

  const headerStyle = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${theme.header_bg}`,
  })

  const headerStyleThemed = themeState.startsWith('high-contrast-')
    ? css({
      height: '58px',
      borderBottom: '2px solid white'
    })
    : css({
      height: '60px',
    })

  const logo = css({
    marginLeft: '6px',

    // Unset a bunch of CSS to keep the logo clean
    outline: 'unset',
    "&:hover": {
      backgroundColor: `unset`,
    },
    "&:focus": {
      backgroundColor: `unset`,
    },
  })

  const settingsButtonCSS = css({
    display: 'flex',
    flexDirection: 'row',
    color: `#fff`,
    marginRight: '20px',
    padding: '10px',
    outline: `${theme.menuButton_outline}`,
  })

  return (
    <div css={[headerStyle, headerStyleThemed]}>
      <MainMenuButton
        Icon={Logo}
        stateName={MainMenuStateNames.cutting}
        bottomText={""}
        ariaLabelText={t("mainMenu.cutting-button")}
        customCSS={logo}
        iconCustomCSS={css({width: 'auto', height: '60px'})}
      />
      <MainMenuButton
        Icon={FiSettings}
        stateName={MainMenuStateNames.keyboardControls}
        bottomText={t("settings.settings")}
        ariaLabelText={t("settings.settings")}
        customCSS={settingsButtonCSS}
        iconCustomCSS={css({fontSize: 24})}
      />
    </div>
  );
}

export default Header;
