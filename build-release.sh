#!/bin/bash

# Build integrated version
rm -rf build/
export PUBLIC_URL=/klipping
export REACT_APP_SETTINGS_PATH="/ui/config/editor/editor-settings.toml"
npm run build

FILENAME="oc-editor-$(date --utc +%F).tar.gz"
cd build
tar -czf ../$FILENAME *
cd ..