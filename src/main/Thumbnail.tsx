import { css } from "@emotion/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { basicButtonStyle } from "../cssStyles";
import { selectTheme, Theme } from "../redux/themeSlice";
import { selectThumbnails, selectTracks, setThumbnail } from "../redux/videoSlice";
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

  const dispatch = useDispatch()

  const tracks = useSelector(selectTracks)
  const theme = useSelector(selectTheme);
  const thumbnails = useSelector(selectThumbnails)

  const flavorSubtype = "player+preview"
  // Generate Refs
  const rootRef = React.useRef<any>([]);
  // Upload Refs
  const inputRef = React.useRef<(HTMLInputElement | null)[]>([]);

  // Generate image and save in redux
  const generate = (track: Track, index: number) => {
    const uri = rootRef.current[index].captureVideo()
    dispatch(setThumbnail({videoId: track.id, flavor: {type: track.flavor.type, subtype: flavorSubtype}, uri: uri}))
  }

  // Trigger file handler for upload input element
  const upload = (index: number) => {
    // 👇️ open file input box on click of other element
    const ref =inputRef.current[index]
    if (ref !== null) {
      ref.click();
    }
  };

  // Save uploaded file in redux
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, track: Track) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    // Check if image
    if (fileObj.type.split('/')[0] !== 'image') {
      return
    }

    var reader  = new FileReader();
    reader.onload = function(e)  {
        // the result image data
        if (e.target && e.target.result) {
          const uri = e.target.result.toString();
          dispatch(setThumbnail({videoId: track.id, flavor: {type: track.flavor.type, subtype: flavorSubtype}, uri: uri}))
        }
     }
     reader.readAsDataURL(fileObj);
  };

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
        <div key={index}>
          <div css={rowTitleStyle}>
            {track.flavor.type}
          </div>
          <div css={thumbnailRowStyle} key={index}>

            <div css={cellVideo}>
              <VideoPlayer dataKey={index} url={track.uri} isPrimary={index === 0 ? true : false} ref={(el) => (rootRef.current[index] = el)} />
            </div>

            <div css={cellThumbnail}>
              {thumbnails.find(t => t.videoId === track.id)?.uri !== undefined ?
                // Thumbnail image
                <img src={thumbnails.find(t => t.videoId === track.id)?.uri}
                  alt={"Thumbnail for: " + thumbnails.find(t => t.videoId === track.id)?.flavor.type}
                  css={imageStyle}
                />
                :
                // Placeholder
                  <div css={{
                    display: 'flex',
                    backgroundColor: 'grey',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    aspectRatio: '16/9',
                  }}>
                    <span>No Thumbnail set</span>
                  </div>
              }

            </div>

            <div css={cellButtons}>
              <div css={[basicButtonStyle, buttonsStyle(theme)]} onClick={() => {
                  generate(track, index)
                }}>Generate</div>
              <div css={[basicButtonStyle, buttonsStyle(theme)]} onClick={() => {
                  upload(index)
                }}>Upload</div>
                <input
                  style={{display: 'none'}}
                  ref={(el) => {
                    inputRef.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleFileChange(event, track)}
                />
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
