#!/bin/sh

mkdir -p build
touch build/.gdignore
godot --headless --export-release Web
