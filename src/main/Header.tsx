import React from 'react';

import { useSelector } from "react-redux"
import { selectThemeState } from "../redux/themeSlice"
import { css } from '@emotion/react'

function Header() {
  const themeState = useSelector(selectThemeState);

  const header = css({
    height: '48px',
    backgroundColor: themeState.startsWith('high-contrast-') ? '#000' : '#333333',
  });

  const logo = css({
    height: '48px',
  })

  return (
    <div css={header}>
      <img src="opencast-editor.svg" css={logo} alt="Opencast Editor" />
    </div>
  );
}

export default Header;
