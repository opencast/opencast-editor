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
  audio_stream: any,
  video_stream: any,
  thumbnailUri: string | undefined,
  thumbnailPriority: number,
}

export interface Flavor {
  type: string,
  subtype: string,
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
  thumbnail = "mainMenu.thumbnail-button",
  finish = "mainMenu.finish-button",
  keyboardControls = "mainMenu.keyboard-controls-button",
}

export interface httpRequestState {
  status: 'idle' | 'loading' | 'success' | 'failed',
  error: {status: number, text: string} | string | undefined
  errorReason: 'unknown' | 'workflowActive'
}
