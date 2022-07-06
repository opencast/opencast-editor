import React from 'react';
import Body from './main/Body';
import { GlobalStyle } from './cssStyles';
import { useSelector } from 'react-redux';
import { selectThemeState } from './redux/themeSlice';

function App() {
  const theme = useSelector(selectThemeState);
  
  return (
    <div className="App" css={theme}>
      <GlobalStyle />
      <Body />
    </div>
  );
}

export default App;
