import { css } from "@emotion/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { basicButtonStyle, titleStyle, titleStyleBold } from "../cssStyles";
import { selectTheme, Theme } from "../redux/themeSlice";
import { selectOriginalThumbnails, selectTracks, setThumbnail, setThumbnails } from "../redux/videoSlice";
import { Track } from "../types";
import Timeline from "./Timeline";
import { VideoControls, VideoPlayers } from "./Video";


/**
 * User interface for handling thumbnails
 */
const Thumbnail : React.FC<{}> = () => {

  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Generate Refs
  const generateRefs = React.useRef<any>([]);

  // Generate image and save in redux
  const generate = (track: Track, index: number) => {
    const uri = generateRefs.current[index].captureVideo()
    dispatch(setThumbnail({id: track.id, uri: uri}))
  }

  const thumbnailStyle = css({
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  })

  return (
    <div css={thumbnailStyle}>
      <div css={[titleStyle, titleStyleBold]}>{t('thumbnail.title')}</div>
      <VideoPlayers refs={generateRefs} widthInPercent={50}/>
      <VideoControls />
      <Timeline timelineHeight={125}/>
      <ThumbnailTable generate={generate}/>
    </div>
  );
}

/**
 * A table for each video+thumbnail pair
 */
const ThumbnailTable : React.FC<{generate: any}> = ({generate}) => {

  const tracks = useSelector(selectTracks)

  // Upload Refs
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const thumbnailTableStyle = css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  })

  return(
    <div css={thumbnailTableStyle}>
      <AffectAllRow tracks={tracks} generate={generate}/>
      {tracks.map( (track: Track, index: number) => (
        <ThumbnailTableRow key={index} track={track} index={index} inputRefs={inputRefs} generate={generate}/>
      ))}
    </div>
  )
}

/**
 * A table entry for a single video+thumbnail pair
 */
const ThumbnailTableRow: React.FC<{
  track: Track,
  index: number,
  inputRefs: any,
  generate: any,
}> = ({track, index, inputRefs, generate}) => {

  const rowStyle = css({
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid grey',
    backgroundColor: 'lightgrey',
    height: '240px',
    padding: '6px',
  })

  const rowTitleStyle = css({
    textAlign: 'left',
    textTransform: 'capitalize',
    fontSize: 'larger',
    fontWeight: 'bold',
    color: 'black',   // Override dark mode color invert
  })

  const thumbnailRowStyle = css({
    display: 'flex',
    flexDirection: 'row',
    height: '200px',
    justifyContent: 'center',
    gap: '20px',
  })

  return (
    <div key={index} css={rowStyle}>
      <div css={rowTitleStyle}>
        {track.flavor.type}
      </div>
      <div css={thumbnailRowStyle} key={index}>
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

  const { t } = useTranslation()

  const cellThumbnail = css({
    display: 'flex',
  })

  const imageStyle = css({
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: '100px',
  })

  const placeholderStyle = css({
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: '100px',
    display: 'flex',
    backgroundColor: 'grey',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: '16/9',
  })

  return (
    <div css={cellThumbnail}>
      {(track.thumbnailUri !== null && track.thumbnailUri !== undefined) ?
        // Thumbnail image
        <img src={track.thumbnailUri}
          alt={t('thumbnail.previewImageAlt') + ": " + track.flavor.type}
          css={imageStyle}
        />
        :
        // Placeholder
        <div css={placeholderStyle}>
          <span>{t('thumbnail.noThumbnailAvailable')}</span>
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
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const tracks = useSelector(selectTracks)
  const originalThumbnails = useSelector(selectOriginalThumbnails)

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
          dispatch(setThumbnail({id: track.id, uri: uri}))
        }
      }
      reader.readAsDataURL(fileObj);
  };

  const setForOtherThumbnails = (uri: string | undefined) => {
    if (uri === undefined) {
      return
    }
    const thumbnails = []
    for (const track of tracks) {
      thumbnails.push({id: track.id, uri: uri})
    }
    dispatch(setThumbnails(thumbnails))
  }

  const discardThumbnail = (id: string) => {
    dispatch(setThumbnail({ id: id, uri: originalThumbnails.find((e: any) => e.id === id)?.uri }))
  }

  const cellButtons = css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
      <div css={[basicButtonStyle, buttonsStyle(theme)]}
        title={t('thumbnail.buttonGenerate-tooltip')}
        role="button" tabIndex={0} aria-label={t('thumbnail.buttonGenerate-tooltip-aria')}
        onClick={() => {
          generate(track, index)
        }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          generate(track, index)
        }}}
      >
        {t('thumbnail.buttonGenerate')}
      </div>
      <div css={[basicButtonStyle, buttonsStyle(theme)]}
        title={t('thumbnail.buttonUpload-tooltip')}
        role="button" tabIndex={0} aria-label={t('thumbnail.buttonUpload-tooltip-aria')}
        onClick={() => {
          upload(index)
        }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          upload(index)
        }}}
      >
        {t('thumbnail.buttonUpload')}
      </div>
        <input
          style={{display: 'none'}}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event, track)}
        />
      <div css={[basicButtonStyle, buttonsStyle(theme)]}
        title={t('thumbnail.buttonUseForOtherThumbnails-tooltip')}
        role="button" tabIndex={0} aria-label={t('thumbnail.buttonUseForOtherThumbnails-tooltip-aria')}
        onClick={() => {
          setForOtherThumbnails(track.thumbnailUri)
        }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          setForOtherThumbnails(track.thumbnailUri)
        }}}
      >
        {t('thumbnail.buttonUseForOtherThumbnails')}
      </div>
      <div css={[basicButtonStyle, buttonsStyle(theme)]}
        title={t('thumbnail.buttonDiscard-tooltip')}
        role="button" tabIndex={0} aria-label={t('thumbnail.buttonDiscard-tooltip-aria')}
        onClick={() => {
          discardThumbnail(track.id)
        }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          discardThumbnail(track.id)
        }}}
      >
        {t('thumbnail.buttonDiscard')}
      </div>
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

  const { t } = useTranslation()
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
    borderTop: `${theme.menuBorder}`,
  })

  const buttonStyle = css({
    height: '100%',
    minWidth: '200px',
    boxShadow: `${theme.boxShadow}`,
    background: `${theme.element_bg}`,
  })

  return (
    <div css={rowStyle}>
      <div>{t('thumbnail.explanation')}</div>
      <div css={[basicButtonStyle, buttonStyle]}
        title={t('thumbnail.buttonGenerateAll-tooltip')}
        role="button" tabIndex={0} aria-label={t('thumbnail.buttonGenerateAll-tooltip-aria')}
        onClick={() => {
          generateAll()
        }}
        onKeyDown={(event: React.KeyboardEvent) => { if (event.key === " " || event.key === "Enter") {
          generateAll()
        }}}
      >
        {t('thumbnail.buttonGenerateAll')}
      </div>
    </div>
  )
}

export default Thumbnail;


// const Under : React.FC<{}> = () => {

//   const leRefs = React.useRef<any>([]);

//   return(
//     <div>Under
//       <UnderOne leRefs={leRefs} index={0}></UnderOne>
//       <button onClick={() => leRefs.current[0].log()}></button>
//     </div>
//   )
// }


// const UnderOne : React.FC<{leRefs: any, index: number}> = ({leRefs, index}) => {

//   return (
//     <div>Under One
//       <UnderTwo ref={(el) => (leRefs.current[index] = el)} />
//     </div>
//   )
// }

// export const UnderTwo = React.forwardRef(
//   (props: any, forwardRefThing) => {

//     // External functions
//     useImperativeHandle(forwardRefThing, () => ({
//       log() {
//         console.log("Under2")
//       }
//     }));

//     return (
//       <div>Under 2</div>
//     )
//   })