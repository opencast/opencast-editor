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
  },
  selectors: {
    selectIsError: state => state.error,
    selectErrorTitle: state => state.errorTitle,
    selectErrorMessage: state => state.errorMessage,
    selectErrorDetails: state => state.errorDetails,
    selectErrorIcon: state => state.errorIcon,
  },
});

export const { setError } = errorSlice.actions;

export const {
  selectIsError,
  selectErrorTitle,
  selectErrorMessage,
  selectErrorDetails,
  selectErrorIcon,
} = errorSlice.selectors;

export default errorSlice.reducer;
