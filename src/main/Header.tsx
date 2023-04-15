import React from 'react';

import { css } from '@emotion/react'

function Header() {
  const header = css({
    height: '48px',
    backgroundColor: '#333333',
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
