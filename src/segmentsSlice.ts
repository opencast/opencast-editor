import { createSlice } from '@reduxjs/toolkit'

import { Segment, Segments } from './types'

// TODO: Add id that can be used as a key in react components

const initialState: Segments = {
  segments: [{startTime: 0, endTime: 120, state: "alive"},
            {startTime: 120, endTime: 1220, state: "Hello there"}]  // Testvalues
}

export const segmentsSlice = createSlice({
  name: 'segments',
  initialState,
  reducers: {
    segmentAdded: (state, action) => {
      state.segments.push(action.payload)
    }
  }
})

export const { segmentAdded, } = segmentsSlice.actions

export const selectSegments = (state: { segments: any }) => state.segments

export default segmentsSlice.reducer