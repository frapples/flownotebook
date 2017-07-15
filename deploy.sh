#! /bin/bash
ROOTDIR=$(dirname $0)
cd $ROOTDIR/frontend
yarn build

cd $ROOTDIR

cp -r $ROOTDIR/frontend/build/static/ $ROOTDIR/backend/
cp $ROOTDIR/frontend/build/index.html $ROOTDIR/backend/templates/
