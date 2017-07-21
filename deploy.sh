#! /bin/bash
ROOTDIR=$(dirname $0)
ROOTDIR=$(realpath "$ROOTDIR")
cd $ROOTDIR/frontend
yarn build

cd "$ROOTDIR"

cp -r "$ROOTDIR/frontend/build/static/" "$ROOTDIR/backend/flownotebook/"
cp "$ROOTDIR/frontend/build/index.html" "$ROOTDIR/backend/flownotebook/templates/"
