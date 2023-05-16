import { nanoid } from '@reduxjs/toolkit';
import { WebVTTParser, WebVTTSerializer } from 'webvtt-parser';
import { ExtendedSubtitleCue, SubtitleCue } from '../types';

export const roundToDecimalPlace = (num: number, decimalPlace: number) => {
  let decimalFactor = Math.pow(10, decimalPlace)
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor
}


// Returns a promise that resolves after `ms` milliseconds.
export const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));


// Get an understandable time string for ARIA
export const convertMsToReadableString = (ms: number): string => {
  let hours = new Date((ms ? ms : 0)).toISOString().substr(11, 2)
  let minutes = new Date((ms ? ms : 0)).toISOString().substr(14, 2)
  let seconds = new Date((ms ? ms : 0)).toISOString().substr(17, 2)

  let result = []
  if (parseInt(hours) > 0) { result.push(hours + " hours, ")}
  if (parseInt(minutes) > 0 || parseInt(hours) > 0) { result.push(minutes + " minutes, ")}
  result.push(seconds + " seconds")

  return result.join("")
}

/**
 * Parses JSON. Returns [err, result]
 * @param str string that should be parsed
 */
export function safeJsonParse(str : string) {
  try {
      return [null, JSON.parse(str)];
  } catch (err) {
      return [err];
  }
}

/**
 * Checks whether the css property gap for flexbox is supported by the browser.
 * Currently, this cannot be checked with "@support", so we use this workaround
 * instead.
 */
var flexGapIsSupported: boolean | undefined;
export function checkFlexGapSupport() {
  // Use the cached value if it has been defined
	if (flexGapIsSupported !== undefined) {
		return flexGapIsSupported
	}

	// Create a flex container with row-gap set
	const flex = document.createElement('div')
	flex.style.display = 'flex'
	flex.style.flexDirection = 'column'
	flex.style.rowGap = '1px'
	flex.style.position = 'absolute'

	// Create two, elements inside it
	flex.appendChild(document.createElement('div'))
	flex.appendChild(document.createElement('div'))

	// Append to the DOM (needed to obtain scrollHeight)
	document.body.appendChild(flex)

  // Flex container should be 1px high due to the row-gap
  flexGapIsSupported = flex.scrollHeight === 1

  // Remove element from the DOM after you are done with it
  if(flex.parentNode) {
    flex.parentNode.removeChild(flex)
  }

	return flexGapIsSupported
}

/**
 * Converts a working subtitle representation into a string
 */
export function serializeSubtitle(subtitle: SubtitleCue[]) {
  const seri = new WebVTTSerializer();

  // Fix cues to work with serialize
  let cueIndex = 0
  const cues = [...subtitle];
  for (let cue of subtitle) {
    cue = {...cue}
    cue.startTime = cue.startTime / 1000
    cue.endTime = cue.endTime / 1000

    const extendedCue : ExtendedSubtitleCue = {
      id: cue.id ? cue.id : undefined,
      idInternal: cue.idInternal,
      text: cue.text,
      startTime: cue.startTime,
      endTime: cue.endTime,
      tree: cue.tree,

      // The serializer has a bug where some of the attributes like alignment are written to the VTT file
      // as `alignment: undefined` if they are not set. This then causes illegal parsing exceptions with the
      // parser. That's why we set some acceptable defaults here.
      alignment: "center",
      direction: "horizontal",
      lineAlign: "start",
      linePosition: "auto",
      positionAlign: "auto",
      size: 100,
      textPosition: "auto",
    }
    cue = extendedCue

    cues[cueIndex] = cue

    cueIndex++
  }
  return seri.serialize(cues)
}

export function parseSubtitle(subtitle: String) {
  // Used parsing library: https://www.npmjs.com/package/webvtt-parser
  // - Unmaintained and does have bugs, so we will need to switch eventually
  // Other interesting vtt parsing libraries:
  // https://github.com/osk/node-webvtt
  // - Pros: Parses styles and meta information
  // - Cons: Parses timestamps in seconds, Maybe not maintained anymore
  // https://github.com/gsantiago/subtitle.js
  // - Pros: Parses styles, can also parse SRT, actively maintained
  // - Cons: Uses node streaming library, can't polyfill without ejecting CreateReactApp
  // TODO: Parse caption
  const parser = new WebVTTParser();
  const tree = parser.parse(subtitle, 'metadata');
  if (tree.errors.length !== 0) {

    // state.status = 'failed'
    const errors = []
    for (const er of tree.errors) {
      errors.push("On line: " + er.line + " col: " + er.col + " error occured: " + er.message)
    }
    throw new Error(errors.join("\n"))
    // setError(state, action.payload.identifier, errors.join("\n"))
  }

  // Attach a unique id to each segment/cue
  // This is used by React to keep track of cues between changes (e.g. addition, deletion)
  let index = 0
  for (let cue of tree.cues) {
    if (!cue.id) {
      cue.idInternal = nanoid()
      tree.cues[index] = cue
    }

    // Turn times into milliseconds
    cue.startTime = cue.startTime * 1000
    cue.endTime = cue.endTime * 1000
    tree.cues[index] = cue

    index++
  }

  return tree.cues
}
