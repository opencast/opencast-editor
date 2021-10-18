import { useEffect, useRef } from "react";

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
 * Provides a react hook that can be called in an "onWheel" event to act as
 * a substitute for preventDefault().
 * Context: https://github.com/facebook/react/issues/14856 (18.10.2021)
 */
export function useWheelHack(timeout = 300) {
  const wheelTimeout = useRef<any>()

  // block the body from scrolling while wheelTimeout is set
  useEffect(() => {
    const maybeCancelWheel = (e: any) => wheelTimeout.current && e.preventDefault()
    document.body.addEventListener('wheel', maybeCancelWheel, { passive: false })
    return () => document.body.removeEventListener('wheel', maybeCancelWheel)
  }, [])

  // return a function that can be used to prevent scrolling for timeout ms
  return () => {
    clearTimeout(wheelTimeout.current)
    wheelTimeout.current = setTimeout(() => {
      wheelTimeout.current = false
    }, timeout)
  }
}