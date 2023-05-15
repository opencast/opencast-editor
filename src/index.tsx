import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux'
import store from './redux/store'

import { init } from './config'
import { sleep } from './util/utilityFunctions'

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element');
const root = ReactDOMClient.createRoot(container);

// Load config here
// Load the rest of the application and try to fetch the settings file from the
// server.
const initialize = Promise.race([
  init(),
  sleep(300),
]);

const render = (body: JSX.Element) => {
  root.render(body);
};

initialize.then(

  () => {
    root.render(
      <React.StrictMode>
          <Provider store={store}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <App />
            </LocalizationProvider>
          </Provider>
      </React.StrictMode>
    );
  },

  // This error case is vey unlikely to occur.
  e => render(<p>
    {`Fatal error while loading app: ${e.message}`}
    <br />
    This might be caused by a incorrect configuration by the system administrator.
  </p>),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

