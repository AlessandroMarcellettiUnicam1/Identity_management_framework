#!/bin/bash


docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
NETWORK=$8
./networkDown.sh
if [ "$NETWORK" == "up" ] ; then

 ./startFabric.sh javascript "false"

fi

#docker network connect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
cd main
sleep 1
#./register.sh $1
#node harvestingManager.js launchDetections -n $1 -m $2 -s $3 -j $i -t $5 -d $6 &
cd ..
#docker network disconnect net_test $(docker ps -a -q --filter ancestor=prom/prometheus)
#./networkDown.sh
exit
