#!/bin/bash

OIFS="$IFS"
IFS=$'\n'

SOURCE=$1
DEST=`pwd`/app/static/icons

cd $SOURCE

for item in `find . -name 'White.png'`
do
  echo $item
  # echo $item | sed s_\\\./__g | sed s_/White__g | sed 's/ /_/g'
  cp $item $DEST/`echo $item | sed s_\\\./__g | sed s_/White__g | sed 's/ /_/g'`
done


cd -
