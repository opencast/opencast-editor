import React from 'react';
import Body from './main/Body';
import { GlobalStyle } from './cssStyles';
import { RootStateOrAny, useSelector } from 'react-redux';
import { getTheme } from './main/ThemeSwitcher';

function App() {
  const mode = useSelector((state: RootStateOrAny) => state.theme);
  const theme = getTheme(mode);
  return (
    <div className="App" css={theme}>
      <GlobalStyle />
      <Body />
    </div>
  );
}

export default App;
