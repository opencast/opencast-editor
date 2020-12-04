export interface Segment {
  id: string,
  start: number,
  end: number,
  deleted: boolean,
}

export interface TimelineState {
  segments: Segment[]
  scrubberPos: number
}

export interface PostEditArgument {
  segments: Segment[]
  mediaPackageId: string
}

export interface PostAndProcessEditArgument extends PostEditArgument{
  workflowID: string
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
