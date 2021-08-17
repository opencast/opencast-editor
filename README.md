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


Configuration
-------------

The editor can be configured through the `editor-settings.toml` settings file. It can either be provided in the public folder when running locally or can be found under `etc/opencast/ui-config/mh_default_org/editor` when deployed in Opencast. More information can be found in the example configuration file.

How to cut a release for Opencast
-------------
- Run `build-release.sh` in the root folder
- Upload the archive as a new release to GitHub
  - Release tag is the current date (year-month-day)
  - Check the commit history for notable changes and list them as a release comment
- Create an pull request against Opencast
  - In your Opencast, replace the url the `editor.url` in `modules/editor/pom.xml` with a url that points to the archive file in your new release
  - Build the editor module with `mvn install`. Observe the error message and replace the old sha256 value in `editor.sha256` with the new value in the error message. Build again to see if it worked.
  - Check if you need to add any new config values to `etc/ui-config/mh_default_org/editor/editor-settings.toml`. Do not add the debug values.
  - Verify that the new release runs in Opencast, then create the pull request.

Opencast API used by the Editor
-------------

The editor accesses the following endpoints in Opencast:

* `/editor/<mediaPackageId>/edit.json`      (introduced in OC 9.3)
* `/editor/<mediaPackageId>/metadata.json`  (introduced in OC 9.4)

If you want to use current editor frontend with an earlier Opencast version, you will have to cherry pick the relevant commits from the Opencast repository yourself.


Translating the Editor
-------------
You can help translating the editor to your language on [crowdin.com/project/opencast-editor](https://crowdin.com/project/opencast-editor). Simply request to join the project on Crowdin and start translating. If you are interested in translating a language which is not a target language right now, please create [a GitHub issue](https://github.com/elan-ev/opencast-editor/issues) and we will add the language.
