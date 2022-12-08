import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { useSelector } from "react-redux";
import { selectCurrentlyAt,
  selectIsPlaying,
  setClickTriggered,
  setIsPlaying,
  selectClickTriggered,
  selectPreviewTriggered,
  setPreviewTriggered,
  selectAspectRatio,
  setAspectRatio,
  selectCurrentlyAtInSeconds,
  selectSelectedSubtitleByFlavor,
  selectIsPlayPreview,
  setIsPlayPreview,
  setCurrentlyAtAndTriggerPreview} from "../redux/subtitleSlice";
import { selectVideos } from "../redux/videoSlice";
import { Flavor } from "../types";
import { settings } from "../config";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useTranslation } from "react-i18next";
import { OnChange } from 'react-final-form-listeners'
import { VideoControls, VideoPlayer } from "./Video";
import { flexGapReplacementStyle, subtitleSelectStyle } from "../cssStyles";
import { serializeSubtitle } from "../util/utilityFunctions";
import { selectTheme } from "../redux/themeSlice";
import { ThemeProvider } from "@mui/material/styles";

/**
 * A part of the subtitle editor that displays a video and related controls
 *
 * A bug in the react-player module prevents hotloading subtitle files:
 * https://github.com/cookpete/react-player/issues/1162
 * We have "fixed" this in a fork https://github.com/Arnei/react-player, because
 * coming up with a proper fix appears to be rather difficult
 * TODO: Come up with a proper fix and create a PR
 */
const SubtitleVideoArea : React.FC<{}> = () => {

  const tracks = useSelector(selectVideos)
  let subtitle = useSelector(selectSelectedSubtitleByFlavor)
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>()
  const [subtitleUrl, setSubtitleUrl] = useState("")

  // Decide on initial flavor on mount
  useEffect(() => {
    // Get default from settings
    if (settings.subtitles.defaultVideoFlavor !== undefined) {
      setSelectedFlavor(settings.subtitles.defaultVideoFlavor)
      return
    }
    // If there is no default, just pick any
    if (tracks.length > 0) {
      setSelectedFlavor(tracks[0].flavor)
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get the uri of a track the currently selected flavor
  const getTrackURIBySelectedFlavor = () => {
    for (const track of tracks) {
      if (track.flavor.type === selectedFlavor?.type && track.flavor.subtype === selectedFlavor?.subtype) {
        return track.uri
      }
    }
  }

  // Get a track URI by any means necessary
  const getTrackURI = () => {
    const trackURIByFlavor = getTrackURIBySelectedFlavor()
    if (trackURIByFlavor) {
      return trackURIByFlavor
    }
    if (tracks.length > 0) {
      return tracks[0].uri
    }
  }

  // Parse subtitles to something the video player understands
  useEffect(() => {
    if(subtitle) {
      const serializedSubtitle = serializeSubtitle(subtitle)
      setSubtitleUrl(window.URL.createObjectURL(new Blob([serializedSubtitle], {type : 'text/vtt'})))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitle])

  const areaWrapper = css({
    display: 'block',
    height: '100%',
    width: '40%',
  })

  const videoPlayerAreaStyle = css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    // width: '40%',
    ...(flexGapReplacementStyle(10, false)),
  });

  const render = () => {
    return(
      <div css={areaWrapper}>
        <div css={videoPlayerAreaStyle}>
          <VideoSelectDropdown
            // eslint-disable-next-line no-sequences
            flavors={tracks.reduce((a: Flavor[], o: { flavor: Flavor }) => (a.push(o.flavor), a), [])}
            changeFlavorcallback={setSelectedFlavor}
            defaultFlavor={selectedFlavor}
          />
          {/* TODO: Make preview mode work or remove it */}
          <VideoPlayer
            dataKey={0}
            url={getTrackURI()}
            isPrimary={true}
            subtitleUrl={subtitleUrl}
            selectIsPlaying={selectIsPlaying}
            selectCurrentlyAtInSeconds={selectCurrentlyAtInSeconds}
            selectPreviewTriggered={selectPreviewTriggered}
            selectClickTriggered={selectClickTriggered}
            selectAspectRatio={selectAspectRatio}
            setIsPlaying={setIsPlaying}
            setPreviewTriggered={setPreviewTriggered}
            setClickTriggered={setClickTriggered}
            setCurrentlyAt={setCurrentlyAtAndTriggerPreview}
            setAspectRatio={setAspectRatio}
          />
          <VideoControls
            selectCurrentlyAt={selectCurrentlyAt}
            selectIsPlaying={selectIsPlaying}
            selectIsPlayPreview={selectIsPlayPreview}
            setIsPlaying={setIsPlaying}
            setIsPlayPreview={setIsPlayPreview}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {render()}
    </>
  );
}

/**
 * Changes the selectedFlavor in SubtitleVideoArea
 */
const VideoSelectDropdown : React.FC<{
  flavors: Flavor[],
  changeFlavorcallback: React.Dispatch<React.SetStateAction<Flavor | undefined>>,
  defaultFlavor: Flavor | undefined
}> = ({
  flavors,
  changeFlavorcallback,
  defaultFlavor
}) => {

  const { t } = useTranslation();
  const theme = useSelector(selectTheme)

  const dropdownName: string = "flavors"

  // Turn flavor into string
  const stringifyFlavor = (flavor: Flavor) => {
    return flavor.type + "/" + flavor.subtype
  }

  // Data to populate the dropdown with
  const selectData = () => {
    const data = []
    for (let flavor of flavors) {
      // We have to deconstruct the flavor object for the value as well and put it back together
      data.push({label: stringifyFlavor(flavor), value: stringifyFlavor(flavor)})
    }
    return data
  }

  const onSubmit = () => {}


  const subtitleAddFormStyle = css({
    width: '100%',
  });

  return (
    <Form
    onSubmit={(onSubmit)}
    // TODO: Find out why "dropdownName" does not work with initialValues
    initialValues={{"flavors": defaultFlavor ? stringifyFlavor(defaultFlavor) : ""}}
    render={({ handleSubmit, form, submitting, pristine, values}) => (
      <form onSubmit={event => {
        handleSubmit(event)
      }} css={subtitleAddFormStyle}>

            <ThemeProvider theme={subtitleSelectStyle(theme)}>
              <Select
                label={t("subtitleVideoArea.selectVideoLabel") ?? undefined}
                name={dropdownName}
                data={selectData()}
              />
            </ThemeProvider>

          <OnChange name={dropdownName}>
            {(value, previous) => {
              // Put flavor back together
              const newFlavor: Flavor = {type: value.split("/")[0], subtype: value.split("/")[1]}
              changeFlavorcallback(newFlavor)
            }}
          </OnChange>
      </form>
    )}
  />
  )
}

export default SubtitleVideoArea;
