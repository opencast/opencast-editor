import React from 'react';
import Body from './main/Body';
import Header from './main/Header';
import { GlobalStyle } from './cssStyles';
import { useSelector } from 'react-redux';
import { selectThemeState } from './redux/themeSlice';

function App() {
  const theme = useSelector(selectThemeState);

  return (
    <div className="App" css={theme}>
      <GlobalStyle />
      <Header />
      <Body />
    </div>
  );
}

export default App;
