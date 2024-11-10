#!/bin/bash

echo "----- DEBUG -----"
# find out current dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "was executed in $DIR"

ls -al
echo "----- DEBUG -----"

echo "--- executing *internal* in background ---"
# If the _HANDLER environment variable is set, use its value as the command to execute
prefix="/var/task/"
CMD=${_HANDLER:-"internal"}

echo "--- executing ${prefix}$CMD in background ---"
${prefix}$CMD &

echo "--- executing custom http runtime ---"
$DIR/main
