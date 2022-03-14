export interface Segment {
  id: string,
  start: number,
  end: number,
  deleted: boolean,
}

export interface Track {
  id: string,
  uri: string,
  flavor: {type: string, subtype: string},
  audio_stream: {available: boolean, enabled: boolean, thumbnail_uri: string},
  video_stream: {available: boolean, enabled: boolean, thumbnail_uri: string},
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

export interface Subtitle {
  identifier: string
  subtitles: SubtitleCue[]
}

export interface SubtitleCue {
  text: string,
  startTime: number,
  endTime: number,
  // And many more
}

export interface PostEditArgument {
  segments: Segment[]
  tracks: Track[]
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
  status: 'idle' | 'loading' | 'success' | 'failed',
  error: string | undefined
}
