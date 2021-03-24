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