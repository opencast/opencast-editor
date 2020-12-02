export const roundToDecimalPlace = (num: number, decimalPlace: number) => {
  let decimalFactor = Math.pow(10, decimalPlace)
  return Math.round((num + Number.EPSILON) * decimalFactor) / decimalFactor
}
