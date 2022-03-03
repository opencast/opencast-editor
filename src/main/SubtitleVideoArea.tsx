import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentlyAt,
  selectIsPlaying,
  setClickTriggered,
  setIsPlaying,
  setCurrentlyAtInSeconds,
  selectClickTriggered,
  selectPreviewTriggered,
  setPreviewTriggered,
  selectAspectRatio,
  setAspectRatio,
  selectCurrentlyAtInSeconds } from "../redux/subtitleSlice";
import { selectTracks } from "../redux/videoSlice";
import { Flavor } from "../types";
import { settings } from "../config";
import { Form } from "react-final-form";
import { Select } from "mui-rff";
import { useTranslation } from "react-i18next";
import { OnChange } from 'react-final-form-listeners'
import { VideoControls, VideoPlayer } from "./Video";
import { flexGapReplacementStyle } from "../cssStyles";

/**
 * A part of the subtitle editor that displays a video and related controls
 */
const SubtitleVideoArea : React.FC<{}> = () => {

  const tracks = useSelector(selectTracks)
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor>()

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
    console.log("trackURIByFlavor: " + trackURIByFlavor)
    if (trackURIByFlavor) {
      return trackURIByFlavor
    }
    if (tracks.length > 0) {
      return tracks[0].uri
    }
  }

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
            flavors={tracks.reduce((a: Flavor[], o: { flavor: Flavor }) => (a.push(o.flavor), a), [])}
            changeFlavorcallback={setSelectedFlavor}
            defaultFlavor={selectedFlavor}
          />
          {/* TODO: Make preview mode work or remove it */}
          <VideoPlayer
            dataKey={0}
            url={getTrackURI()}
            isPrimary={true}
            selectIsPlaying={selectIsPlaying}
            selectCurrentlyAtInSeconds={selectCurrentlyAtInSeconds}
            selectPreviewTriggered={selectPreviewTriggered}
            selectClickTriggered={selectClickTriggered}
            selectAspectRatio={selectAspectRatio}
            setIsPlaying={setIsPlaying}
            setPreviewTriggered={setPreviewTriggered}
            setClickTriggered={setClickTriggered}
            setCurrentlyAtInSeconds={setCurrentlyAtInSeconds}
            setAspectRatio={setAspectRatio}
          />
          <VideoControls
            selectCurrentlyAt={selectCurrentlyAt}
            selectIsPlaying={selectIsPlaying}
            setIsPlaying={setIsPlaying}
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

          <Select
            label={t("subtitleVideoArea.selectVideoLabel")}
            name={dropdownName}
            data={selectData()}
          />

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