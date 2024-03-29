#!/bin/bash
result=${PWD##*/}
result=${result:-/}
if [ $result != "scripts" ]; then
    echo "You can only use this command from the 'scripts' folder!!"
    exit
fi
echo "removing 'node_modules' directories and 'package-lock' files..."
rm -rf ../node_modules ../apps/diegesis-server/node_modules ../apps/diegesis-user-client/node_modules/ ../apps/diegesis-upload-client/node_modules/
rm ../package-lock.json ../apps/diegesis-user-client/package-lock.json ../apps/diegesis-upload-client/package-lock.json ../apps/diegesis-server/package-lock.json
cd ..
set -e -u
echo "########################"
echo "installing modules..."
echo "########################"
npm i
echo "building the clients..."

cd apps/diegesis-user-client/
npm run build
cd ../diegesis-upload-client/
npm run build
