export interface Segment {
  id: string,
  startTime: number,
  endTime: number,
  state: string,
}

export interface TimelineState {
  segments: Segment[]
  scrubberPos: number
}