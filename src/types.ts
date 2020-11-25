export interface Segment {
  id: string,
  startTime: number,
  endTime: number,
  isAlive: boolean,
}

export interface TimelineState {
  segments: Segment[]
  scrubberPos: number
}