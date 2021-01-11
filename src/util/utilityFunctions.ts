export const roundToDecimalPlace = (num: number, decimalPlace: number) => {
  let decimalFactor = Math.pow(10, decimalPlace)
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor
}


// Returns a promise that resolves after `ms` milliseconds.
export const sleep = (ms: number) => new Promise((resolve, reject) => setTimeout(resolve, ms));