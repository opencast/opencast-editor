import { ApplicationKeyMap, ExtendedKeyMapOptions, KeyMapOptions, MouseTrapKeySequence } from 'react-hotkeys';
/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 *
 * Additional global configuration settins are placed in './config.ts'
 * (They are not placed here, because that somehow makes the name fields of keymaps undefined for some reason)
 *
 * If you add a new keyMap, be sure to add it to the getAllHotkeys function
 */
import { KeyMap } from "react-hotkeys";
import { isMacOs } from 'react-device-detect';

// Groups for displaying hotkeys in the overview page
const groupVideoPlayer = "keyboardControls.groupVideoPlayer"
const groupCuttingView = 'keyboardControls.groupCuttingView'
const groupCuttingViewScrubber = 'keyboardControls.groupCuttingViewScrubber'
const groupSubtitleList = "keyboardControls.groupSubtitleList"

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
 * (Semi-) global map for video player controls
 */
export const videoPlayerKeyMap: KeyMap = {
  preview: {
    name: "video.previewButton",
    sequence: rewriteKeys("Control+Alt+p"),
    action: "keydown",
    group: groupVideoPlayer,
  },
  play: {
    name: "keyboardControls.videoPlayButton",
    sequence: rewriteKeys("Space"),
    sequences: [rewriteKeys("Control+Alt+Space"), "Space"],
    action: "keydown",
    group: groupVideoPlayer,
  },
}

/**
 * (Semi-) global map for the buttons in the cutting view
 */
export const cuttingKeyMap: KeyMap = {
  cut: {
    name: "cuttingActions.cut-button",
    sequence: rewriteKeys("Control+Alt+c"),
    action: "keydown",
    group: groupCuttingView,
  },
  delete: {
    name: "cuttingActions.delete-button",
    sequence: rewriteKeys("Control+Alt+d"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeLeft: {
    name: "cuttingActions.mergeLeft-button",
    sequence: rewriteKeys("Control+Alt+n"),
    action: "keydown",
    group: groupCuttingView,
  },
  mergeRight: {
    name: "cuttingActions.mergeRight-button",
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
    name: "keyboardControls.scrubberLeft",
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+j"),
    sequences: [rewriteKeys("Control+Alt+j"), "Left"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  right: {
    name: "keyboardControls.scrubberRight",
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+l"),
    sequences: [rewriteKeys("Control+Alt+l"), "Right"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  increase: {
    name: "keyboardControls.scubberIncrease",
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+i"),
    sequences: [rewriteKeys("Control+Alt+i"), "Up"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
  decrease: {
    name: "keyboardControls.scrubberDecrease",
    // Typescript requires 'sequence' even though there is 'sequences, but it doesn't do anything?
    sequence: rewriteKeys("Control+Alt+k"),
    sequences: [rewriteKeys("Control+Alt+k"), "Down"],
    action: "keydown",
    group: groupCuttingViewScrubber,
  },
}

export const subtitleListKeyMap: KeyMap = {
  addAbove: {
    name: "subtitleList.addSegmentAbove",
    sequence: rewriteKeys("Control+Alt+q"),
    action: "keydown",
    group: groupSubtitleList,
  },
  addBelow: {
    name: "subtitleList.addSegmentBelow",
    sequence: rewriteKeys("Control+Alt+a"),
    action: "keydown",
    group: groupSubtitleList,
  },
  jumpAbove: {
    name: "subtitleList.jumpToSegmentAbove",
    sequence: rewriteKeys("Control+Alt+w"),
    action: "keydown",
    group: groupSubtitleList,
  },
  jumpBelow: {
    name: "subtitleList.jumpToSegmentBelow",
    sequence: rewriteKeys("Control+Alt+s"),
    action: "keydown",
    group: groupSubtitleList,
  },
  delete : {
    name: "subtitleList.deleteSegment",
    sequence: rewriteKeys("Control+Alt+d"),
    action: "keydown",
    group: groupSubtitleList,
  }
}

/**
 * Combines all keyMaps into a single list of keys for KeyboardControls to display
 * Placing this under the keyMaps is important, else the translation hooks won't happen
 */
 export const getAllHotkeys = () => {
  const allKeyMaps = [videoPlayerKeyMap, cuttingKeyMap, scrubberKeyMap, subtitleListKeyMap]
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
