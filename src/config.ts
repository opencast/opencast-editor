/**
 * A place for global config values
 */

/**
 * Hardcoded id of the mediapackge the editor will work on
 */
export var mediaPackageId : string = "e63706bc-48df-4346-a72a-bf6f39cea32c"
var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("mediaPackageId")) {
  let tmp = urlParams.get("mediaPackageId")
  if (tmp) {
    mediaPackageId = tmp
  }
}