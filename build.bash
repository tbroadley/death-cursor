#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

rm -rf dist 
mkdir dist

zip dist/dist.zip index.html index.js engine.all.js tiles.png
ect -9 -strip -zip dist/dist.zip

ls -l dist/dist.zip
