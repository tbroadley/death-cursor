#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

rm -rf dist 
mkdir dist

JS_FILE="$(tempfile)"
cat engine.all.js index.js > "$JS_FILE"

yarn google-closure-compiler \
	--js "$JS_FILE" \
	--js_output_file dist/index.js \
	--compilation_level ADVANCED \
	--language_out ECMASCRIPT_2019 \
	--warning_level VERBOSE \
	--jscomp_off '*'

sed 's/.*engine.all.js.*//' <index.html >dist/index.html

zip --junk-paths dist/dist.zip dist/index.html dist/index.js tiles.png favicon.ico
ect -9 -strip -zip dist/dist.zip

rm dist/index.js dist/index.html

ls -l dist
