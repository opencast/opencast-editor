/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 *
 * Additional global configuration settins are placed in './config.ts'
 * (They are not placed here, because that somehow makes the name fields of keymaps undefined for some reason)
 *
 * If you add a new keyMap, be sure to add it to the getAllHotkeys function
 */
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
  newKey = isMacOs ? newKey.replace("Mod", "Command") : newKey.replace("Mod", "Control")

  return newKey
}

export const getGroupName = (groupName: string) => {
  switch (groupName) {
    case "videoPlayer":
      return groupVideoPlayer
      break
    case "cutting":
      return groupCuttingView
      break
    case "timeline":
      return groupCuttingViewScrubber
      break
    case "subtitleList":
      return groupSubtitleList
      break
  }
}

export interface IKeyMap {
  [property: string]: IKeyGroup
}

export interface IKeyGroup {
  [property: string]: IKey
}

export interface IKey {
  name: string
  key: string
}

export const KEYMAP: IKeyMap = {
  videoPlayer: {
    play: {
      name: "keyboardControls.videoPlayButton",
      key: rewriteKeys("Mod+Alt+Space, Space"),
    },
    preview: {
      name: "video.previewButton",
      key: rewriteKeys("Mod+Alt+p"),
    }
  },
  cutting: {
    cut: {
      name: "cuttingActions.cut-button",
      key: rewriteKeys("Mod+Alt+c"),
    },
    delete: {
      name: "cuttingActions.delete-button",
      key: rewriteKeys("Mod+Alt+d"),
    },
    mergeLeft: {
      name: "cuttingActions.mergeLeft-button",
      key: rewriteKeys("Mod+Alt+n"),
    },
    mergeRight: {
      name: "cuttingActions.mergeRight-button",
      key: rewriteKeys("Mod+Alt+m"),
    },
  },
  timeline: {
    left: {
      name: "keyboardControls.scrubberLeft",
      key: rewriteKeys("Mod+Alt+j , Left"),
    },
    right: {
      name: "keyboardControls.scrubberRight",
      key: rewriteKeys("Mod+Alt+l, Right"),
    },
    increase: {
      name: "keyboardControls.scrubberIncrease",
      key: rewriteKeys("Mod+Alt+i, Up"),
    },
    decrease: {
      name: "keyboardControls.scrubberDecrease",
      key: rewriteKeys("Mod+Alt+k, Down"),
    },
  },
  subtitleList: {
    addAbove: {
      name: "subtitleList.addSegmentAbove",
      key: rewriteKeys("Mod+Alt+q"),
    },
    addBelow: {
      name: "subtitleList.addSegmentBelow",
      key: rewriteKeys("Mod+Alt+a"),
    },
    jumpAbove: {
      name: "subtitleList.jumpToSegmentAbove",
      key: rewriteKeys("Mod+Alt+w"),
    },
    jumpBelow: {
      name: "subtitleList.jumpToSegmentBelow",
      key: rewriteKeys("Mod+Alt+s"),
    },
    delete: {
      name: "subtitleList.deleteSegment",
      key: rewriteKeys("Mod+Alt+d"),
    }
  }
}
