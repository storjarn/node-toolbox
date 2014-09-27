#!/bin/sh

echo "\nDownload from what page?:"
read pageUrl;

echo "\nDownload to what directory?:"
read dlDir;

echo "\nLimit to what extensions? (comma-delimited):"
read exts;

wget -r -l 1 -nd -nH -A $exts -P $dlDir $pageUrl
