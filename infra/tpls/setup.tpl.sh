#!/bin/bash -xe

set -e # Exit on error

echo "Instance version ${version}"

echo "GITHUB_TOKEN=${GITHUB_TOKEN}" >> /etc/environment

# Install node
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt update
sudo apt install -y nodejs
sudo apt install -y jq

echo "Cloning repository"
git clone https://github.com/cristianoliveira/contract-testing-mux.git /home/ubuntu
cd /home/ubuntu

echo "Installing dependencies"
npm install

echo "Starting server"
export PORT=8080
node run start
