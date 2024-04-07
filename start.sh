#!/bin/bash
set -e

## Check for jq
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

function close_childs_on {
  echo "Killing all processes"
  cat $PWD/proxy.pid | xargs kill | echo "nothing to kill"
  rm -f $PWD/proxy.pid
}

trap close_childs_on EXIT

# Load files from proxy.json and store the pids in proxy.pid
rm -f $PWD/proxy.pid
for i in $(jq -r '.providers[].name' proxy.json); do
  echo "Starting proxy for $i"
  ## get the file and port from { "name": "file", "port": "port" }
  file=$(jq -r --arg i $i '.providers[] | select(.name == $i) | .openapiFile' proxy.json)
  port=$(jq -r --arg i $i '.providers[] | select(.name == $i) | .port' proxy.json)

  echo "npm run prism:mock -d $file -p $port"
  bash -c "npm run prism:mock -- -d $file -p $port & echo \$! >> $PWD/proxy.pid"
done

npm run proxy:serve
