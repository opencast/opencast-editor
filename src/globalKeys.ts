/**
 * Contains mappings for special keyboard controls, beyond what is usually expected of a webpage
 * Learn more about keymaps at https://github.com/greena13/react-hotkeys#defining-key-maps (12.03.2021)
 */
import { KeyMap } from "react-hotkeys";

/**
 * (Semi-) global map for the buttons in the cutting view
 */
export const cuttingKeyMap: KeyMap = {
  cut: "Control+Alt+c",
  delete: "Control+Alt+d",
  mergeLeft: "Control+Alt+n",
  mergeRight: "Control+Alt+m",
  preview: "Control+Alt+p",
  play: "Space",
}

/**
 * Local map for moving the scrubber
 */
export const scrubberKeyMap: KeyMap = {
  left: "Control+Alt+j",
  right: "Control+Alt+l",
  increase: "Control+Alt+i",
  decrease: "Control+Alt+k",
}