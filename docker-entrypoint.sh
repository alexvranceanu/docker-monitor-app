#!/bin/bash -x
set -e

echo "$0"

# Test if first character from the first argument is a dash (eg: -r)
if [ "${1:0:1}" = '-' ]; then
    set -- python3 /opt/docker-socket-monitor.py "$@"
else
    set -- python3 "$@"
fi

exec "$@"