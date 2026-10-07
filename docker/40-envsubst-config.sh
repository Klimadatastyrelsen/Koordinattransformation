#!/bin/sh
# envsubst the ${VITE_*} placeholders in index.html from pod env.
# pops into the base image's /docker-entrypoint.d/ before nginx starts.

set -eu

SRC=/srv/static-source
DEST=/usr/share/nginx/html
INDEX=index.html

# every placeholder in index.html is required
VARS=$(grep -oE '\$\{VITE_[A-Z0-9_]+\}' "$SRC/$INDEX" | tr -d '${}' | sort -u)

missing=
for name in $VARS; do
  eval "val=\${$name:-__UNSET__}"
  [ "$val" = "__UNSET__" ] && missing="$missing $name"
done
if [ -n "$missing" ]; then
  echo "envsubst-config: missing or empty required env:$missing" >&2
  exit 1
fi

# /usr/share/nginx/html is an emptyDir, fresh each start
cp -r "$SRC"/. "$DEST"/

ALLOWLIST=$(printf '${%s} ' $VARS)
tmp=$(mktemp)
envsubst "$ALLOWLIST" < "$DEST/$INDEX" > "$tmp"
mv "$tmp" "$DEST/$INDEX"
