/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 *
 * Additional global configuration settins are placed in './config.ts'
 * (They are not placed here, because that somehow makes the name fields of keymaps undefined for some reason)
 *
 * If you add a new keyMap, be sure to add it to the getAllHotkeys function
 */
import { match } from '@opencast/appkit';
import { ParseKeys } from 'i18next';
import { isMacOs } from 'react-device-detect';

// Groups for displaying hotkeys in the overview page
const groupVideoPlayer = "keyboardControls.groupVideoPlayer"
const groupCuttingView = 'keyboardControls.groupCuttingView'
const groupCuttingViewScrubber = 'keyboardControls.groupCuttingViewScrubber'
const groupSubtitleList = "keyboardControls.groupSubtitleList"

/**
 * Helper function that rewrites keys based on the OS
 */
export const rewriteKeys = (key: string) => {
  let newKey = key
  if (isMacOs) {
    newKey = newKey.replace("Alt", "Option")
  }

  return newKey
}

export const getGroupName = (groupName: string) : ParseKeys => {
  return match(groupName, {
    videoPlayer: () => groupVideoPlayer,
    cutting: () => groupCuttingView,
    timeline: () => groupCuttingViewScrubber,
    subtitleList: () => groupSubtitleList,
  })
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
  combinationKey?: string
}

export const KEYMAP: IKeyMap = {
  videoPlayer: {
    play: {
      name: "keyboardControls.videoPlayButton",
      key: "Shift+Alt+Space, Space",
    },
    preview: {
      name: "video.previewButton",
      key: "Shift+Alt+p",
    }
  },
  cutting: {
    cut: {
      name: "cuttingActions.cut-button",
      key: "Shift+Alt+c",
    },
    delete: {
      name: "cuttingActions.delete-button",
      key: "Shift+Alt+d",
    },
    mergeLeft: {
      name: "cuttingActions.mergeLeft-button",
      key: "Shift+Alt+n",
    },
    mergeRight: {
      name: "cuttingActions.mergeRight-button",
      key: "Shift+Alt+m",
    },
    zoomIn: {
      name: "cuttingActions.zoomIn",
      key: "Shift;Alt;z, +",
      combinationKey: ';',
    },
    zoomOut: {
      name: "cuttingActions.zoomOut",
      key: "Shift+Alt+t, -",
    },
  },
  timeline: {
    left: {
      name: "keyboardControls.scrubberLeft",
      key: "Shift+Alt+j , Left",
    },
    right: {
      name: "keyboardControls.scrubberRight",
      key: "Shift+Alt+l, Right",
    },
    increase: {
      name: "keyboardControls.scrubberIncrease",
      key: "Shift+Alt+i, Up",
    },
    decrease: {
      name: "keyboardControls.scrubberDecrease",
      key: "Shift+Alt+k, Down",
    },
  },
  subtitleList: {
    addAbove: {
      name: "subtitleList.addSegmentAbove",
      key: "Shift+Alt+q",
    },
    addBelow: {
      name: "subtitleList.addSegmentBelow",
      key: "Shift+Alt+a",
    },
    jumpAbove: {
      name: "subtitleList.jumpToSegmentAbove",
      key: "Shift+Alt+w",
    },
    jumpBelow: {
      name: "subtitleList.jumpToSegmentBelow",
      key: "Shift+Alt+s",
    },
    delete: {
      name: "subtitleList.deleteSegment",
      key: "Shift+Alt+d",
    }
  }
}
