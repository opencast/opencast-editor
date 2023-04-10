import React from 'react';
import Body from './main/Body';
import { GlobalStyle } from './cssStyles';
import { useSelector } from 'react-redux';
import { selectThemeState } from './redux/themeSlice';

import { css } from '@emotion/react'

function App() {
  const theme = useSelector(selectThemeState);

  const header = css({
    height: '48px',
    backgroundColor: '#333333',
  });

  const logo = css({
    height: '48px',
  })

  return (
    <div className="App" css={theme}>
      <GlobalStyle />
      <div css={header}>
        <img src="opencast-editor.svg" css={logo} alt="Opencast Editor" />
      </div>
      <Body />
    </div>
  );
}

export default App;
