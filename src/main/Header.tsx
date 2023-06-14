import { useSelector } from "react-redux"
import { selectThemeState } from "../redux/themeSlice"
import { css } from '@emotion/react'

function Header() {
  const themeState = useSelector(selectThemeState);

  const headerStyle = css({
    display: 'flex',
    alignItems: 'center',
  })

  const headerStyleThemed = themeState.startsWith('high-contrast-')
    ? css({
      height: '58px',
      backgroundColor: '#000',
      borderBottom: '2px solid white'
    })
    : css({

      height: '60px',
      backgroundColor: '#4b5563',
    })

  const logo = css({
    height: '48px',
    marginLeft: '6px',
  })

  return (
    <div css={[headerStyle, headerStyleThemed]}>
      <img src="opencast-editor.svg" css={logo} alt="Opencast Editor" />
    </div>
  );
}

export default Header;
