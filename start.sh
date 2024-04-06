#!/bin/bash

# Load files from proxy.json
for i in $(jq -r '.providers[].name' proxy.json); do
  echo "Starting proxy for $i"
  ## get the file and port from { "name": "file", "port": "port" }
  file=$(jq -r --arg i $i '.providers[] | select(.name == $i) | .openapiFile' proxy.json)
  port=$(jq -r --arg i $i '.providers[] | select(.name == $i) | .port' proxy.json)

  echo "npm run mock -d $file -p $port"
  npm run mock -- -d $file -p $port &
done

npm run start
