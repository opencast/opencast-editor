/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 */
import { KeyMap } from "react-hotkeys";
import { isMacOs } from 'react-device-detect';

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
  cut: rewriteKeys("Control+Alt+c"),
  delete: rewriteKeys("Control+Alt+d"),
  mergeLeft: rewriteKeys("Control+Alt+n"),
  mergeRight: rewriteKeys("Control+Alt+m"),
  preview: rewriteKeys("Control+Alt+p"),
  play: rewriteKeys("Space"),
}

/**
 * (Semi-) global map for moving the scrubber
 */
export const scrubberKeyMap: KeyMap = {
  left: [rewriteKeys("Control+Alt+j"), "ArrowLeft"],
  right: [rewriteKeys("Control+Alt+l"), "ArrowRight"],
  increase: [rewriteKeys("Control+Alt+i"), "ArrowUp"],
  decrease: [rewriteKeys("Control+Alt+k"), "ArrowDown"],
}