Opencast Video Editor
=====================

[![Build & Deploy](https://github.com/elan-ev/opencast-editor/workflows/Build%20&%20Deploy/badge.svg)
](https://github.com/elan-ev/opencast-editor/actions?query=workflow%3A%22Build+%26+Deploy%22)
[![Demo deployment](https://img.shields.io/badge/demo-editor.opencast.org-blue)
](https://editor.opencast.org)

The Opencast Video Editor is a stand-alone tool included by [Opencast](https://opencast.org) to cut and arrange recordings.


Quick Test
----------

In the project directory, you can run:

    npm start

This will run the app in the development mode.
Open [http://localhost:3000](localhost:3000) to view it in the browser.


Building the Editor
-------------------

To build the editor for production to the `build` folder, run:

    npm run build

To make the editor work in a sub-path, use:

    PUBLIC_URL=/path npm run build
