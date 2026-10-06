#!/bin/sh
# envsubst the ${VITE_*} placeholders in index.html from pod env.
# pops into the base image's /docker-entrypoint.d/ before nginx starts.

set -eu

SRC=/srv/static-source
DEST=/usr/share/nginx/html
INDEX=index.html

VARS='VITE_API_BASE_URL VITE_API_BASE_PATH VITE_DATAFORSYNING_TOKEN VITE_DATAFORDELER_TOKEN VITE_AUTH_URL VITE_AUTH_CLIENT_ID VITE_AUTH_AUDIENCE VITE_BIFROST_URL'

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

# catches placeholders that exist in index.html but aren't in $VARS
leftover=$(grep -oE '\$\{VITE_[A-Z0-9_]+\}' "$DEST/$INDEX" | sort -u | tr '\n' ' ')
if [ -n "$leftover" ]; then
  echo "envsubst-config: unsubstituted placeholders remain: $leftover" >&2
  exit 1
fi
