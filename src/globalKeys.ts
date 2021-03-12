/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 */
import { KeyMap } from "react-hotkeys";

/**
 * (Semi-) global map for the buttons in the cutting view
 */
export const cuttingKeyMap: KeyMap = {
  cut: "c",
  delete: "d",
  mergeLeft: "n",
  mergeRight: "m",
  preview: "p",
  play: "Space",
}

/**
 * Local map for moving the scrubber
 */
export const scrubberKeyMap: KeyMap = {
  left: "j",
  right: "l",
  increase: "i",
  decrease: "k",
}