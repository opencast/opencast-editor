import { css } from "@emotion/react";
import React from "react";
import { useSelector } from "react-redux";
import { basicButtonStyle } from "../cssStyles";
import { selectTheme, Theme } from "../redux/themeSlice";
import { selectTracks } from "../redux/videoSlice";
import { Track } from "../types";
import Timeline from "./Timeline";
import { VideoControls, VideoPlayer } from "./Video";


/**
 * Displays a menu for selecting what should be done with the current changes
 */
const Thumbnail : React.FC<{}> = () => {

  const thumbnailStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  })

  const titleStyle = css({
    display: 'inline-block',
    padding: '15px',
    overflow: 'hidden',
    whiteSpace: "nowrap",
    textOverflow: 'ellipsis',
    maxWidth: '500px',
    justifySelf: 'center'
  })

  const titleStyleBold = css({
    fontWeight: 'bold',
    fontSize: '24px',
    verticalAlign: '-2.5px',
  })

  const videoContainerStyle = css({
    width: '100%',
  })

  return (
    <div css={thumbnailStyle}>
      <div css={[titleStyle, titleStyleBold]}>Thumbnail Editor</div>
      <div css={videoContainerStyle}>
        <ThumbnailTable />
        <GenerateAllRow />
        <VideoControls />
        <Timeline></Timeline>
      </div>
    </div>
  );
}

const ThumbnailTable : React.FC<{}> = () => {

  const tracks = useSelector(selectTracks)
  const theme = useSelector(selectTheme);

  const thumbnailTableStyle = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  })

  const rowTitleStyle = css({
    textAlign: 'left',
    textTransform: 'capitalize',
    fontSize: 'larger',
    fontWeight: 'bold',
  })

  const thumbnailRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '200px',
    justifyContent: 'center',
  })

  const cellVideo = css({
    flex: 8,
    width: '100%',
    height: '100%',
  })

  const cellThumbnail = css({
    display: 'flex',
    flex: 8,
    justifyContent: 'center',
    alignItems: 'center',
  })

  const imageStyle = css({
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: '100px'
  })

  const cellButtons = css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    flex: 4,
    gap: '20px'
  })

  const buttonsStyle = (theme: Theme) => css({
    maxWidth: '75%',
    maxHeight: '75%',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
    justifySelf: 'center',
    alignSelf: 'center',
    padding: '20px'
  })

  return(
    <div css={thumbnailTableStyle}>
      {tracks.map( (track: Track, index: number) => (
        <div>
          <div css={rowTitleStyle}>{track.flavor.type}</div>
          <div css={thumbnailRowStyle} key={index}>
            <div css={cellVideo}>
              <VideoPlayer dataKey={index} url={track.uri} isPrimary={index === 0 ? true : false}/>
            </div>
            <div css={cellThumbnail}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a1/RedBananasMetepec.JPG"
                alt="Banana"
                css={imageStyle}></img>
            </div>
            <div css={cellButtons}>
              <div css={[basicButtonStyle, buttonsStyle(theme)]}>Generate</div>
              <div css={[basicButtonStyle, buttonsStyle(theme)]}>Upload</div>
              <div css={[basicButtonStyle, buttonsStyle(theme)]}>Use for other thumbnails</div>
              <div css={[basicButtonStyle, buttonsStyle(theme)]}>Discard</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const GenerateAllRow : React.FC<{}> = () => {

  const theme = useSelector(selectTheme);

  const rowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '50px',
    padding: '20px',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: `${theme.menuBorder}`,
  })

  const buttonStyle = css({
    height: '100%',
    minWidth: '200px',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  })

  return (
    <div css={rowStyle}>
      <div>Some explanatory text or something</div>
      <div css={[basicButtonStyle, buttonStyle]}>Generate All</div>
    </div>
  )
}

export default Thumbnail;
