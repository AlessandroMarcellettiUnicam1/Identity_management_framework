#!/bin/bash

cd main
sleep 1
./register.sh $1
node analysisManager.js launchListener -n $1 -m $2 -f $4 -t $5 -p $7 &
WR=$!
sleep 1
for i in $(seq 1 1 $1)
do
    node harvestingManager.js launchDetections -n $1 -m $2 -s $3 -j $i -t $5 -d $6 &
done

wait $WR
