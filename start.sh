#!/bin/bash
set -e

## Check for jq
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.' >&2
  exit 1
fi

## Check environment variables
if [ -z "$GITHUB_TOKEN" ]; then
  echo 'Error: GITHUB_TOKEN is not set.' >&2
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
for name in $(jq -r '.providers[].name' proxy.json); do
  echo "Starting proxy for $name"
  provider=$(jq -r --arg name $name '.providers[] | select(.name == $name)' proxy.json)
  file=$(echo $provider | jq -r '.file')
  port=$(echo $provider | jq -r '.port')

  # if contains property "git" (object {repo, path, tag}) then download the file 
  if [ $(echo $provider | jq -r 'has("git")') == "true" ]; then
    # fail if missing GITHUB_TOKEN
    token=${GITHUB_TOKEN:?"For git configs GITHUB_TOKEN is required"}
    mkdir -p "./providers"

    git=$(echo $provider | jq -r '.git')
    repo=$(echo $git | jq -r '.repo')
    path=$(echo $git | jq -r '.path')
    tag=$(echo $git | jq -r '.tag')

    fullpath="$PWD/providers/$name/$path"
    dir=$(dirname $fullpath)
    mkdir -p $dir

    echo "Downloading $dir from $repo"

    echo "https://raw.githubusercontent.com/$repo/$tag/$path"
    curl -v -s -L -o "$fullpath" \
      "https://raw.githubusercontent.com/$repo/$tag/$path" \
      -H "Authorization: token $token"
    file=$fullpath
  fi

  if [ "$PROCESS" == "1" ]; then
    echo "npm run prism:mock -d $file -p $port"
    bash -c "npm run prism:mock -- -d $file -p $port & echo \$! >> $PWD/proxy.pid"
  fi
done

npm run proxy:serve
