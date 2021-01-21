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

Furthermore, the current version of the editor can be found at

    editor.opencast.org

Which uses the Opencast backend running at

    pyca.opencast.org

To open a specific event with the editor, use the GET-Parameter `mediaPackageId` like so: `https://editor.opencast.org/?mediaPackageId=27cd7156-fda6-4b31-aab5-d56833012caf`.

Building the Editor
-------------------

To build the editor for production to the `build` folder, run:

    npm run build

To make the editor work in a sub-path, use:

    PUBLIC_URL=/path npm run build

Usage
------------------

To install the editor as an Opencast module from a github release, use the branch at

    https://github.com/Arnei/opencast/tree/deploy-editor-as-module.

:warning: There is no official release yet!

Configuration
-------------

The editor can be configured through the `editor-settings.toml` settings file. It can either be provided in the public folder when running locally or can be found under `etc/opencast/ui-config/mh_default_org/editor` when deployed in Opencast. More information can be found in the example configuration file.

Opencast API used by the Editor
-------------

The editor accesses the following endpoints in Opencast:

* `/editor/<mediaPackageId>/edit.json`

These endpoints are not part of Opencast 9, but instead currently only available at https://github.com/lwillmann/opencast/tree/editor-backend. If you want to use the editor with Opencast, your Opencast installation must have this branch.




