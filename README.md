Opencast Video Editor
=====================

[![Build & Deploy](https://github.com/opencast/opencast-editor/workflows/Build%20&%20Deploy/badge.svg)
](https://github.com/opencast/opencast-editor/actions?query=workflow%3A%22Build+%26+Deploy%22)
[![Demo deployment](https://img.shields.io/badge/demo-editor.opencast.org-blue)
](https://editor.opencast.org)

The Opencast Video Editor is a tool included by [Opencast](https://opencast.org) to cut and arrange recordings.


Quick Test
----------

To test locally, run:

    npm start

This will start a local test server in the development mode.
Open [http://localhost:3000](localhost:3000) to view it in the browser.

The latest version connected to [develop.opencast.org](https://develop.opencast.org) is also publicly available
at [editor.opencast.org](https://editor.opencast.org).

To open a specific event with the editor, use the GET-Parameter `id` like so: `https://editor.opencast.org/?id=27cd7156-fda6-4b31-aab5-d56833012caf`.


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
---------------------------------

1. Switch to the commit you want to turn into the release
2. Create and push a new tag
   ```
   git tag -s 2021-11-27
   git push upstream 2021-11-27:2021-11-27
   ```
3. Wait for the [Create release draft](https://github.com/opencast/opencast-editor/actions/workflows/create-release.yml)
   workflow to finish
    - It will create a new [GitHub release draft](https://github.com/opencast/opencast-editor/releases)
    - Review and publish the draft
4. Submit a pull request against Opencast
    - [Update the release](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/modules/editor/pom.xml#L16-L17)
    - [Adjust the documentation](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/docs/guides/admin/docs/modules/editor.md)
      if necessary
    - [Update the configuration](https://github.com/opencast/opencast/blob/b2bea8822b95b8692bb5bbbdf75c9931c2b7298a/etc/ui-config/mh_default_org/editor/editor-settings.toml)
      if necessary
    - Verify that the new release runs in Opencast, then create the pull request.

Opencast API used by the Editor
-------------

The editor accesses the following endpoints in Opencast:

* `/editor/<mediaPackageId>/edit.json`      (introduced in OC 9.3)
* `/editor/<mediaPackageId>/metadata.json`  (introduced in OC 9.4)

If you want to use current editor frontend with an earlier Opencast version, you will have to cherry pick the relevant commits from the Opencast repository yourself.


Translating the Editor
-------------
You can help translating the editor to your language on [crowdin.com/project/opencast-editor](https://crowdin.com/project/opencast-editor). Simply request to join the project on Crowdin and start translating. If you are interested in translating a language which is not a target language right now, please create [a GitHub issue](https://github.com/opencast/opencast-editor/issues) and we will add the language.


Configuration
-------------

### Configuration Methods

Most configuration options can be set either as a URL parameter or as an option in the configuration file.

If the option belongs to a section, URL parameters are a combination of section and option separated by a single dot.

For example, the following option in the configuration file:

```toml
[trackSelection]
show = true
```

…can be specified as URL parameter in the form `trackSelection.show=true`.

If an option can be specified both ways, the URL parameter will always take precedence.


### Settings

Options which are usually specified in the configuration file are documented in there as well. Metadata configuration options are only documented in the configuration file.

| Option              | URL | File | Description
| --------------------|-----|------|------------
| id                  | ✓   | ✓    | Id of the event that the editor should open by default.
| mediaPackageId      | ✓   | ✓    | Deprecated. Use `id` instead.
| opencast.url        | ✗   | ✓    | URL of the opencast server to connect to.
| opencast.name       | ✗   | ✓    | Opencast user to use. For demo purposes only.
| opencast.password   | ✗   | ✓    | Password to use for authentication. For demo purposes only.
| metadata.show       | ✓   | ✓    | Show metadata tab.
| trackSelection.show | ✓   | ✓    | Show track selection tab.
| thumbnail.show      | ✓   | ✓    | Show thumbnail tab. Demo only.
| debug               | ✓   | ✗    | Enable internationalization debugging.
| lng                 | ✓   | ✗    | Select a specific language. Use language codes like `de` or `en-US`.
