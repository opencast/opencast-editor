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

export enum MainMenuStateNames {
  cutting = "Cutting",
  metadata = "Metadata",
  trackSelection = "Select Tracks",
  thumbnail = "Thumbnail",
  subtitles = "Subtitles",
  finish = "Finish",
}

export interface httpRequestState {
  status: 'idle' | 'loading' | 'success' | 'failed',
  error: string | undefined
}
