import React from 'react';

import { useSelector } from "react-redux"
import { selectThemeState } from "../redux/themeSlice"
import { css } from '@emotion/react'

function Header() {
  const themeState = useSelector(selectThemeState);

  const header = themeState.startsWith('high-contrast-')
  ? css({
    height: '46px',
    backgroundColor: '#000',
    borderBottom: '2px solid white'
  })
  : css({
    height: '48px',
    backgroundColor: '#333333',
  })

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
