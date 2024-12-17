import { nanoid } from "@reduxjs/toolkit";
import { WebVTTParser, WebVTTSerializer } from "webvtt-parser";
import { ExtendedSubtitleCue, SubtitleCue } from "../types";
import { useEffect, useState, useRef } from "react";

export const roundToDecimalPlace = (num: number, decimalPlace: number) => {
  const decimalFactor = Math.pow(10, decimalPlace);
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor;
};


// Returns a promise that resolves after `ms` milliseconds.
export const sleep = (ms: number) => new Promise((resolve, _reject) => setTimeout(resolve, ms));


// Get an understandable time string for ARIA
export const convertMsToReadableString = (ms: number): string => {
  const hours = new Date((ms ? ms : 0)).toISOString().substr(11, 2);
  const minutes = new Date((ms ? ms : 0)).toISOString().substr(14, 2);
  const seconds = new Date((ms ? ms : 0)).toISOString().substr(17, 2);

  const result = [];
  if (parseInt(hours) > 0) { result.push(hours + " hours, "); }
  if (parseInt(minutes) > 0 || parseInt(hours) > 0) { result.push(minutes + " minutes, "); }
  result.push(seconds + " seconds");

  return result.join("");
};

/**
 * Parses JSON. Returns [err, result]
 * @param str string that should be parsed
 */
export function safeJsonParse(str: string) {
  try {
    return [null, JSON.parse(str)];
  } catch (err) {
    return [err];
  }
}

/**
 * Converts a working subtitle representation into a string
 */
export function serializeSubtitle(subtitle: SubtitleCue[]) {
  const seri = new WebVTTSerializer();

  // Fix cues to work with serialize
  let cueIndex = 0;
  const cues = [...subtitle];
  for (let cue of subtitle) {
    cue = { ...cue };
    cue.startTime = cue.startTime / 1000;
    cue.endTime = cue.endTime / 1000;

    const extendedCue: ExtendedSubtitleCue = {
      id: cue.id ? cue.id : undefined,
      idInternal: cue.idInternal,
      text: cue.text,
      startTime: cue.startTime,
      endTime: cue.endTime,
      tree: cue.tree,

      // The serializer has a bug where some of the attributes like alignment are written to the VTT file
      // as `alignment: undefined` if they are not set. This then causes illegal parsing exceptions with the
      // parser. That"s why we set some acceptable defaults here.
      alignment: "center",
      direction: "horizontal",
      lineAlign: "start",
      linePosition: "auto",
      positionAlign: "auto",
      size: 100,
      textPosition: "auto",
    };
    cue = extendedCue;

    cues[cueIndex] = cue;

    cueIndex++;
  }
  return seri.serialize(cues);
}

export function parseSubtitle(subtitle: string): SubtitleCue[] {
  // Used parsing library: https://www.npmjs.com/package/webvtt-parser
  // - Unmaintained and does have bugs, so we will need to switch eventually
  // Other interesting vtt parsing libraries:
  // https://github.com/osk/node-webvtt
  // - Pros: Parses styles and meta information
  // - Cons: Parses timestamps in seconds, Maybe not maintained anymore
  // https://github.com/gsantiago/subtitle.js
  // - Pros: Parses styles, can also parse SRT, actively maintained
  // - Cons: Uses node streaming library, can"t polyfill without ejecting CreateReactApp
  // TODO: Parse caption
  if (subtitle === "") {
    throw new Error("File is empty");
  }

  const parser = new WebVTTParser();
  const tree = parser.parse(subtitle, "metadata");
  if (tree.errors.length !== 0) {

    // state.status = "failed"
    const errors = [];
    for (const er of tree.errors) {
      errors.push("On line: " + er.line + " col: " + er.col + " error occured: " + er.message);
    }
    throw new Error(errors.join("\n"));
    // setError(state, action.payload.identifier, errors.join("\n"))
  }

  // Attach a unique id to each segment/cue
  // This is used by React to keep track of cues between changes (e.g. addition, deletion)
  let index = 0;
  for (const cue of tree.cues) {
    if (!cue.id) {
      cue.idInternal = nanoid();
      tree.cues[index] = cue;
    }

    // Turn times into milliseconds
    cue.startTime = cue.startTime * 1000;
    cue.endTime = cue.endTime * 1000;
    tree.cues[index] = cue;

    index++;
  }

  return tree.cues;
}

/**
 * Parse language code to language name
 * Returns language name in the language set in the browser
 * Returns undefined if the input was undefined or the language code could not
 * be parsed
 */
export function languageCodeToName(lang: string | undefined): string | undefined {
  if (!lang) {
    return undefined;
  }
  const browserLang = window.navigator.language;
  const languageNames = new Intl.DisplayNames(browserLang, { type: "language" });
  try {
    return languageNames.of(lang.trim());
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return undefined;
  }
}

/**
 * @returns the current window width and height
 */
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

/**
 * A hook for window dimensions
 */
export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;

}

// Runs a callback every delay milliseconds
// Pass delay = null to stop
// Based off: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
type IntervalFunction = () => (unknown | void);
export function useInterval(callback: IntervalFunction, delay: number | null) {

  const savedCallback = useRef<IntervalFunction | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback.current !== null) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => { clearInterval(id); };
    }
  }, [callback, delay]);
}
