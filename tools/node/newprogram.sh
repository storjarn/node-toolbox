#!/bin/sh

execpath=$(dirname $BASH_SOURCE)

function getTimestamp() {
    timestamp=$(date +%s);
    return $timestamp;
}

function generateHash() {
    hashstart=getTimestamp;
    hash=$(md5 -qs $hashstart);
    return $hash;
}

# Set up database user. Run this script immediately after cloning the codebase and before rake db:setup.

echo "\nYour program name:"
read programname;

echo "\nYour program location:"
read programloc;

if [[ -n "$programname" && -n "$programloc" ]]; then
    parts=("$programloc" "$programname");
    # printf -v path '/%s' "${parts[@]%/}";
    path="$programloc$programname"
    # sed 's|/\+|/|g' $path;
    path="$path".js
    echo "#!/usr/bin/env node \n\n(function(context, undefined){\n\n})(this);" > $path
    chmod 755 $path;
    ls -la $path;
else
    echo "\nYou must supply a program name!";
    exit 1;
fi;

