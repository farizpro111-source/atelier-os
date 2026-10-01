#!/bin/sh
set -eu
PATH="/usr/bin:/bin:$PATH"
export PATH
target=${1:?Usage: ROLLBACK.sh target-copy}
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
test -f "$target" || { echo 'Target copy missing' >&2; exit 1; }
cp "$here/BASELINE_FILE" "$target"
