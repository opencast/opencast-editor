#!/bin/bash

# Build integrated version
rm -rf build/
export PUBLIC_URL=/editor-ui
export VITE_APP_SETTINGS_PATH="/ui/config/editor/editor-settings.toml"
npm run build

FILENAME="oc-editor-$(git describe --tags).tar.gz"
cd build
TMP="$(mktemp)"
mv editor-settings.toml "$TMP"
tar -czf ../$FILENAME *
mv "$TMP" editor-settings.toml
