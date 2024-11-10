#!/bin/bash

echo "----- DEBUG -----"
# find out current dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "was executed in $DIR"

ls -al
echo "----- DEBUG -----"

echo "--- executing $1 in background ---"
$1 &

echo "--- executing custom http runtime ---"
$DIR/main
