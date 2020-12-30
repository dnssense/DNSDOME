#!/bin/bash

set -e
cd angular
#npm install
npm run build-prod
read -p 'versiyon numarası giriniz:  ' version
cd ..
docker build -t ui.dnssense.stage .
docker tag ui.dnssense.stage registry.sea.net/dnssense/ui.dnssense.stage:$version

read -p "Do you wish to push this image? y/n " yn
case $yn in
[Yy]*) docker push registry.sea.net/dnssense/ui.dnssense.stage:$version ;;
[Nn]*) exit ;;
*) echo "Please answer yes or no." ;;
esac
