#!/bin/sh
url="$1"
shift
base_url='http://browser:4444'
init_json='{
  "capabilities": {
    "alwaysMatch": {
      "acceptInsecureCerts": true,
      "moz:firefoxOptions": {
        "args": ["-headless", "-marionette"]
      }
    }
  }
}'
session_id=$(
  curl -fsSL -d "$init_json" "$base_url/session" |
  jq -r '.value.sessionId'
)
set_url_json=$(
  echo "$url" |
  jq -R '{"url": .}'
)
curl -fsSL -d "$set_url_json" "$base_url/session/$session_id/url" >/dev/null
curl -fsSL "$base_url/session/$session_id/source" | jq -r '.value'
curl -fsSL -X DELETE "$base_url/session/$session_id" > /dev/null
