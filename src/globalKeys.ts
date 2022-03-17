import { ApplicationKeyMap, ConfigurationOptions, ExtendedKeyMapOptions, KeyMapOptions, MouseTrapKeySequence } from 'react-hotkeys';
/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 */
import { KeyMap } from "react-hotkeys";
import { isMacOs } from 'react-device-detect';
import i18next from "i18next";

// Groups for displaying hotkeys in the overview page
const groupVideoPlayer = "Video Player"
const groupCuttingView = "Cutting"
const groupCuttingViewScrubber = "Scrubbing"

/**
 * Helper function that rewrites keys based on the OS
 */
const rewriteKeys = (key: string) => {
  let newKey = key
  if (isMacOs) {
    newKey = newKey.replace("Alt", "Option")
  }

  return newKey
}

/**
 * Combines all keyMaps into a single list of keys for KeyboardControls to display
 */
export const getAllHotkeys = () => {
  const allKeyMaps = [videoPlayerKeyMap, cuttingKeyMap, scrubberKeyMap]
  const allKeys : ApplicationKeyMap = {}

  for (const keyMap of allKeyMaps) {
    for (const [key, value] of Object.entries(keyMap)) {

      // Parse sequences
      let sequences : KeyMapOptions[] = []
      if ((value as ExtendedKeyMapOptions).sequences !== undefined) {
        for (const sequence of (value as ExtendedKeyMapOptions).sequences) {
          sequences.push({sequence: sequence as MouseTrapKeySequence, action: (value as ExtendedKeyMapOptions).action})
        }
      } else {
        sequences = [ {sequence: (value as ExtendedKeyMapOptions).sequence, action: (value as ExtendedKeyMapOptions).action } ]
      }

      // Create new key
      allKeys[key] = {
        name: (value as ExtendedKeyMapOptions).name,
        group: (value as ExtendedKeyMapOptions).group,
        sequences: sequences,
      }
    }
  }

  return allKeys
}

/**
 * Global configuration settings
 */
export const configOpts: ConfigurationOptions = {
  ignoreTags: [],   // Do not ignore hotkeys when focused on a textarea, input, select
  ignoreEventsCondition: (e: any) => {
    // Ignore hotkeys when focused on a textarea, input, select IF that hotkey is expected to perform
    // a certain function in that element that is more important than any hotkey function
    // (e.g. you need "Space" in a textarea to create whitespaces, not play/pause videos)
    if (e.target && e.target.tagName) {
      const tagname = e.target.tagName
      console.log(e)
      if ((tagname === "TEXTAREA" || tagname === "input" || tagname === "select")
        && (!e.altKey && !e.ctrlKey)
        && (e.code === "Space" || e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowUp" || e.code === "ArrowDown")) {
        return true
      }
    }
    return false
  },
}

/**
 * (Semi-) global map for video player controls
 */
export const videoPlayerKeyMap: KeyMap = {
  preview: {
    name: i18next.t("video.previewButton"),
    sequence: rewriteKeys("Control+Alt+p"),
    action: "keydown",
    group: groupVideoPlayer,
  },
  play: {
    name: i18next.t("keyboardControls.videoPlayButton"),
    sequence: rewriteKeys("Space"),
    sequences: [rewriteKeys("Space"), rewriteKeys("Control+Alt+Space")],
    action: "keydown",
    group: groupVideoPlayer,
  },
}

/**
 * (Semi-) global map for the buttons in the cutting view
 */
export const cuttingKeyMap: KeyMap = {
  cut: {
    name: i18next.t("cuttingActions.cut-button"),
    sequence: rewriteKeys("Control+Alt+c"),
    action: "keydown",
    group: groupCuttingView,
  },
  delete: {
    name: i18next.t("cuttingActions.delete-button"),
    sequence: rewriteKeys("Control+Alt+d"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeLeft: {
    name: i18next.t("cuttingActions.mergeLeft-button"),
    sequence: rewriteKeys("Control+Alt+n"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeRight: {
    name: i18next.t("cuttingActions.mergeRight-button"),
    sequence: rewriteKeys("Control+Alt+m"),
    action: "keydown",
    group: groupCuttingView,
  },
}

/**
 * (Semi-) global map for moving the scrubber
 */
export const scrubberKeyMap: KeyMap = {
  left: {
    name: i18next.t("keyboardControls.scrubberLeft"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+j"),
    sequences: [rewriteKeys("Control+Alt+j"), "Left"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  right: {
    name: i18next.t("keyboardControls.scrubberRight"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+l"),
    sequences: [rewriteKeys("Control+Alt+l"), "Right"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  increase: {
    name: i18next.t("keyboardControls.scubberIncrease"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+i"),
    sequences: [rewriteKeys("Control+Alt+i"), "Up"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  decrease: {
    name: i18next.t("keyboardControls.scrubberDecrease"),
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+k"),
    sequences: [rewriteKeys("Control+Alt+k"), "Down"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
}
