export interface Segment {
  startTime: number,
  endTime: number,
  state: string,
}

export interface Segments {
  segments: Segment[]
}