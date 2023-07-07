import { useSelector } from "react-redux"
import { selectTheme, selectThemeState } from "../redux/themeSlice"

import { css } from '@emotion/react'
import { useTranslation } from "react-i18next";
import { MainMenuButton } from "./MainMenu";
import { FiSettings } from "react-icons/fi";
import { MainMenuStateNames } from "../types";

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
    height: '48px',
    marginLeft: '6px',
  })

  const settingsButtonCSS = css({
    display: 'flex',
    flexDirection: 'row',
    color: `#fff`,
    marginRight: '20px',
    outline: `${theme.menuButton_outline}`,
  })

  return (
    <div css={[headerStyle, headerStyleThemed]}>
      <img src="opencast-editor.svg" css={logo} alt="Opencast Editor" />
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
