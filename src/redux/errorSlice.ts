import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IconType } from "react-icons";

interface error {
  error: boolean,
  errorTitle?: string,
  errorMessage: string,
  errorDetails?: string,
  errorIcon?: IconType,
}

const initialState: error = {
  error: false,
  errorTitle: "",
  errorMessage: "Unknown error",
  errorDetails: "",
  errorIcon: undefined,
};

/**
 * Slice for the error page state
 */
export const errorSlice = createSlice({
  name: "errorState",
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<{
      error: error["error"],
      errorTitle?: error["errorTitle"],
      errorMessage: error["errorMessage"],
      errorDetails?: error["errorDetails"],
      errorIcon?: error["errorIcon"];
    }>) => {
      state.error = action.payload.error;
      state.errorTitle = action.payload.errorTitle;
      state.errorMessage = action.payload.errorMessage;
      state.errorDetails = action.payload.errorDetails;
      state.errorIcon = action.payload.errorIcon;
    },
  }
});

export const { setError } = errorSlice.actions;

// Export Selectors
export const selectIsError = (state: { errorState: { error: error["error"]; }; }) =>
  state.errorState.error;
export const selectErrorTitle = (state: { errorState: { errorTitle: error["errorTitle"]; }; }) =>
  state.errorState.errorTitle;
export const selectErrorMessage = (state: { errorState: { errorMessage: error["errorMessage"]; }; }) =>
  state.errorState.errorMessage;
export const selectErrorDetails = (state: { errorState: { errorDetails: error["errorDetails"]; }; }) =>
  state.errorState.errorDetails;
export const selectErrorIcon = (state: { errorState: { errorIcon: error["errorIcon"]; }; }) =>
  state.errorState.errorIcon;

export default errorSlice.reducer;
