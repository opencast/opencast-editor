export interface Segment {
  id: string,
  start: number,
  end: number,
  deleted: boolean,
}

export interface Track {
  id: string,
  uri: string,
  flavor: Flavor,
  audio_stream: TrackStream,
  video_stream: TrackStream,
  thumbnailUri: string | undefined,
  thumbnailPriority: number,
}

export interface Flavor {
  type: string,
  subtype: string,
}

interface TrackStream {
  available: boolean,
  enabled: boolean,
  thumbnail_uri: string,
}

export interface Workflow {
  id: string,
  name: string,
  description: string,
  displayOrder: number,
}

export interface TimelineState {
  segments: Segment[]
  scrubberPos: number
}

export interface SubtitlesFromOpencast {
  id: string,
  subtitle: string,
  tags: string[],
}

export interface SubtitlesInEditor {
  cues: SubtitleCue[],
  tags: string[],
}

export interface SubtitleCue {
  id?: string,              // Actually not useful as an identifier, as it is not guaranteed to exist
  idInternal: string,       // Identifier for internal use. Has nothing to do with the webvtt parser.
  text: string,
  startTime: number,
  endTime: number,
  // Odditiy of the webvtt parser. Changes to text also need to be applied to tree.children[0].value
  tree: {children: [{type: string, value: string}]}
  // And many more
}

export interface ExtendedSubtitleCue extends SubtitleCue {
  alignment : string
  direction : string
  lineAlign : string
  linePosition : string
  positionAlign : string
  size : number
  textPosition : string
}

export interface PostEditArgument {
  segments: Segment[]
  tracks: Track[]
  subtitles: SubtitlesFromOpencast[]
}

export interface PostAndProcessEditArgument extends PostEditArgument{
  workflow: [{id: string}]
}

// Use respective i18n keys as values
export enum MainMenuStateNames {
  cutting = "mainMenu.cutting-button",
  metadata = "mainMenu.metadata-button",
  trackSelection = "mainMenu.select-tracks-button",
  subtitles = "mainMenu.subtitles-button",
  thumbnail = "mainMenu.thumbnail-button",
  finish = "mainMenu.finish-button",
  keyboardControls = "mainMenu.keyboard-controls-button",
}

export interface httpRequestState {
  status: "idle" | "loading" | "success" | "failed",
  error: string | undefined,
  errorReason: "unknown" | "workflowActive"
}
