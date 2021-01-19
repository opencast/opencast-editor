export interface Segment {
  id: string,
  start: number,
  end: number,
  deleted: boolean,
}

export interface Track {
  id: string,
  uri: string,
  flavor: any,
  audioStream: any,
  videoStream: any,
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

export interface RequestArgument {
  mediaPackageId: string
  ocUrl: string
}

export interface PostEditArgument extends RequestArgument {
  segments: Segment[]
  tracks: Track[]
}

export interface PostAndProcessEditArgument extends PostEditArgument{
  workflow: [{id: string}]
}

export enum MainMenuStateNames {
  cutting = "Cutting",
  metadata = "Metadata",
  thumbnail = "Thumbnail",
  finish = "Finish",
}

export interface httpRequestState {
  status: 'idle' | 'loading' | 'success' | 'failed',
  error: string | undefined
}
