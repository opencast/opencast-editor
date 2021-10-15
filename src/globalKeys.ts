/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 */
import { KeyMap } from "react-hotkeys";
import { isMacOs } from 'react-device-detect';
import i18next from "i18next";

// Groups for displaying hotkeys in the overview page
const groupCuttingView = "Cutting View"
const groupCuttingViewScrubber = "Cutting View - Scrubber"

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
  preview: {
    name: i18next.t("video.previewButton"),
    sequence: rewriteKeys("Control+Alt+p"),
    action: "keydown",
    group: groupCuttingView,
  },
  play: {
    name: i18next.t("keyboardControls.videoPlayButton"),
    sequence: rewriteKeys("Space"),
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
