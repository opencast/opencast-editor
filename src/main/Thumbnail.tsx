import { css } from "@emotion/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { basicButtonStyle, titleStyle, titleStyleBold } from "../cssStyles";
import { selectTheme, Theme } from "../redux/themeSlice";
import { removeThumbnail, selectThumbnails, selectTracks, setThumbnail, setThumbnails } from "../redux/videoSlice";
import { Track } from "../types";
import Timeline from "./Timeline";
import { VideoControls, VideoPlayer } from "./Video";


/**
 * User interface for handling thumbnails
 */
const Thumbnail : React.FC<{}> = () => {

  const thumbnailStyle = css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  })

  const everythingElseStyle = css({
    width: '100%',
  })

  return (
    <div css={thumbnailStyle}>
      <div css={[titleStyle, titleStyleBold]}>Thumbnail Editor</div>
      <div css={everythingElseStyle}>
        <ThumbnailTable />
        <VideoControls />
        <Timeline />
      </div>
    </div>
  );
}

/**
 * A table for each video+thumbnail pair
 */
const ThumbnailTable : React.FC<{}> = () => {

  const dispatch = useDispatch()

  const tracks = useSelector(selectTracks)

  const flavorSubtype = "player+preview"
  // Generate Refs
  const generateRefs = React.useRef<any>([]);
  // Upload Refs
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Generate image and save in redux
  const generate = (track: Track, index: number) => {
    const uri = generateRefs.current[index].captureVideo()
    dispatch(setThumbnail({videoId: track.id, flavor: {type: track.flavor.type, subtype: flavorSubtype}, uri: uri}))
  }

  const thumbnailTableStyle = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  })

  return(
    <div css={thumbnailTableStyle}>
      {tracks.map( (track: Track, index: number) => (
        <ThumbnailTableRow track={track} index={index} generateRefs={generateRefs} inputRefs={inputRefs} generate={generate}/>
      ))}
      <AffectAllRow tracks={tracks} generate={generate}/>
    </div>
  )
}

/**
 * A table entry for a single video+thumbnail pair
 */
const ThumbnailTableRow: React.FC<{
  track: Track,
  index: number,
  generateRefs: any,
  inputRefs: any,
  generate: any,
}> = ({track, index, generateRefs, inputRefs, generate}) => {

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

  return (
    <div key={index}>
      <div css={rowTitleStyle}>
        {track.flavor.type}
      </div>
      <div css={thumbnailRowStyle} key={index}>

        <div css={cellVideo}>
          <VideoPlayer dataKey={index} url={track.uri} isPrimary={index === 0 ? true : false} ref={(el) => (generateRefs.current[index] = el)} />
        </div>

        <ThumbnailDisplayer track={track} />

        <ThumbnailButtons track={track} index={index} generate={generate} inputRefs={inputRefs}/>

      </div>
    </div>
  )
}

/**
 * Displays thumbnail associated with the given track
 * or a placeholder
 */
const ThumbnailDisplayer : React.FC<{track: Track}> = ({track}) => {

  const thumbnails = useSelector(selectThumbnails)

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

  return (
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
  )
}

/**
 * Buttons and actions related to thumbnails for a given track
 */
const ThumbnailButtons : React.FC<{
  track: Track,
  index: number,
  generate: any,
  inputRefs: any,
}> = ({track, index, generate, inputRefs}) => {

  const theme = useSelector(selectTheme);
  const flavorSubtype = "player+preview"

  const dispatch = useDispatch()

  const tracks = useSelector(selectTracks)
  const thumbnails = useSelector(selectThumbnails)

  // Trigger file handler for upload input element
  const upload = (index: number) => {
    // 👇️ open file input box on click of other element
    const ref = inputRefs.current[index]
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

  const setForOtherThumbnails = (uri: string | undefined) => {
    if (uri === undefined) {
      return
    }
    const changedThumbnails = []
    for (const track of tracks) {
      changedThumbnails.push({videoId: track.id, flavor: {type: track.flavor.type, subtype: flavorSubtype}, uri: uri})
    }
    dispatch(setThumbnails(changedThumbnails))
  }

  const discardThumbnail = (id: string) => {
    dispatch(removeThumbnail(id))
  }

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

  return (
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
            inputRefs.current[index] = el;
          }}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event, track)}
        />
      <div css={[basicButtonStyle, buttonsStyle(theme)]} onClick={() => {
          setForOtherThumbnails(thumbnails.find(t => t.videoId === track.id)?.uri)
        }}>Use for other thumbnails</div>
      <div css={[basicButtonStyle, buttonsStyle(theme)]} onClick={() => {
          discardThumbnail(track.id)
        }}>Discard</div>
    </div>
  )
}

/**
 * Bottom row of the table
 * For e.g. buttons that affect all rows in the table
 */
const AffectAllRow : React.FC<{
  tracks: Track[]
  generate: any
}> = ({generate, tracks}) => {

  const theme = useSelector(selectTheme);

  const generateAll = () => {
    for (let i = 0; i < tracks.length; i++) {
      generate(tracks[i], i)
    }
  }

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
      <div css={[basicButtonStyle, buttonStyle]} onClick={() => {
        generateAll()
      }}>Generate All</div>
    </div>
  )
}

export default Thumbnail;
